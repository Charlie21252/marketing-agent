// Small, independent, local businesses — the kind that run their own marketing
// and actually buy websites, social setup, logos, menus, flyers and signage.
// Values must match keyword strings recognized by lib/sources/osmCategories.ts
// (KEYWORD_MAP) so OSM lookups map correctly alongside Google Places search.
export const BUSINESS_TYPES: { label: string; value: string }[] = [
  // Food & drink
  { label: 'Bakeries', value: 'bakeries' },
  { label: 'Coffee Shops / Cafes', value: 'coffee shops' },
  { label: 'Bars / Pubs', value: 'bars' },
  { label: 'Breweries / Taprooms', value: 'breweries' },
  { label: 'Wineries / Wine Shops', value: 'wineries' },
  { label: 'Local Restaurants', value: 'restaurants' },
  { label: 'Pizza Shops', value: 'pizza shops' },
  { label: 'Delis / Sandwich Shops', value: 'delis' },
  { label: 'Ice Cream / Dessert Shops', value: 'ice cream shops' },
  { label: 'Donut Shops', value: 'donut shops' },
  { label: 'Butcher Shops', value: 'butcher shops' },
  { label: 'Candy / Chocolate Shops', value: 'candy shops' },
  { label: 'Liquor / Bottle Shops', value: 'liquor stores' },
  { label: 'Caterers', value: 'caterers' },
  { label: 'Food Trucks', value: 'food trucks' },

  // Local shops
  { label: 'Florists', value: 'florists' },
  { label: 'Boutiques / Clothing Shops', value: 'boutiques' },
  { label: 'Gift Shops', value: 'gift shops' },
  { label: 'Bookstores', value: 'bookstores' },
  { label: 'Antique / Thrift Shops', value: 'antique shops' },
  { label: 'Pet Stores', value: 'pet stores' },
  { label: 'Jewelers', value: 'jewelers' },
  { label: 'Bike Shops', value: 'bike shops' },
  { label: 'Toy / Hobby Shops', value: 'toy stores' },

  // Personal services
  { label: 'Hair Salons / Barbershops', value: 'hair salons' },
  { label: 'Nail Salons', value: 'nail salons' },
  { label: 'Spas / Massage', value: 'spas' },
  { label: 'Tattoo Shops', value: 'tattoo shops' },
  { label: 'Pet Groomers', value: 'pet groomers' },
  { label: 'Photographers', value: 'photographers' },
  { label: 'Dry Cleaners / Tailors', value: 'dry cleaners' },

  // Studios
  { label: 'Yoga Studios', value: 'yoga studios' },
  { label: 'Dance Studios', value: 'dance studios' },
  { label: 'Martial Arts Studios', value: 'martial arts studios' },
  { label: 'Local Gyms', value: 'gyms' },

  // Auto
  { label: 'Auto Repair Shops', value: 'auto repair shops' },
  { label: 'Car Detailing', value: 'car detailing' },
]
