import type { PlaceResult } from '@/types/lead'

function normalizeName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(llc|inc|co|corp|ltd)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function mergeAndDedupePlaces(googlePlaces: PlaceResult[], osmPlaces: PlaceResult[]): PlaceResult[] {
  const seen = new Set<string>()

  for (const place of googlePlaces) {
    const key = normalizeName(place.displayName.text)
    if (key) seen.add(key)
  }

  const keptOsmPlaces: PlaceResult[] = []
  for (const place of osmPlaces) {
    const key = normalizeName(place.displayName.text)
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    keptOsmPlaces.push(place)
  }

  return [...googlePlaces, ...keptOsmPlaces]
}
