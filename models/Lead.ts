import mongoose, { Schema } from 'mongoose'
import type { Lead as LeadType } from '@/types/lead'

type LeadFields = Omit<LeadType, '_id' | 'createdAt' | 'updatedAt'>

const LeadSchema = new Schema<LeadFields>(
  {
    businessName: { type: String, required: true },
    url: String,
    phone: String,
    address: String,
    category: String,
    niche: String,
    ownerName: String,
    contactEmail: String,
    marketingScore: Number,
    channelScores: [{ _id: false, channel: String, score: Number, max: Number, checked: Boolean }],
    issues: [{ _id: false, channel: String, text: String }],
    socialProfiles: [{ _id: false, platform: String, url: String, kind: String, followers: Number }],
    googleProfile: {
      type: new Schema(
        {
          rating: Number,
          reviewCount: Number,
          photoCount: Number,
          hasHours: Boolean,
          hasDescription: Boolean,
        },
        { _id: false }
      ),
      default: null,
    },
    recommendedServices: [{ _id: false, key: String, label: String, reason: String }],
    pitchAngle: String,
    sources: [{ _id: false, field: { type: String, required: true }, source: { type: String, required: true } }],
    status: {
      type: String,
      enum: ['new', 'contacted', 'responded', 'closed', 'not_interested'],
      default: 'new',
    },
    notes: String,
    outreachDraft: String,
    closingScript: String,
  },
  { timestamps: true }
)

export const Lead = mongoose.models.Lead || mongoose.model<LeadFields>('Lead', LeadSchema)
