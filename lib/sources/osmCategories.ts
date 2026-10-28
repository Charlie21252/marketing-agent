export interface OsmTagFilter {
  key: string
  value: string
  extra?: { key: string; valueRegex: string }
}

export interface OsmCategoryMapping {
  category: string
  filters: OsmTagFilter[]
}

function mapping(category: string, filters: OsmTagFilter[]): OsmCategoryMapping {
  return { category, filters }
}

const PLUMBER = mapping('plumber', [{ key: 'craft', value: 'plumber' }])
const ELECTRICIAN = mapping('electrician', [{ key: 'craft', value: 'electrician' }])
const HVAC = mapping('hvac', [{ key: 'craft', value: 'hvac' }])
const LANDSCAPING = mapping('landscaping', [{ key: 'craft', value: 'gardener' }])
const ROOFER = mapping('roofer', [{ key: 'craft', value: 'roofer' }])
const PAINTER = mapping('painter', [{ key: 'craft', value: 'painter' }])
const CONTRACTOR = mapping('contractor', [{ key: 'craft', value: 'builder' }])
const PEST_CONTROL = mapping('pest_control', [{ key: 'shop', value: 'pest_control' }])
const CLEANING_SERVICE = mapping('cleaning_service', [{ key: 'craft', value: 'cleaning' }])
const HANDYMAN = mapping('handyman', [{ key: 'craft', value: 'handyman' }])
const NAIL_SALON = mapping('nail_salon', [
  { key: 'shop', value: 'beauty', extra: { key: 'beauty', valueRegex: 'nails' } },
])
const HAIR_SALON = mapping('hair_salon', [{ key: 'shop', value: 'hairdresser' }])
const SPA = mapping('spa', [
  { key: 'shop', value: 'massage' },
  { key: 'leisure', value: 'spa' },
])
const DENTIST = mapping('dentist', [{ key: 'amenity', value: 'dentist' }])
const CHIROPRACTOR = mapping('chiropractor', [{ key: 'healthcare', value: 'chiropractor' }])
const VETERINARY = mapping('veterinary', [{ key: 'amenity', value: 'veterinary' }])
const GYM = mapping('gym', [{ key: 'leisure', value: 'fitness_centre' }])
const TATTOO = mapping('tattoo', [{ key: 'shop', value: 'tattoo' }])
const PHOTOGRAPHER = mapping('photographer', [{ key: 'craft', value: 'photographer' }])
const FLORIST = mapping('florist', [{ key: 'shop', value: 'florist' }])
const BAKERY = mapping('bakery', [{ key: 'shop', value: 'bakery' }])
const RESTAURANT = mapping('restaurant', [
  { key: 'amenity', value: 'cafe' },
  { key: 'amenity', value: 'restaurant' },
])
const AUTO_REPAIR = mapping('auto_repair', [{ key: 'shop', value: 'car_repair' }])
const TOWING = mapping('towing', [{ key: 'shop', value: 'car_repair' }])
const LOCKSMITH = mapping('locksmith', [{ key: 'shop', value: 'locksmith' }])
const MOVING_COMPANY = mapping('moving_company', [{ key: 'office', value: 'moving_company' }])
const PET_GROOMING = mapping('pet_grooming', [{ key: 'shop', value: 'pet_grooming' }])
const DAYCARE = mapping('daycare', [{ key: 'amenity', value: 'kindergarten' }])
const TUTORING = mapping('tutoring', [{ key: 'office', value: 'educational_institution' }])
const REAL_ESTATE = mapping('real_estate', [{ key: 'office', value: 'estate_agent' }])
const INSURANCE_AGENT = mapping('insurance_agent', [{ key: 'office', value: 'insurance' }])
const ACCOUNTANT = mapping('accountant', [{ key: 'office', value: 'accountant' }])
const LAWYER = mapping('lawyer', [{ key: 'office', value: 'lawyer' }])
const DOG_TRAINING = mapping('dog_training', [{ key: 'shop', value: 'pet' }])
const EVENT_PLANNING = mapping('event_planning', [{ key: 'office', value: 'event_management' }])
const CATERING = mapping('catering', [{ key: 'craft', value: 'caterer' }])
const EVENT_VENUE = mapping('event_venue', [{ key: 'amenity', value: 'events_venue' }])
const JEWELER = mapping('jeweler', [{ key: 'shop', value: 'jewelry' }])
const DRY_CLEANING = mapping('dry_cleaning', [{ key: 'shop', value: 'dry_cleaning' }])
const GUN_RANGE = mapping('gun_range', [{ key: 'leisure', value: 'shooting_ground' }])
const MARTIAL_ARTS = mapping('martial_arts', [
  { key: 'leisure', value: 'sports_centre', extra: { key: 'sport', valueRegex: 'martial_arts' } },
])
const YOGA = mapping('yoga', [
  { key: 'leisure', value: 'fitness_centre', extra: { key: 'sport', valueRegex: 'yoga' } },
])
const CAR_DETAILING = mapping('car_detailing', [{ key: 'shop', value: 'car_repair' }])
const WINDOW_CLEANING = mapping('window_cleaning', [{ key: 'craft', value: 'window_cleaner' }])
const JUNK_REMOVAL = mapping('junk_removal', [{ key: 'office', value: 'company' }])
const FENCING = mapping('fencing', [{ key: 'craft', value: 'fence_contractor' }])
const POOL_SERVICE = mapping('pool_service', [{ key: 'craft', value: 'pool' }])
const SEPTIC_SERVICE = mapping('septic_service', [{ key: 'craft', value: 'plumber' }])
const APPLIANCE_REPAIR = mapping('appliance_repair', [{ key: 'shop', value: 'appliance' }])
const PICKLEBALL_SHOP = mapping('pickleball_shop', [{ key: 'shop', value: 'sports' }])
const COFFEE_SHOP = mapping('coffee_shop', [{ key: 'amenity', value: 'cafe' }])
const BAR = mapping('bar', [
  { key: 'amenity', value: 'bar' },
  { key: 'amenity', value: 'pub' },
])
const BREWERY = mapping('brewery', [{ key: 'craft', value: 'brewery' }])
const WINERY = mapping('winery', [
  { key: 'craft', value: 'winery' },
  { key: 'shop', value: 'wine' },
])
const PIZZA = mapping('pizza', [
  { key: 'amenity', value: 'restaurant', extra: { key: 'cuisine', valueRegex: 'pizza' } },
  { key: 'amenity', value: 'fast_food', extra: { key: 'cuisine', valueRegex: 'pizza' } },
])
const DELI = mapping('deli', [
  { key: 'shop', value: 'deli' },
  { key: 'amenity', value: 'fast_food', extra: { key: 'cuisine', valueRegex: 'sandwich' } },
])
const ICE_CREAM = mapping('ice_cream', [
  { key: 'amenity', value: 'ice_cream' },
  { key: 'shop', value: 'ice_cream' },
])
const DONUT = mapping('donut', [
  { key: 'amenity', value: 'cafe', extra: { key: 'cuisine', valueRegex: 'donut' } },
  { key: 'amenity', value: 'fast_food', extra: { key: 'cuisine', valueRegex: 'donut' } },
  { key: 'shop', value: 'pastry' },
])
const BUTCHER = mapping('butcher', [{ key: 'shop', value: 'butcher' }])
const CANDY = mapping('candy', [
  { key: 'shop', value: 'confectionery' },
  { key: 'shop', value: 'chocolate' },
])
const LIQUOR = mapping('liquor_store', [{ key: 'shop', value: 'alcohol' }])
const BOUTIQUE = mapping('boutique', [
  { key: 'shop', value: 'boutique' },
  { key: 'shop', value: 'clothes' },
])
const GIFT_SHOP = mapping('gift_shop', [{ key: 'shop', value: 'gift' }])
const BOOKSTORE = mapping('bookstore', [{ key: 'shop', value: 'books' }])
const ANTIQUE = mapping('antique_shop', [
  { key: 'shop', value: 'antiques' },
  { key: 'shop', value: 'second_hand' },
])
const PET_STORE = mapping('pet_store', [{ key: 'shop', value: 'pet' }])
const BIKE_SHOP = mapping('bike_shop', [{ key: 'shop', value: 'bicycle' }])
const TOY_STORE = mapping('toy_store', [
  { key: 'shop', value: 'toys' },
  { key: 'shop', value: 'games' },
  { key: 'shop', value: 'model' },
])
const DANCE_STUDIO = mapping('dance_studio', [
  { key: 'leisure', value: 'dance' },
  { key: 'amenity', value: 'dancing_school' },
])

