import type { PlaceResult } from '@/types/lead'
import { milesToMeters, type SearchArea } from './geocode'
import { getOsmCategoryMapping, type OsmTagFilter } from './osmCategories'
import { USER_AGENT } from './userAgent'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  tags?: Record<string, string>
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
}

function buildFilterClause(filter: OsmTagFilter, area: SearchArea): string {
  const around = `around:${Math.round(milesToMeters(area.radiusMiles))},${area.lat},${area.lng}`
  let clause = `nwr["${filter.key}"="${filter.value}"]`
  if (filter.extra) {
    clause += `["${filter.extra.key}"~"${filter.extra.valueRegex}"]`
  }
  return `${clause}(${around});`
}

export function buildOverpassQuery(filters: OsmTagFilter[], area: SearchArea, limit: number): string {
  const clauses = filters.map((f) => buildFilterClause(f, area)).join('\n  ')
  return `[out:json][timeout:25];\n(\n  ${clauses}\n);\nout tags center qt ${limit};`
}

export function mapOsmElementToPlace(el: OverpassElement, category: string): PlaceResult | null {
  const tags = el.tags
  if (!tags?.name) return null
  // OSM tags chain locations with a brand linked to Wikidata; independents almost never have one.
  if (tags['brand:wikidata']) return null

  const addrParts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'],
    [tags['addr:state'], tags['addr:postcode']].filter(Boolean).join(' '),
  ].filter((part) => part.trim().length > 0)

  // Nodes carry their own point; ways and relations get a center from `out center`.
  const lat = el.lat ?? el.center?.lat
  const lon = el.lon ?? el.center?.lon

  return {
    id: `osm:${el.type}/${el.id}`,
    displayName: { text: tags.name },
    formattedAddress: addrParts.length > 0 ? addrParts.join(', ') : undefined,
    internationalPhoneNumber: tags.phone ?? tags['contact:phone'],
    websiteUri: tags.website ?? tags['contact:website'],
    types: [category],
    location: lat !== undefined && lon !== undefined ? { latitude: lat, longitude: lon } : undefined,
  }
}

export async function fetchOsmPlaces(keyword: string, area: SearchArea, count: number): Promise<PlaceResult[]> {
  const categoryMapping = getOsmCategoryMapping(keyword)
  if (!categoryMapping) return []

  try {
    const overpassLimit = Math.min(count * 5, 60)
    const query = buildOverpassQuery(categoryMapping.filters, area, overpassLimit)

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) return []

    const data = await res.json()
    const elements: OverpassElement[] = data.elements ?? []

    const places: PlaceResult[] = []
    for (const el of elements) {
      const place = mapOsmElementToPlace(el, categoryMapping.category)
      if (place) places.push(place)
      if (places.length >= count) break
    }

    return places
  } catch {
    return []
  }
}
