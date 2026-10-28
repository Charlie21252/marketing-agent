import type { Channel } from '@/types/lead'

export const CHANNEL_LABELS: Record<Channel, string> = {
  website: 'Website',
  social: 'Social Media',
  googleProfile: 'Google Profile',
  branding: 'Branding',
  promo: 'Promo & Print',
}

export const CHANNEL_ORDER: Channel[] = ['website', 'social', 'googleProfile', 'branding', 'promo']
