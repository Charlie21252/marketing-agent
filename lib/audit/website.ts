import { USER_AGENT } from '@/lib/sources/userAgent'

export interface WebsiteAudit {
  /** true if we loaded the page (via Playwright or plain fetch) */
  loaded: boolean
  method: 'playwright' | 'fetch' | null
  hasSSL: boolean
  hasMobileViewport: boolean
  hasContactForm: boolean
  hasBookingCta: boolean
  hasNewsletter: boolean
  hasPromo: boolean
  promoExamples: string[]
  hasLogo: boolean
  hasFavicon: boolean
  hasOgImage: boolean
  hasMetaDescription: boolean
  copyrightYear: number | null
  navLinkCount: number
  socialLinks: string[]
  emails: string[]
}

export const EMPTY_WEBSITE_AUDIT: WebsiteAudit = {
  loaded: false,
  method: null,
  hasSSL: false,
  hasMobileViewport: false,
  hasContactForm: false,
  hasBookingCta: false,
  hasNewsletter: false,
  hasPromo: false,
  promoExamples: [],
  hasLogo: false,
  hasFavicon: false,
  hasOgImage: false,
  hasMetaDescription: false,
  copyrightYear: null,
  navLinkCount: 0,
  socialLinks: [],
  emails: [],
}

export const SOCIAL_DOMAIN_RE =
  /(facebook\.com|fb\.com|instagram\.com|tiktok\.com|linkedin\.com|twitter\.com|x\.com|youtube\.com|pinterest\.com|yelp\.com|nextdoor\.com)/i

const PROMO_RE =
  /\b(coupons?|specials?|promo(?:tion)?s?|discounts?|deals?|% off|\$\d+ off|free estimate|flyers?|brochures?|gift cards?|loyalty|refer a friend|referral)\b/gi

const BOOKING_RE =
  /\b(book now|book online|book an appointment|schedule (?:now|online|an appointment|service)|request a quote|get a quote|free quote|get an estimate|request (?:an )?estimate|order online|reserve)\b/i

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&copy;|&#169;/g, '©')
    .replace(/\s+/g, ' ')
}

/** Pure analysis of a page's HTML — no network. */
export function analyzeHtml(html: string, url: string): Omit<WebsiteAudit, 'loaded' | 'method'> {
  const lower = html.toLowerCase()
  const text = stripTags(html)

  const hrefs = Array.from(html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)).map((m) => m[1])

  const socialLinks = Array.from(
    new Set(
      hrefs
        .filter((h) => /^https?:\/\//i.test(h) && SOCIAL_DOMAIN_RE.test(h))
        // skip share-button links, which point at the share tool rather than the business's page
        .filter((h) => !/sharer|share\?|intent\/tweet|shareArticle|\/plugins\//i.test(h))
        .map((h) => h.split('?')[0].replace(/\/$/, ''))
    )
  )

  const emails = Array.from(
    new Set(
      [
        ...hrefs.filter((h) => h.toLowerCase().startsWith('mailto:')).map((h) => h.slice(7).split('?')[0]),
        ...(text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/gi) ?? []),
      ]
        .map((e) => e.trim().toLowerCase())
        .filter((e) => !/\.(png|jpe?g|gif|webp|svg)$/.test(e) && !e.includes('example.com') && !e.includes('sentry'))
    )
  ).slice(0, 3)

  const forms = html.match(/<form[\s\S]*?<\/form>/gi) ?? []
  const hasContactForm = forms.some((f) => /email|contact|message|phone|name=/i.test(f))
  const hasNewsletter =
    forms.some((f) => /type\s*=\s*["']email["']/i.test(f) && /newsletter|subscribe|sign ?up|mailing list/i.test(f)) ||
    /mailchimp|klaviyo|constantcontact|convertkit|list-manage\.com/i.test(lower)

  const promoMatches = Array.from(new Set((text.match(PROMO_RE) ?? []).map((m) => m.toLowerCase())))
  const pdfLinks = hrefs.filter((h) => /\.pdf($|\?)/i.test(h))
  const promoExamples = [...promoMatches, ...(pdfLinks.length ? [`${pdfLinks.length} PDF download(s)`] : [])].slice(0, 4)

  const imgTags = html.match(/<img[^>]*>/gi) ?? []
  const hasLogo =
    imgTags.some((t) => /logo/i.test(t)) ||
    /class\s*=\s*["'][^"']*logo[^"']*["']/i.test(html) ||
    /<svg[^>]*(id|class)\s*=\s*["'][^"']*logo/i.test(html)

  const yearMatch = text.match(/©\s*(?:copyright\s*)?(\d{4})/i) ?? text.match(/copyright\s*(?:©\s*)?(\d{4})/i)

  const navBlocks = html.match(/<(nav|header)[\s\S]*?<\/\1>/gi) ?? []
  const navLinkCount = navBlocks.reduce((n, block) => n + (block.match(/<a\s/gi)?.length ?? 0), 0)

  return {
    hasSSL: url.startsWith('https://'),
    hasMobileViewport: /<meta[^>]+name\s*=\s*["']viewport["'][^>]*content\s*=\s*["'][^"']+["']/i.test(html) ||
      /<meta[^>]+content\s*=\s*["'][^"']+["'][^>]*name\s*=\s*["']viewport["']/i.test(html),
    hasContactForm,
    hasBookingCta: BOOKING_RE.test(text) || /calendly|squareup\.com\/appointments|vagaro|booksy|schedulicity|housecallpro|jobber/i.test(lower),
    hasNewsletter,
    hasPromo: promoExamples.length > 0,
    promoExamples,
    hasLogo,
    hasFavicon: /<link[^>]+rel\s*=\s*["'][^"']*icon[^"']*["']/i.test(html),
    hasOgImage: /<meta[^>]+property\s*=\s*["']og:image["']/i.test(html),
    hasMetaDescription: /<meta[^>]+name\s*=\s*["']description["'][^>]*content\s*=\s*["'][^"']{10,}/i.test(html),
    copyrightYear: yearMatch ? parseInt(yearMatch[1]) : null,
    navLinkCount,
    socialLinks,
    emails,
  }
}

async function loadWithPlaywright(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
    try {
      const page = await browser.newPage({ userAgent: USER_AGENT })
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
      // Give JS-built sites (Wix, Squarespace) a moment to render their header/footer.
      await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {})
      const html = await page.content()
      return { html, finalUrl: page.url() }
    } finally {
      await browser.close().catch(() => {})
    }
  } catch {
    return null
  }
}

async function loadWithFetch(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    return { html: await res.text(), finalUrl: res.url || url }
  } catch {
    return null
  }
}

/** Loads the business's site and audits it. Never throws. */
export async function auditWebsite(url: string | undefined): Promise<WebsiteAudit> {
  if (!url) return EMPTY_WEBSITE_AUDIT

  const viaPlaywright = await loadWithPlaywright(url)
  const loaded = viaPlaywright ?? (await loadWithFetch(url))
  if (!loaded) return { ...EMPTY_WEBSITE_AUDIT, hasSSL: url.startsWith('https://') }

  return {
    loaded: true,
    method: viaPlaywright ? 'playwright' : 'fetch',
    ...analyzeHtml(loaded.html, loaded.finalUrl),
  }
}