const KEYWORD_MAP: Record<string, OsmCategoryMapping> = {
  plumber: PLUMBER,
  plumbers: PLUMBER,
  plumbing: PLUMBER,

  electrician: ELECTRICIAN,
  electricians: ELECTRICIAN,
  electrical: ELECTRICIAN,

  hvac: HVAC,
  'heating and cooling': HVAC,
  'heating and air conditioning': HVAC,
  'air conditioning': HVAC,

  landscaping: LANDSCAPING,
  landscaper: LANDSCAPING,
  landscapers: LANDSCAPING,
  'lawn care': LANDSCAPING,
  'lawn care service': LANDSCAPING,

  roofer: ROOFER,
  roofers: ROOFER,
  roofing: ROOFER,

  painter: PAINTER,
  painters: PAINTER,
  painting: PAINTER,

  contractor: CONTRACTOR,
  contractors: CONTRACTOR,
  remodeler: CONTRACTOR,
  remodelers: CONTRACTOR,
  'general contractor': CONTRACTOR,
  'home renovation': CONTRACTOR,

  'pest control': PEST_CONTROL,
  exterminator: PEST_CONTROL,
  exterminators: PEST_CONTROL,

  'cleaning service': CLEANING_SERVICE,
  'cleaning services': CLEANING_SERVICE,
  'house cleaning': CLEANING_SERVICE,
  'maid service': CLEANING_SERVICE,

  handyman: HANDYMAN,
  'handyman services': HANDYMAN,

  'nail salon': NAIL_SALON,
  'nail salons': NAIL_SALON,

  'hair salon': HAIR_SALON,
  'hair salons': HAIR_SALON,
  hairdresser: HAIR_SALON,
  barbershop: HAIR_SALON,
  barbershops: HAIR_SALON,
  barber: HAIR_SALON,

  spa: SPA,
  spas: SPA,
  massage: SPA,
  'massage therapist': SPA,
  'massage therapists': SPA,

  dentist: DENTIST,
  dentists: DENTIST,
  dental: DENTIST,

  chiropractor: CHIROPRACTOR,
  chiropractors: CHIROPRACTOR,

  vet: VETERINARY,
  vets: VETERINARY,
  veterinary: VETERINARY,
  'veterinary clinic': VETERINARY,
  'vet clinic': VETERINARY,

  gym: GYM,
  gyms: GYM,
  'personal trainer': GYM,
  'personal trainers': GYM,
  fitness: GYM,

  'tattoo shop': TATTOO,
  'tattoo shops': TATTOO,
  tattoo: TATTOO,

  photographer: PHOTOGRAPHER,
  photographers: PHOTOGRAPHER,
  photography: PHOTOGRAPHER,

  florist: FLORIST,
  florists: FLORIST,
  'flower shop': FLORIST,

  bakery: BAKERY,
  bakeries: BAKERY,

  cafe: COFFEE_SHOP,
  cafes: COFFEE_SHOP,
  'coffee shop': COFFEE_SHOP,
  'coffee shops': COFFEE_SHOP,
  restaurant: RESTAURANT,
  restaurants: RESTAURANT,

  'auto repair': AUTO_REPAIR,
  'auto repair shop': AUTO_REPAIR,
  'auto repair shops': AUTO_REPAIR,
  mechanic: AUTO_REPAIR,
  'car repair': AUTO_REPAIR,

  'tow company': TOWING,
  'tow companies': TOWING,
  towing: TOWING,
  'tow truck': TOWING,

  locksmith: LOCKSMITH,
  locksmiths: LOCKSMITH,

  'moving company': MOVING_COMPANY,
  'moving companies': MOVING_COMPANY,
  movers: MOVING_COMPANY,
  'moving services': MOVING_COMPANY,

  'pet groomer': PET_GROOMING,
  'pet groomers': PET_GROOMING,
  'pet grooming': PET_GROOMING,
  'dog grooming': PET_GROOMING,

  daycare: DAYCARE,
  daycares: DAYCARE,
  preschool: DAYCARE,
  preschools: DAYCARE,
  'child care': DAYCARE,

  tutoring: TUTORING,
  'tutoring center': TUTORING,
  'tutoring centers': TUTORING,
  tutor: TUTORING,

  'real estate agent': REAL_ESTATE,
  'real estate agents': REAL_ESTATE,
  realtor: REAL_ESTATE,
  realtors: REAL_ESTATE,
  'real estate': REAL_ESTATE,

  'insurance agent': INSURANCE_AGENT,
  'insurance agents': INSURANCE_AGENT,
  insurance: INSURANCE_AGENT,

  accountant: ACCOUNTANT,
  accountants: ACCOUNTANT,
  bookkeeper: ACCOUNTANT,
  bookkeepers: ACCOUNTANT,
  accounting: ACCOUNTANT,

  lawyer: LAWYER,
  lawyers: LAWYER,
  attorney: LAWYER,
  'law firm': LAWYER,

  'dog trainer': DOG_TRAINING,
  'dog trainers': DOG_TRAINING,
  'dog training': DOG_TRAINING,

  'event planner': EVENT_PLANNING,
  'event planners': EVENT_PLANNING,
  'event planning': EVENT_PLANNING,

  caterer: CATERING,
  caterers: CATERING,
  catering: CATERING,

  'wedding venue': EVENT_VENUE,
  'wedding venues': EVENT_VENUE,
  'event venue': EVENT_VENUE,

  jeweler: JEWELER,
  jewelers: JEWELER,
  'jewelry store': JEWELER,

  'dry cleaner': DRY_CLEANING,
  'dry cleaners': DRY_CLEANING,
  'dry cleaning': DRY_CLEANING,

  'gun range': GUN_RANGE,
  'gun ranges': GUN_RANGE,
  'shooting range': GUN_RANGE,

  'martial arts': MARTIAL_ARTS,
  'martial arts studio': MARTIAL_ARTS,
  'martial arts studios': MARTIAL_ARTS,
  karate: MARTIAL_ARTS,
  dojo: MARTIAL_ARTS,

  'yoga studio': YOGA,
  'yoga studios': YOGA,
  yoga: YOGA,

  'car detailing': CAR_DETAILING,
  'auto detailing': CAR_DETAILING,

  'window cleaning': WINDOW_CLEANING,

  'junk removal': JUNK_REMOVAL,

  'fencing company': FENCING,
  'fencing companies': FENCING,
  'fence company': FENCING,
  fencing: FENCING,

  'pool service': POOL_SERVICE,
  'pool services': POOL_SERVICE,
  'pool cleaning': POOL_SERVICE,
  'swimming pool maintenance': POOL_SERVICE,

  'septic service': SEPTIC_SERVICE,
  'septic services': SEPTIC_SERVICE,
  'septic tank': SEPTIC_SERVICE,

  'appliance repair': APPLIANCE_REPAIR,

  'pickleball shops': PICKLEBALL_SHOP,
  'pickleball shop': PICKLEBALL_SHOP,

  bar: BAR,
  bars: BAR,
  pub: BAR,
  pubs: BAR,
  tavern: BAR,

  brewery: BREWERY,
  breweries: BREWERY,
  taproom: BREWERY,

  winery: WINERY,
  wineries: WINERY,
  'wine shop': WINERY,
  'wine bar': WINERY,

  pizza: PIZZA,
  'pizza shop': PIZZA,
  'pizza shops': PIZZA,
  pizzeria: PIZZA,

  deli: DELI,
  delis: DELI,
  'sandwich shop': DELI,
  'sandwich shops': DELI,

  'ice cream': ICE_CREAM,
  'ice cream shop': ICE_CREAM,
  'ice cream shops': ICE_CREAM,
  'dessert shop': ICE_CREAM,

  'donut shop': DONUT,
  'donut shops': DONUT,
  donuts: DONUT,

  butcher: BUTCHER,
  'butcher shop': BUTCHER,
  'butcher shops': BUTCHER,

  'candy shop': CANDY,
  'candy shops': CANDY,
  'chocolate shop': CANDY,

  'liquor store': LIQUOR,
  'liquor stores': LIQUOR,
  'bottle shop': LIQUOR,

  boutique: BOUTIQUE,
  boutiques: BOUTIQUE,
  'clothing boutique': BOUTIQUE,

  'gift shop': GIFT_SHOP,
  'gift shops': GIFT_SHOP,

  bookstore: BOOKSTORE,
  bookstores: BOOKSTORE,

  'antique shop': ANTIQUE,
  'antique shops': ANTIQUE,
  'thrift store': ANTIQUE,
  'thrift shop': ANTIQUE,

  'pet store': PET_STORE,
  'pet stores': PET_STORE,

  'bike shop': BIKE_SHOP,
  'bike shops': BIKE_SHOP,

  'toy store': TOY_STORE,
  'toy stores': TOY_STORE,
  'hobby shop': TOY_STORE,

  'dance studio': DANCE_STUDIO,
  'dance studios': DANCE_STUDIO,
}

