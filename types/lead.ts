export type LeadStatus = 'new' | 'contacted' | 'responded' | 'closed' | 'not_interested'

/** The five parts of a business's marketing that the research agent audits. */
export type Channel = 'website' | 'social' | 'googleProfile' | 'branding' | 'promo'

export interface ChannelScore {
  channel: Channel
  score: number
  max: number
  /** false when we couldn't check this channel (e.g. no Google data for an OSM-only listing) */
  checked: boolean
}

export interface MarketingIssue {
  channel: Channel
  text: string
}

export interface SocialProfile {
  platform: string
  url: string
  /** 'social' = a page the business runs; 'directory' = a listing like Yelp or Nextdoor */
  kind: 'social' | 'directory'
  followers?: number | null
}

export interface GoogleProfile {
  rating?: number | null
  reviewCount?: number | null
  photoCount?: number | null
  hasHours: boolean
  hasDescription: boolean
}

export type ServiceKey =
  | 'website'
  | 'social'
  | 'googleProfile'
  | 'brandKit'
  | 'businessCards'
  | 'flyers'
  | 'signage'
  | 'emailMarketing'

export interface ServiceRec {
  key: ServiceKey
  label: string
  reason: string
}

export interface LeadSource {
  field: string
  source: string
}

export interface Lead {
  _id: string
  businessName: string
  url?: string
  phone?: string
  address?: string
  category?: string
  niche?: string
  ownerName?: string
  contactEmail?: string
  /** 0–100. Lower = weaker marketing = better sales opportunity. */
  marketingScore?: number
  channelScores: ChannelScore[]
  issues: MarketingIssue[]
  socialProfiles: SocialProfile[]
  googleProfile?: GoogleProfile | null
  recommendedServices: ServiceRec[]
  pitchAngle?: string
  sources: LeadSource[]
  status: LeadStatus
  notes?: string
  outreachDraft?: string
  closingScript?: string
  createdAt: string
  updatedAt: string
}

export interface PlaceResult {
  id: string
  displayName: { text: string; languageCode?: string }
  formattedAddress?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  types?: string[]
  rating?: number
  userRatingCount?: number
  photos?: unknown[]
  regularOpeningHours?: unknown
  editorialSummary?: { text?: string }
  location?: { latitude: number; longitude: number }
  /** Set when re-researching a saved lead, so we keep the Google data we already have. */
  savedProfile?: GoogleProfile | null
}
