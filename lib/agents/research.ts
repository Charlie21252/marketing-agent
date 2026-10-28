import { auditWebsite, type WebsiteAudit } from '@/lib/audit/website'
import { auditSocial } from '@/lib/audit/social'
import { profileFromPlace, scoreMarketing, type ScoreResult } from '@/lib/scorer'
import type { GoogleProfile, LeadSource, PlaceResult, SocialProfile } from '@/types/lead'

export interface ResearchResult extends ScoreResult {
  website: WebsiteAudit
  socialProfiles: SocialProfile[]
  googleProfile: GoogleProfile | null
  ownerName: string | null
  contactEmail: string | null
  sources: LeadSource[]
}

export function cityFromAddress(address?: string): string {
  const parts = address?.split(',') ?? []
  return parts.length >= 2 ? parts[parts.length - 2].trim() : ''
}

export function categoryFromPlace(place: PlaceResult): string {
  return place.types?.[0]?.replace(/_/g, ' ') ?? 'local business'
}

async function findOwner(businessName: string, city: string): Promise<{ ownerName: string | null; email: string | null }> {
  if (!process.env.SERPER_API_KEY) return { ownerName: null, email: null }
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `"${businessName}" "${city}" owner`, num: 5 }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return { ownerName: null, email: null }
    const data = await res.json()
    const snippets: string[] = [
      ...(data.organic ?? []).map((r: { snippet?: string }) => r.snippet ?? ''),
      ...(data.knowledgeGraph?.description ? [data.knowledgeGraph.description] : []),
    ]
    let ownerName: string | null = null
    let email: string | null = null
    for (const s of snippets) {
      const m = s.match(/(?:owner|founder|president|proprietor|operated by)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/)
      if (m) { ownerName = m[1]; break }
    }
    for (const s of snippets) {
      const m = s.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
      if (m) { email = m[0]; break }
    }
    return { ownerName, email }
  } catch {
    return { ownerName: null, email: null }
  }
}

/**
 * Agent 2 — audits the business's whole marketing footprint:
 * website, social pages, Google listing, branding and promo/print signals.
 */
export async function researchLead(place: PlaceResult): Promise<ResearchResult> {
  const businessName = place.displayName.text
  const city = cityFromAddress(place.formattedAddress)
  const sources: LeadSource[] = []

  // The website feeds the social audit (its social links), so it runs first;
  // the owner search is independent and runs alongside.
  const [website, owner] = await Promise.all([auditWebsite(place.websiteUri), findOwner(businessName, city)])
  const social = await auditSocial(businessName, city, website.socialLinks)
  const googleProfile = profileFromPlace(place)

  const scored = scoreMarketing({
    hasWebsite: !!place.websiteUri,
    website,
    socialProfiles: social.profiles,
    googleProfile,
    category: categoryFromPlace(place),
  })

  const placeLabel = place.id.startsWith('osm:') ? 'OpenStreetMap (Overpass API)' : 'Google Maps Places API'
  sources.push({ field: 'businessName', source: placeLabel })
  if (place.formattedAddress) sources.push({ field: 'address', source: placeLabel })
  if (place.internationalPhoneNumber) sources.push({ field: 'phone', source: placeLabel })
  if (place.websiteUri) sources.push({ field: 'url', source: placeLabel })
  if (googleProfile) sources.push({ field: 'googleProfile', source: place.savedProfile ? 'Saved Google Places data' : 'Google Maps Places API' })
  if (website.loaded)
    sources.push({
      field: 'website / branding / promo',
      source: `${website.method === 'playwright' ? 'Playwright render' : 'HTTP fetch'} of ${place.websiteUri}`,
    })
  if (website.socialLinks.length) sources.push({ field: 'socialProfiles', source: 'Links on business website' })
  if (social.searched) sources.push({ field: 'socialProfiles', source: `Serper search: "${businessName}" ${city} social` })
  if (owner.ownerName) sources.push({ field: 'ownerName', source: `Serper search: "${businessName} ${city} owner"` })

  let contactEmail = website.emails[0] ?? null
  if (contactEmail) sources.push({ field: 'contactEmail', source: 'Business website' })
  else if (owner.email) {
    contactEmail = owner.email
    sources.push({ field: 'contactEmail', source: 'Serper search snippet' })
  }

  return {
    ...scored,
    website,
    socialProfiles: social.profiles,
    googleProfile,
    ownerName: owner.ownerName,
    contactEmail,
    sources,
  }
}
