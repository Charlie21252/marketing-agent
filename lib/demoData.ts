import type { GoogleProfile, Lead, SocialProfile } from '@/types/lead'
import { EMPTY_WEBSITE_AUDIT, type WebsiteAudit } from './audit/website'
import { scoreMarketing } from './scorer'
import { SENDER_NAME } from './config'

// Sample leads served instead of MongoDB when DEMO_MODE=true.
// Business names, domains, emails and 555 phone numbers are fictional.
// Each one is run through the real scorer, so the demo shows exactly what a live search would.

export const isDemoMode = () => process.env.DEMO_MODE === 'true'

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

interface DemoSeed {
  id: string
  businessName: string
  url?: string
  phone: string
  address: string
  category: string
  niche: string
  ownerName?: string
  contactEmail?: string
  website?: Partial<WebsiteAudit>
  social: SocialProfile[]
  google: GoogleProfile | null
  pitchAngle: string
  status: Lead['status']
  notes?: string
  age: number
}

const seeds: DemoSeed[] = [
  {
    id: 'demo-01',
    businessName: 'Rosa’s Tamale Kitchen',
    phone: '(555) 301-4421',
    address: '88 W Jefferson Ave, Naperville, IL',
    category: 'restaurant',
    niche: 'restaurants',
    ownerName: 'Rosa Delgado',
    social: [{ platform: 'Facebook', url: 'https://facebook.com/rosastamales-demo', kind: 'social', followers: 142 }],
    google: { rating: 4.8, reviewCount: 212, photoCount: 2, hasHours: true, hasDescription: false },
    pitchAngle:
      'Rosa’s has 212 glowing reviews but only two photos on Google and no menu or website, so people searching for lunch nearby scroll past to places with pictures of the food.',
    status: 'new',
    age: 1,
  },
  {
    id: 'demo-02',
    businessName: 'Kowalski Lawn & Snow',
    url: 'http://kowalskilawn-demo.com',
    phone: '(555) 772-9013',
    address: '1450 Plainfield Rd, Oswego, IL',
    category: 'landscaping',
    niche: 'landscaping',
    ownerName: 'Mike Kowalski',
    contactEmail: 'mike@kowalskilawn-demo.com',
    website: { loaded: true, method: 'fetch', hasSSL: false, hasMobileViewport: false, copyrightYear: 2015, navLinkCount: 2, emails: ['mike@kowalskilawn-demo.com'] },
    social: [],
    google: { rating: 4.6, reviewCount: 38, photoCount: 4, hasHours: false, hasDescription: false },
    pitchAngle:
      'Kowalski has no social pages, no logo and a 2015-era site, so neighbors who see his trucks have nothing to look up — door hangers and a simple brand kit would turn every job into advertising for the next street.',
    status: 'contacted',
    notes: 'Left voicemail Mon. Wife answers the phone — ask for Mike after 4pm.',
    age: 3,
  },
  {
    id: 'demo-03',
    businessName: 'Bright Paws Grooming',
    url: 'https://brightpaws-demo.com',
    phone: '(555) 418-6650',
    address: '230 Ogden Ave, Downers Grove, IL',
    category: 'pet grooming',
    niche: 'pet groomers',
    contactEmail: 'hello@brightpaws-demo.com',
    website: {
      loaded: true, method: 'playwright', hasSSL: true, hasMobileViewport: true, hasContactForm: true,
      hasBookingCta: true, hasLogo: true, hasFavicon: true, navLinkCount: 6,
      socialLinks: ['https://instagram.com/brightpaws-demo'], emails: ['hello@brightpaws-demo.com'],
    },
    social: [{ platform: 'Instagram', url: 'https://instagram.com/brightpaws-demo', kind: 'social', followers: 96 }],
    google: { rating: 4.9, reviewCount: 61, photoCount: 10, hasHours: true, hasDescription: true },
    pitchAngle:
      'Bright Paws has a solid site and great reviews but only 96 Instagram followers, no Facebook and no offers — a before/after photo routine and a refer-a-friend card would fill their slow weekdays.',
    status: 'new',
    age: 2,
  },
  {
    id: 'demo-04',
    businessName: 'Precision Auto Care',
    url: 'http://precisionautocare-demo.net',
    phone: '(555) 905-3187',
    address: '711 E Ogden Ave, Westmont, IL',
    category: 'car repair',
    niche: 'auto repair shops',
    ownerName: 'Tony Russo',
    website: { loaded: false },
    social: [{ platform: 'Yelp', url: 'https://yelp.com/biz/precision-auto-demo', kind: 'directory', followers: null }],
    google: { rating: 3.9, reviewCount: 17, photoCount: 0, hasHours: true, hasDescription: false },
    pitchAngle:
      'Precision Auto’s website doesn’t load and their Google listing has no photos and a 3.9 rating, so drivers comparing shops on their phone see nothing that builds trust.',
    status: 'responded',
    notes: 'Tony replied — wants a quote for a new sign + business cards. Follow up Thursday.',
    age: 6,
  },
  {
    id: 'demo-05',
    businessName: 'Lumen Yoga Studio',
    url: 'https://lumenyoga-demo.com',
    phone: '(555) 240-7764',
    address: '19 S Main St, Wheaton, IL',
    category: 'yoga studio',
    niche: 'yoga studios',
    ownerName: 'Priya Shah',
    contactEmail: 'priya@lumenyoga-demo.com',
    website: {
      loaded: true, method: 'playwright', hasSSL: true, hasMobileViewport: true, hasContactForm: true,
      hasBookingCta: true, hasLogo: true, hasFavicon: true, hasOgImage: true, hasMetaDescription: true,
      hasNewsletter: false, navLinkCount: 5,
      socialLinks: ['https://instagram.com/lumenyoga-demo', 'https://facebook.com/lumenyoga-demo'],
      emails: ['priya@lumenyoga-demo.com'],
    },
    social: [
      { platform: 'Instagram', url: 'https://instagram.com/lumenyoga-demo', kind: 'social', followers: 1240 },
      { platform: 'Facebook', url: 'https://facebook.com/lumenyoga-demo', kind: 'social', followers: 410 },
    ],
    google: { rating: 4.7, reviewCount: 44, photoCount: 8, hasHours: true, hasDescription: true },
    pitchAngle:
      'Lumen’s brand is strong online but there’s no intro offer and no email list, so first-time visitors who don’t book on the spot are never heard from again.',
    status: 'new',
    age: 0,
  },
]

