import { NextResponse } from 'next/server'
import { z } from 'zod'
import { researchLead } from '@/lib/agents/research'
import { formatLead } from '@/lib/agents/format'
import { MAX_LEAD_SCORE } from '@/lib/scorer'
import { geocodeZip, boundingBoxFor, distanceMiles, ZIP_RE, type SearchArea } from '@/lib/sources/geocode'
import { fetchOsmPlaces } from '@/lib/sources/osm'
import { mergeAndDedupePlaces } from '@/lib/sources/dedupe'
import { chainReason, multiLocationNames, normalizeBusinessName } from '@/lib/sources/chains'
import { isDemoMode } from '@/lib/demoData'
import { connectDB } from '@/lib/mongodb'
import type { PlaceResult } from '@/types/lead'

// Run long batches without the route timing out.
export const maxDuration = 300

const SEARCH_RADIUS_MILES = 20

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.types',
  'places.businessStatus',
  'places.location',
  // Google Business Profile signals used by the marketing audit
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.regularOpeningHours',
  'places.editorialSummary',
  'nextPageToken',
].join(',')

async function fetchPlaces(textQuery: string, area: SearchArea, count: number): Promise<PlaceResult[]> {
  // Text Search only accepts a rectangle as a hard limit, so search the box around
  // the circle and trim the corners afterwards.
  const box = boundingBoxFor(area)
  const allPlaces: PlaceResult[] = []
  let pageToken: string | undefined

  for (let page = 0; page < 3 && allPlaces.length < count; page++) {
    const body: Record<string, unknown> = {
      textQuery,
      pageSize: Math.min(20, count),
      locationRestriction: {
        rectangle: {
          low: { latitude: box.south, longitude: box.west },
          high: { latitude: box.north, longitude: box.east },
        },
      },
    }
    if (pageToken) body.pageToken = pageToken

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Google Places API error ${res.status}: ${text}`)
    }

    const data = await res.json()
    allPlaces.push(...((data.places ?? []) as PlaceResult[]))
    pageToken = data.nextPageToken
    if (!pageToken) break
  }

  return allPlaces.slice(0, count)
}

const RequestSchema = z.object({
  keyword: z.string().min(1),
  zip: z.string().trim().regex(ZIP_RE, 'Enter a 5-digit US zip code'),
  count: z.number().int().min(1).max(50).default(10),
})

/** Agent 1 — finds local businesses, then runs Agents 2 and 3 on each one. */
export async function POST(req: Request) {
  try {
    if (isDemoMode()) {
      return NextResponse.json(
        { error: 'Demo mode is on — set DEMO_MODE=false in .env.local to run real searches.' },
        { status: 400 }
      )
    }

    const parsed = RequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Fail fast before spending on Google/Serper/Claude if leads can't be saved.
    try {
      await connectDB()
    } catch (err) {
      return NextResponse.json(
        { error: `Can't reach the database, so no search was run: ${err instanceof Error ? err.message : 'unknown error'}` },
        { status: 503 }
      )
    }

    const { keyword, zip, count } = parsed.data
    const warnings: string[] = []
    // Google's top results skew toward well-marketed businesses, so look deeper.
    // One Places page holds 20 results for the same price as fewer.
    const poolSize = Math.max(count * 5, 20)

    const center = await geocodeZip(zip)
    if (!center) {
      return NextResponse.json({ error: `Couldn't find zip code ${zip}. Check it and try again.` }, { status: 400 })
    }
    const area: SearchArea = { ...center, radiusMiles: SEARCH_RADIUS_MILES }

    const [googlePlaces, osmPlaces] = await Promise.all([
      fetchPlaces(keyword, area, poolSize),
      fetchOsmPlaces(keyword, area, poolSize),
    ])

    const withinRadius = (p: PlaceResult) =>
      !p.location ||
      distanceMiles(area.lat, area.lng, p.location.latitude, p.location.longitude) <= SEARCH_RADIUS_MILES

    const merged = mergeAndDedupePlaces(googlePlaces, osmPlaces).filter(withinRadius)
    const multiLocation = multiLocationNames(merged)
    let skippedChains = 0
    const candidates = merged.filter((p) => {
      const isChain = chainReason(p) !== null || multiLocation.has(normalizeBusinessName(p.displayName.text))
      if (isChain) skippedChains++
      return !isChain
    })

    const leads = []
    const errors: string[] = []
    let skippedStrong = 0
    const skipped: { name: string; score: number }[] = []

    for (const place of candidates) {
      if (leads.length >= count) break
      try {
        const research = await researchLead(place)
        // Only keep businesses whose marketing is weak enough to be worth pitching.
        if (research.score > MAX_LEAD_SCORE) {
          skippedStrong++
          skipped.push({ name: place.displayName.text, score: research.score })
          continue
        }
        leads.push(await formatLead(place, research, keyword))
      } catch (err) {
        errors.push(`${place.displayName.text}: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }

    return NextResponse.json({ found: leads.length, skippedStrong, skippedChains, skipped, leads, errors, warnings })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
