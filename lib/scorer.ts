import type {
  Channel,
  ChannelScore,
  GoogleProfile,
  MarketingIssue,
  PlaceResult,
  ServiceRec,
  SocialProfile,
} from '@/types/lead'
import type { WebsiteAudit } from './audit/website'

/** Businesses scoring above this have decent marketing already and are skipped. */
export const MAX_LEAD_SCORE = 55

export const CHANNEL_MAX: Record<Channel, number> = {
  website: 25,
  social: 25,
  googleProfile: 20,
  branding: 15,
  promo: 15,
}

const STOREFRONT_RE =
  /(restaurant|cafe|bakery|salon|barber|spa|nail|florist|jewel|tattoo|gym|fitness|yoga|martial|store|shop|boutique|dry_clean|dentist|chiropract|veterinar|daycare|tutor)/i

export function profileFromPlace(place: PlaceResult): GoogleProfile | null {
  if (place.savedProfile !== undefined) return place.savedProfile
  // OSM-only listings carry none of this, so we can't judge their Google profile.
  if (place.id.startsWith('osm:')) return null
  return {
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    photoCount: place.photos?.length ?? 0,
    hasHours: !!place.regularOpeningHours,
    hasDescription: !!place.editorialSummary?.text,
  }
}

export interface ScoreInput {
  hasWebsite: boolean
  website: WebsiteAudit
  socialProfiles: SocialProfile[]
  googleProfile: GoogleProfile | null
  category: string
}

export interface ScoreResult {
  score: number
  channelScores: ChannelScore[]
  issues: MarketingIssue[]
  recommendedServices: ServiceRec[]
}

export function scoreMarketing(input: ScoreInput): ScoreResult {
  const { hasWebsite, website: w, socialProfiles, googleProfile: g } = input
  const issues: MarketingIssue[] = []
  const issue = (channel: Channel, text: string) => issues.push({ channel, text })

  // ── Website (25) ──────────────────────────────────────────────
  let website = 0
  if (!hasWebsite) {
    issue('website', 'No website')
  } else if (!w.loaded) {
    website = 8
    issue('website', "Website didn't load (broken or very slow)")
  } else {
    website = 25
    if (!w.hasMobileViewport) { website -= 8; issue('website', 'Website not mobile-friendly') }
    if (!w.hasContactForm && !w.hasBookingCta) { website -= 6; issue('website', 'No contact form or booking on website') }
    if (!w.hasSSL) { website -= 5; issue('website', 'Website not secure (no HTTPS)') }
    if (w.copyrightYear && w.copyrightYear < 2020) { website -= 4; issue('website', `Website looks outdated (© ${w.copyrightYear})`) }
    if (w.navLinkCount < 4) { website -= 2; issue('website', 'Very thin website (few pages)') }
  }

  // ── Social media (25) ─────────────────────────────────────────
  const socialPages = socialProfiles.filter((p) => p.kind === 'social')
  const platforms = new Set(socialPages.map((p) => p.platform))
  let social = platforms.size === 0 ? 0 : platforms.size === 1 ? 10 : platforms.size === 2 ? 18 : 25
  if (platforms.size === 0) {
    issue('social', 'No social media pages found')
  } else {
    const missing = ['Facebook', 'Instagram'].filter((p) => !platforms.has(p))
    if (missing.length) issue('social', `Not on ${missing.join(' or ')}`)
    const known = socialPages.map((p) => p.followers).filter((f): f is number => typeof f === 'number')
    const best = known.length ? Math.max(...known) : null
    if (best !== null && best < 300) {
      social = Math.max(0, social - 5)
      issue('social', `Small social following (${best.toLocaleString()} max)`)
    }
    if (hasWebsite && w.loaded && w.socialLinks.length === 0) {
      social = Math.max(0, social - 2)
      issue('social', "Website doesn't link to their social pages")
    }
  }

  // ── Google Business Profile (20) ──────────────────────────────
  let google = 10
  const googleChecked = g !== null
  if (g) {
    google = 0
    const photos = g.photoCount ?? 0
    // Places API returns at most 10 photos, so 10 means "10 or more".
    if (photos >= 5) google += 6
    else if (photos > 0) { google += 3; issue('googleProfile', `Only ${photos} photo${photos === 1 ? '' : 's'} on Google listing`) }
    else issue('googleProfile', 'No photos on Google listing')

    const reviews = g.reviewCount ?? 0
    if (reviews >= 50) google += 6
    else if (reviews >= 10) { google += 3; issue('googleProfile', `Only ${reviews} Google reviews`) }
    else issue('googleProfile', `Very few Google reviews (${reviews})`)

    if (g.rating != null) {
      if (g.rating >= 4.3) google += 4
      else if (g.rating >= 3.8) { google += 2; issue('googleProfile', `Google rating ${g.rating.toFixed(1)}★`) }
      else issue('googleProfile', `Low Google rating (${g.rating.toFixed(1)}★)`)
    }
    if (g.hasHours) google += 2
    else issue('googleProfile', 'No business hours on Google')
    if (g.hasDescription) google += 2
    else issue('googleProfile', 'No business description on Google')
  }

  // ── Branding (15) ─────────────────────────────────────────────
  let branding = 0
  if (!hasWebsite || !w.loaded) {
    issue('branding', 'No visible brand identity online (logo, colors)')
  } else {
    if (w.hasLogo) branding += 7
    else issue('branding', 'No logo on website')
    if (w.hasFavicon) branding += 3
    else issue('branding', 'No site icon (favicon)')
    if (w.hasOgImage) branding += 3
    else issue('branding', 'No branded preview image when shared')
    if (w.hasMetaDescription) branding += 2
  }

  // ── Promo & print (15) ────────────────────────────────────────
  let promo = 0
  if (w.hasPromo) promo += 6
  else issue('promo', 'No promotions, coupons or flyers found')
  if (w.hasNewsletter) promo += 5
  else issue('promo', 'No email list / newsletter signup')
  if (w.hasBookingCta) promo += 4
  else issue('promo', "No clear 'Book now' / 'Get a quote' call to action")

  const channelScores: ChannelScore[] = [
    { channel: 'website', score: website, max: CHANNEL_MAX.website, checked: true },
    { channel: 'social', score: social, max: CHANNEL_MAX.social, checked: true },
    { channel: 'googleProfile', score: google, max: CHANNEL_MAX.googleProfile, checked: googleChecked },
    { channel: 'branding', score: branding, max: CHANNEL_MAX.branding, checked: true },
    { channel: 'promo', score: promo, max: CHANNEL_MAX.promo, checked: true },
  ]

  const score = Math.max(0, Math.min(100, channelScores.reduce((n, c) => n + c.score, 0)))

  return {
    score,
    channelScores,
    issues,
    recommendedServices: recommendServices(channelScores, input),
  }
}