function buildLead(s: DemoSeed): Lead {
  const website = { ...EMPTY_WEBSITE_AUDIT, ...s.website }
  const scored = scoreMarketing({
    hasWebsite: !!s.url,
    website,
    socialProfiles: s.social,
    googleProfile: s.google,
    category: s.category,
  })
  const src = 'Google Maps Places API'
  return {
    _id: s.id,
    businessName: s.businessName,
    url: s.url,
    phone: s.phone,
    address: s.address,
    category: s.category,
    niche: s.niche,
    ownerName: s.ownerName,
    contactEmail: s.contactEmail,
    marketingScore: scored.score,
    channelScores: scored.channelScores,
    issues: scored.issues,
    socialProfiles: s.social,
    googleProfile: s.google,
    recommendedServices: scored.recommendedServices,
    pitchAngle: s.pitchAngle,
    sources: [
      { field: 'businessName', source: src },
      { field: 'googleProfile', source: src },
      ...(s.url ? [{ field: 'website / branding / promo', source: `Playwright render of ${s.url}` }] : []),
      { field: 'socialProfiles', source: `Serper search: "${s.businessName}" social` },
    ],
    status: s.status,
    notes: s.notes,
    createdAt: daysAgo(s.age),
    updatedAt: daysAgo(s.age),
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _adamDemoLeads: Lead[] | undefined
}

// Kept on globalThis so edits survive hot reloads during a dev session.
function store(): Lead[] {
  if (!global._adamDemoLeads) global._adamDemoLeads = seeds.map(buildLead)
  return global._adamDemoLeads
}

export function getDemoLeads(): Lead[] {
  return [...store()].sort((a, b) => (a.marketingScore ?? 101) - (b.marketingScore ?? 101))
}

export function getDemoLead(id: string): Lead | undefined {
  return store().find((l) => l._id === id)
}

export function updateDemoLead(id: string, patch: Partial<Lead>): Lead | undefined {
  const lead = getDemoLead(id)
  if (!lead) return undefined
  Object.assign(lead, patch, { updatedAt: new Date().toISOString() })
  return lead
}

export function deleteDemoLead(id: string): boolean {
  const leads = store()
  const i = leads.findIndex((l) => l._id === id)
  if (i === -1) return false
  leads.splice(i, 1)
  return true
}

export function demoOutreachDraft(lead: Lead): string {
  if (lead.outreachDraft) return lead.outreachDraft
  const name = lead.ownerName?.split(' ')[0] ?? 'there'
  const gaps = lead.issues.slice(0, 2).map((i) => i.text.charAt(0).toLowerCase() + i.text.slice(1))
  const offer = lead.recommendedServices[0]?.label.toLowerCase() ?? 'a refresh of your marketing'
  return `Subject: Quick idea for ${lead.businessName}

Hi ${name},

I came across ${lead.businessName} while looking at local businesses nearby${
    lead.googleProfile?.reviewCount ? ` — ${lead.googleProfile.reviewCount} reviews is no small thing` : ''
  }. One thing I noticed: ${gaps.join(' and ') || 'your marketing could be working harder for you'}.

I help small businesses around here with the stuff that gets customers in the door — ${offer}, business cards, flyers, social pages. I'd be happy to put together a free mockup so you can see what it would look like before spending anything.

Would that be worth a quick look this week?

Thanks,
${SENDER_NAME}`
}
