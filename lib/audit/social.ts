import type { SocialProfile } from '@/types/lead'

const PLATFORMS: { platform: string; re: RegExp; kind: SocialProfile['kind'] }[] = [
  { platform: 'Facebook', re: /(facebook\.com|fb\.com)/i, kind: 'social' },
  { platform: 'Instagram', re: /instagram\.com/i, kind: 'social' },
  { platform: 'TikTok', re: /tiktok\.com/i, kind: 'social' },
  { platform: 'LinkedIn', re: /linkedin\.com/i, kind: 'social' },
  { platform: 'X / Twitter', re: /(twitter\.com|\/\/(www\.)?x\.com)/i, kind: 'social' },
  { platform: 'YouTube', re: /youtube\.com/i, kind: 'social' },
  { platform: 'Pinterest', re: /pinterest\.com/i, kind: 'social' },
  { platform: 'Yelp', re: /yelp\.com\/biz/i, kind: 'directory' },
  { platform: 'Nextdoor', re: /nextdoor\.com/i, kind: 'directory' },
]

// Links like facebook.com/groups/... or instagram.com/p/... are posts, not the business's own page.
const NON_PROFILE_RE = /\/(groups|events|posts|p|reel|watch|hashtag|explore|search|sharer|share|photo|story)(\/|$)/i

const GENERIC_WORDS = new Set([
  'the', 'and', 'llc', 'inc', 'co', 'company', 'corp', 'ltd', 'services', 'service', 'group', 'of', 'a', '&',
])

export function platformFor(url: string): { platform: string; kind: SocialProfile['kind'] } | null {
  if (NON_PROFILE_RE.test(url.replace(/^https?:\/\/[^/]+/, ''))) return null
  const hit = PLATFORMS.find((p) => p.re.test(url))
  return hit ? { platform: hit.platform, kind: hit.kind } : null
}

function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !GENERIC_WORDS.has(t))
}

/** True when a search result looks like it belongs to this business (avoids crediting a competitor's page). */
export function resultMatchesBusiness(businessName: string, title: string, link: string): boolean {
  const tokens = nameTokens(businessName)
  if (tokens.length === 0) return false
  const haystack = `${title} ${link}`.toLowerCase().replace(/[^a-z0-9]/g, '')
  const hits = tokens.filter((t) => haystack.includes(t)).length
  return hits >= Math.ceil(tokens.length / 2)
}

/** Pulls "1.2K followers" / "345 likes" out of a search snippet. */
export function parseFollowers(snippet: string): number | null {
  const m = snippet.match(/([\d][\d,.]*)\s*([KkMm])?\s+(followers|likes|people like this)/)
  if (!m) return null
  let n = parseFloat(m[1].replace(/,/g, ''))
  if (Number.isNaN(n)) return null
  if (m[2]?.toLowerCase() === 'k') n *= 1_000
  if (m[2]?.toLowerCase() === 'm') n *= 1_000_000
  return Math.round(n)
}

export interface SocialAudit {
  profiles: SocialProfile[]
  searched: boolean
}

/**
 * Finds the business's social pages: links on its own website, plus a Serper (Google) search.
 * Never throws.
 */
export async function auditSocial(businessName: string, city: string, websiteSocialLinks: string[]): Promise<SocialAudit> {
  const byPlatform = new Map<string, SocialProfile>()

  for (const url of websiteSocialLinks) {
    const p = platformFor(url)
    if (p && !byPlatform.has(p.platform)) byPlatform.set(p.platform, { ...p, url, followers: null })
  }

  let searched = false
  if (process.env.SERPER_API_KEY) {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `"${businessName}" ${city} (facebook OR instagram OR tiktok OR yelp OR linkedin)`,
          num: 10,
        }),
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        searched = true
        const data = await res.json()
        for (const r of (data.organic ?? []) as { title?: string; link?: string; snippet?: string }[]) {
          if (!r.link) continue
          const p = platformFor(r.link)
          if (!p) continue
          if (!resultMatchesBusiness(businessName, r.title ?? '', r.link)) continue

          const followers = parseFollowers(`${r.title ?? ''} ${r.snippet ?? ''}`)
          const existing = byPlatform.get(p.platform)
          if (existing) {
            if (existing.followers == null && followers != null) existing.followers = followers
          } else {
            byPlatform.set(p.platform, { ...p, url: r.link, followers })
          }
        }
      }
    } catch {
      // search failed — fall back to whatever the website linked to
    }
  }

  return { profiles: Array.from(byPlatform.values()), searched }
}
