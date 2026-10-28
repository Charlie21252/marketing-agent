import { USER_AGENT } from './userAgent'

const MIN_REQUEST_INTERVAL_MS = 1100
const METERS_PER_MILE = 1609.344
const EARTH_RADIUS_MILES = 3958.8

let lastNominatimCall = 0

export interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

/** A circle on the map: the zip code's center plus a search radius. */
export interface SearchArea {
  lat: number
  lng: number
  radiusMiles: number
}

export const ZIP_RE = /^\d{5}$/

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function milesToMeters(miles: number): number {
  return miles * METERS_PER_MILE
}

/** Straight-line distance between two points, in miles. */
export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a))
}

/** The smallest box that holds the search circle. */
export function boundingBoxFor(area: SearchArea): BoundingBox {
  const latDelta = area.radiusMiles / 69
  const lngDelta = area.radiusMiles / (69 * Math.cos((area.lat * Math.PI) / 180))
  return {
    south: area.lat - latDelta,
    north: area.lat + latDelta,
    west: area.lng - lngDelta,
    east: area.lng + lngDelta,
  }
}

/** Looks up the center point of a US zip code with OpenStreetMap's free geocoder. */
export async function geocodeZip(zip: string): Promise<{ lat: number; lng: number } | null> {
  const elapsed = Date.now() - lastNominatimCall
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
  }
  lastNominatimCall = Date.now()

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&countrycodes=us&format=jsonv2&limit=1`,
      {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const lat = Number(data[0].lat)
    const lng = Number(data[0].lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    return { lat, lng }
  } catch {
    return null
  }
}