const SUBSTRING_FALLBACKS: { test: string; mapping: OsmCategoryMapping }[] = [
  { test: 'plumb', mapping: PLUMBER },
  { test: 'electric', mapping: ELECTRICIAN },
  { test: 'roof', mapping: ROOFER },
  { test: 'paint', mapping: PAINTER },
  { test: 'landscap', mapping: LANDSCAPING },
  { test: 'lawn', mapping: LANDSCAPING },
  { test: 'hair', mapping: HAIR_SALON },
  { test: 'nail', mapping: NAIL_SALON },
  { test: 'massage', mapping: SPA },
  { test: 'dental', mapping: DENTIST },
  { test: 'vet', mapping: VETERINARY },
  { test: 'gym', mapping: GYM },
  { test: 'fitness', mapping: GYM },
  { test: 'tattoo', mapping: TATTOO },
  { test: 'photo', mapping: PHOTOGRAPHER },
  { test: 'flow', mapping: FLORIST },
  { test: 'bake', mapping: BAKERY },
  { test: 'cafe', mapping: RESTAURANT },
  { test: 'restaurant', mapping: RESTAURANT },
  { test: 'auto', mapping: AUTO_REPAIR },
  { test: 'tow', mapping: TOWING },
  { test: 'lock', mapping: LOCKSMITH },
  { test: 'mov', mapping: MOVING_COMPANY },
  { test: 'groom', mapping: PET_GROOMING },
  { test: 'daycare', mapping: DAYCARE },
  { test: 'preschool', mapping: DAYCARE },
  { test: 'tutor', mapping: TUTORING },
  { test: 'real estate', mapping: REAL_ESTATE },
  { test: 'realtor', mapping: REAL_ESTATE },
  { test: 'insurance', mapping: INSURANCE_AGENT },
  { test: 'account', mapping: ACCOUNTANT },
  { test: 'bookkeep', mapping: ACCOUNTANT },
  { test: 'lawyer', mapping: LAWYER },
  { test: 'attorney', mapping: LAWYER },
  { test: 'caterer', mapping: CATERING },
  { test: 'catering', mapping: CATERING },
  { test: 'jewel', mapping: JEWELER },
  { test: 'dry clean', mapping: DRY_CLEANING },
  { test: 'martial arts', mapping: MARTIAL_ARTS },
  { test: 'yoga', mapping: YOGA },
  { test: 'detail', mapping: CAR_DETAILING },
  { test: 'window clean', mapping: WINDOW_CLEANING },
  { test: 'junk', mapping: JUNK_REMOVAL },
  { test: 'fenc', mapping: FENCING },
  { test: 'pool', mapping: POOL_SERVICE },
  { test: 'septic', mapping: SEPTIC_SERVICE },
  { test: 'appliance', mapping: APPLIANCE_REPAIR },
  { test: 'handyman', mapping: HANDYMAN },
  { test: 'pest', mapping: PEST_CONTROL },
  { test: 'clean', mapping: CLEANING_SERVICE },
  { test: 'coffee', mapping: COFFEE_SHOP },
  { test: 'brew', mapping: BREWERY },
  { test: 'wine', mapping: WINERY },
  { test: 'pizz', mapping: PIZZA },
  { test: 'deli', mapping: DELI },
  { test: 'ice cream', mapping: ICE_CREAM },
  { test: 'donut', mapping: DONUT },
  { test: 'butcher', mapping: BUTCHER },
  { test: 'candy', mapping: CANDY },
  { test: 'chocolate', mapping: CANDY },
  { test: 'liquor', mapping: LIQUOR },
  { test: 'boutique', mapping: BOUTIQUE },
  { test: 'gift', mapping: GIFT_SHOP },
  { test: 'book', mapping: BOOKSTORE },
  { test: 'antique', mapping: ANTIQUE },
  { test: 'thrift', mapping: ANTIQUE },
  { test: 'bike', mapping: BIKE_SHOP },
  { test: 'toy', mapping: TOY_STORE },
  { test: 'dance', mapping: DANCE_STUDIO },
  { test: 'pub', mapping: BAR },
  { test: 'tavern', mapping: BAR },
]

export function getOsmCategoryMapping(keyword: string): OsmCategoryMapping | null {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) return null

  const exact = KEYWORD_MAP[normalized]
  if (exact) return exact

  for (const fallback of SUBSTRING_FALLBACKS) {
    if (normalized.includes(fallback.test)) return fallback.mapping
  }

  return null
}
