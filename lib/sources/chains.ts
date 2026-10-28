import type { PlaceResult } from '@/types/lead'

/**
 * Filters out chains, franchises and big businesses so leads are independent,
 * local shops that make their own marketing decisions.
 *
 * Four signals, from most to least certain:
 * 1. Known chain / franchise names (below).
 * 2. A website that points to a location page on a corporate site.
 * 3. The same business name showing up 3+ times in one search (many locations).
 * 4. Place types that are never small independents (supermarkets, banks, …).
 * OpenStreetMap results are also dropped when tagged with a brand (see osm.ts).
 */

const CHAIN_NAMES = [
  // Fast food & quick service
  "mcdonald'?s?", 'subway', 'burger king', "wendy'?s", 'taco bell', 'kfc', 'popeyes', "arby'?s", 'sonic drive',
  'jack in the box', "carl'?s jr", "hardee'?s", 'whataburger', 'in-n-out', 'white castle', 'steak n shake',
  "culver'?s", 'dairy queen', 'five guys', 'shake shack', 'smashburger', "freddy'?s", 'chick.fil.a',
  "raising cane'?s", "zaxby'?s", 'bojangles', 'wingstop', 'wing stop', 'buffalo wild wings', "portillo'?s",
  'chipotle', 'qdoba', "moe'?s southwest", 'taco john', 'del taco', 'el pollo loco', 'panda express',
  'noodles & company', 'noodles and company', 'panera', 'potbelly', "jimmy john'?s", "jersey mike'?s",
  'firehouse subs', "jason'?s deli", "mcalister'?s", 'which wich', 'au bon pain', 'sweetgreen',
  'chopt', 'tropical smoothie', 'smoothie king', 'jamba', 'robeks',
  // Pizza
  'domino', 'pizza hut', "papa john'?s", 'little caesars', "marco'?s pizza", "jet'?s pizza", 'papa murphy',
  "hungry howie'?s", 'mod pizza', 'blaze pizza', "giordano'?s", "lou malnati'?s", "rosati'?s", "aurelio'?s",
  "barnaby'?s", 'round table pizza', "sbarro", "cici'?s",
  // Coffee, donuts, dessert, bakery chains
  'starbucks', 'dunkin', 'tim hortons', 'caribou coffee', "peet'?s", 'dutch bros', "scooter'?s coffee",
  'biggby', 'the human bean', 'krispy kreme', 'shipley', 'einstein bros', 'bruegger', 'panera bread',
  'great harvest', 'nothing bundt', 'crumbl', 'insomnia cookies', 'great american cookies', 'cinnabon',
  "auntie anne'?s", 'wetzel', 'baskin', 'cold stone', 'marble slab', 'menchie', 'yogurtland', 'pinkberry',
  'orange leaf', 'sweet frog', "rita'?s italian ice", 'kilwins', "rocky mountain chocolate", 'see.?s candies',
  "andy'?s frozen custard", 'bahama buck', 'kona ice', 'edible arrangements',
  // Sit-down chains & chain bars
  "applebee'?s", "chili'?s", "tgi friday'?s", 'olive garden', 'red lobster', 'outback steakhouse', 'texas roadhouse',
  'longhorn steakhouse', 'red robin', 'cheesecake factory', "bj'?s restaurant", 'hooters', 'twin peaks',
  'yard house', 'world of beer', 'old chicago', 'granite city', 'miller.?s ale house', 'tilted kilt',
  'ihop', "denny'?s", 'cracker barrel', 'bob evans', 'perkins', 'first watch', 'waffle house',
  "eggs up grill", "another broken egg", 'snooze', 'the original pancake', "uncle julio'?s", 'chuy.?s',
  "on the border", 'p\\.?f\\.? chang', "maggiano'?s", 'carrabba', 'bonefish', "ruth'?s chris", 'morton.?s',
  'fogo de chao', 'benihana', "dave & buster'?s", 'topgolf', 'main event', 'chuck e\\.? cheese',
  'pinstripes', 'punch bowl social', 'bar louie',
  // Grocery, convenience, big retail
  '7-eleven', 'circle k', 'speedway', 'casey.?s', "wawa", 'sheetz', 'quiktrip', 'walmart',
  'costco', "sam'?s club", 'kroger', 'jewel.?osco', "mariano'?s", 'whole foods', "trader joe'?s", 'aldi',
  'meijer', 'publix', 'safeway', 'albertsons', 'hy-vee', 'cvs', 'walgreens', 'rite aid', 'dollar general',
  'family dollar', 'dollar tree', 'five below', 'home depot', "lowe'?s", 'menards', 'best buy', 'staples',
  'office depot', "kohl'?s", "macy'?s", 'tj ?maxx', 'marshalls', 'homegoods', 'ross dress', 'old navy',
  'the gap', 'h&m', 'forever 21', 'american eagle', 'hollister', 'gamestop', 'barnes & noble',
  'books.?a.?million', 'half price books', 'hobby lobby', 'joann', 'party city', 'spencer.?s',
  'hallmark', 'build-a-bear', 'toys.?r.?us', 'total wine', "binny'?s", 'bevmo', "spec'?s", 'abc fine wine',
  'goodwill', 'salvation army', "plato'?s closet", 'once upon a child', 'savers', 'value village',
  'kay jewelers', 'zales', 'jared the galleria', 'pandora', 'helzberg', 'petsmart', 'petco', 'pet supplies plus',
  'pet supermarket', 'chewy', '1-800-flowers', 'ftd', 'teleflora', 'trek bicycle', 'scheels',
  "dick'?s sporting", 'academy sports', 'bass pro', 'cabela',
  // Salons, spas, beauty
  'great clips', 'supercuts', 'sport clips', 'fantastic sams', 'cost cutters', 'hair cuttery', 'smartstyle',
  'regis salon', 'first choice haircutters', 'ulta', 'sephora', 'european wax', 'massage envy', 'hand & stone',
  'hand and stone', 'elements massage', 'massage heights', 'the joint chiropractic', 'drybar', 'amazing lash',
  'lash lounge', 'sola salon', 'my salon suite', 'salon lofts', 'phenix salon', 'image studios',
  'radiant waxing', 'waxing the city', 'woodhouse spa', 'massage luxe',
  // Fitness & studios
  'planet fitness', 'anytime fitness', 'la fitness', 'crunch fitness', "gold'?s gym", '24 hour fitness',
  'snap fitness', 'orangetheory', 'f45', 'pure barre', 'club pilates', 'corepower', 'yogasix', 'yoga six',
  'title boxing', 'cyclebar', 'stretchlab', 'row house', 'burn boot camp', 'lifetime fitness', 'life time fitness',
  'xsport', 'ymca', 'arthur murray', 'fred astaire dance', 'tiger rock', 'premier martial arts',
  'ata martial arts', 'ufc gym', '9round', 'workout anytime', 'eos fitness', 'chuze',
  // Auto
  'jiffy lube', 'valvoline', 'take 5', 'midas', 'meineke', 'firestone', 'goodyear', 'pep boys',
  'christian brothers automotive', 'monro', 'ntb', 'tire kingdom', 'discount tire', 'les schwab',
  "belle tire", 'mavis', 'big o tires', 'maaco', 'caliber collision', 'gerber collision', 'service king',
  'safelite', 'autozone', "o'?reilly auto", 'advance auto', 'napa auto', 'mister car wash', 'tommy.?s express',
  'zips car wash', 'quick quack', 'delta sonic', 'grease monkey', 'car-x', 'tuffy', 'aamco', 'cottman',
  // Pet services & misc franchises
  'banfield', 'vca animal', 'bluepearl', 'dogtopia', 'camp bow wow', 'the dog stop', 'woof gang',
  'dry cleaning express', 'martinizing', 'zoot', 'tide cleaners', 'ups store', 'fedex',
  'state farm', 'allstate', 'edward jones', 'h&r block', 'jackson hewitt', 'servpro', 'roto-rooter',
  'mr\\.? rooter', 'kumon', 'mathnasium', 'sylvan', 'huntington learning', 'the goddard school',
  'kiddie academy', 'kindercare', 'primrose school', 'la petite academy',
]

