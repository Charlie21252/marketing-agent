import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Lead } from '@/models/Lead'
import { researchLead } from '@/lib/agents/research'
import { generatePitch } from '@/lib/agents/format'
import { isDemoMode } from '@/lib/demoData'
import type { PlaceResult } from '@/types/lead'

export const maxDuration = 120

const RequestSchema = z.object({ leadId: z.string().min(1) })

/** Re-runs Agents 2 and 3 on a saved lead, keeping its status and notes. */
export async function POST(req: Request) {
  try {
    const parsed = RequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    if (isDemoMode()) {
      return NextResponse.json({ error: 'Re-research is off in demo mode.' }, { status: 400 })
    }

    await connectDB()
    const existing = await Lead.findById(parsed.data.leadId).lean<{
      _id: unknown
      businessName: string
      address?: string
      phone?: string
      url?: string
      category?: string
      googleProfile?: PlaceResult['savedProfile']
    }>()
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const place: PlaceResult = {
      id: String(existing._id),
      displayName: { text: existing.businessName },
      formattedAddress: existing.address,
      internationalPhoneNumber: existing.phone,
      websiteUri: existing.url,
      types: existing.category ? [existing.category.replace(/ /g, '_')] : [],
      savedProfile: existing.googleProfile ?? null,
    }

    const research = await researchLead(place)
    const pitchAngle = await generatePitch({
      businessName: existing.businessName,
      category: existing.category ?? 'local business',
      research,
    })

    const updated = await Lead.findByIdAndUpdate(
      parsed.data.leadId,
      {
        ownerName: research.ownerName ?? undefined,
        contactEmail: research.contactEmail ?? undefined,
        marketingScore: research.score,
        channelScores: research.channelScores,
        issues: research.issues,
        socialProfiles: research.socialProfiles,
        recommendedServices: research.recommendedServices,
        pitchAngle,
        sources: research.sources,
      },
      { new: true }
    ).lean()

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