/** Picks up to 4 services to pitch, biggest gaps first. */
export function recommendServices(channelScores: ChannelScore[], input: ScoreInput): ServiceRec[] {
  const pct = (c: Channel) => {
    const s = channelScores.find((x) => x.channel === c)!
    return s.checked ? s.score / s.max : 1
  }
  const storefront = STOREFRONT_RE.test(input.category)
  const candidates: (ServiceRec & { gap: number })[] = []

  if (pct('website') < 0.6)
    candidates.push({
      key: 'website',
      label: 'Website / landing page',
      reason: input.hasWebsite ? 'Current site is weak on mobile or has no way to get in touch' : 'No website at all',
      gap: 1 - pct('website'),
    })
  if (pct('social') < 0.6)
    candidates.push({
      key: 'social',
      label: 'Social media setup & content',
      reason: input.socialProfiles.some((p) => p.kind === 'social') ? 'Thin or missing social presence' : 'No social pages found',
      gap: 1 - pct('social'),
    })
  if (pct('googleProfile') < 0.6)
    candidates.push({
      key: 'googleProfile',
      label: 'Google Business Profile cleanup',
      reason: 'Few photos/reviews or missing info on Google',
      gap: 1 - pct('googleProfile'),
    })
  if (pct('branding') < 0.5) {
    candidates.push({
      key: 'brandKit',
      label: 'Logo & brand kit',
      reason: 'No consistent logo or brand look online',
      gap: 1 - pct('branding'),
    })
    candidates.push({
      key: 'businessCards',
      label: 'Business cards',
      reason: 'No brand assets online — likely no professional cards either',
      gap: 1 - pct('branding') - 0.05,
    })
  }
  if (pct('promo') < 0.5) {
    candidates.push({
      key: 'flyers',
      label: storefront ? 'Flyers & in-store promo cards' : 'Flyers & door hangers',
      reason: 'No promotions or offers running',
      gap: 1 - pct('promo'),
    })
    if (pct('promo') < 0.3)
      candidates.push({
        key: 'emailMarketing',
        label: 'Email list & promo mailers',
        reason: 'No way to capture or re-market to customers',
        gap: 1 - pct('promo') - 0.1,
      })
  }
  if (storefront && pct('branding') < 0.5 && pct('googleProfile') < 0.6)
    candidates.push({
      key: 'signage',
      label: 'Storefront signage & window display',
      reason: 'Storefront business with weak visual branding',
      gap: 0.5,
    })

  return candidates
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4)
    .map(({ key, label, reason }) => ({ key, label, reason }))
}