const CHAIN_RE = new RegExp(`(^|[^a-z])(${CHAIN_NAMES.join('|')})($|[^a-z])`, 'i')

// Google place types that are never small independents worth pitching.
const SKIP_TYPES = new Set([
  'lodging', 'hotel', 'gas_station', 'bank', 'atm', 'hospital', 'airport', 'supermarket', 'grocery_store',
  'department_store', 'shopping_mall', 'warehouse_store', 'convenience_store', 'pharmacy', 'drugstore',
  'car_dealer', 'casino', 'movie_theater', 'amusement_park', 'stadium', 'university', 'school',
  'primary_school', 'secondary_school', 'local_government_office', 'city_hall', 'post_office',
])

// Chain location pages look like brand.com/locations/naperville, brand.com/store/1234
// or locations.brand.com/il/naperville.
const CHAIN_WEBSITE_PATH_RE = /\/(locations?|stores?|store-locator|find-a-store|branches)\/[^/?#]+/i
const CHAIN_WEBSITE_HOST_RE = /^(locations?|stores?|local|find)\./i

function isChainLocationPage(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url)
    return CHAIN_WEBSITE_HOST_RE.test(hostname) || CHAIN_WEBSITE_PATH_RE.test(pathname)
  } catch {
    return false
  }
}

export function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\s+[-–|@:].*$/, '') // "Brand - Naperville", "Brand | Downtown"
    .replace(/[^a-z0-9\s&]/g, ' ')
    .replace(/\b(llc|inc|co|corp|ltd|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Why a place looks like a chain or big business, or null if it looks independent. */
export function chainReason(place: PlaceResult & { businessStatus?: string }): string | null {
  if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') return 'not operating'
  if (CHAIN_RE.test(place.displayName.text)) return 'known chain'
  if (place.types?.some((t) => SKIP_TYPES.has(t))) return 'big-business category'
  if (place.websiteUri && isChainLocationPage(place.websiteUri)) return 'website is a chain location page'
  return null
}

/** Names that appear at 3+ spots in one search: many locations, so almost certainly a chain. */
export function multiLocationNames(places: PlaceResult[], minLocations = 3): Set<string> {
  const counts = new Map<string, number>()
  for (const place of places) {
    const key = normalizeBusinessName(place.displayName.text)
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return new Set(Array.from(counts).filter(([, n]) => n >= minLocations).map(([name]) => name))
}
