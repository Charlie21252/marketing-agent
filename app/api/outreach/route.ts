import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/mongodb'
import { Lead } from '@/models/Lead'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { CHANNEL_LABELS } from '@/lib/channels'
import { SENDER_NAME } from '@/lib/config'
import { isDemoMode, getDemoLead, demoOutreachDraft } from '@/lib/demoData'
import type { Lead as LeadType } from '@/types/lead'

const RequestSchema = z.object({ leadId: z.string().min(1) })

/** Outreach agent — drafts a cold email from the audit and pitch angle. */
export async function POST(req: Request) {
  try {
    const parsed = RequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    if (isDemoMode()) {
      const demoLead = getDemoLead(parsed.data.leadId)
      if (!demoLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      return NextResponse.json({ draft: demoOutreachDraft(demoLead) })
    }

    await connectDB()
    const lead = await Lead.findById(parsed.data.leadId)
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    const l = lead.toObject() as LeadType

    const userContent = [
      `Business: ${l.businessName}`,
      l.ownerName ? `Owner: ${l.ownerName}` : null,
      l.category ? `Category: ${l.category}` : null,
      l.address ? `Address: ${l.address}` : null,
      l.pitchAngle ? `Pitch angle: ${l.pitchAngle}` : null,
      l.issues?.length ? `Marketing gaps:\n${l.issues.map((i) => `- ${CHANNEL_LABELS[i.channel]}: ${i.text}`).join('\n')}` : null,
      l.socialProfiles?.length ? `Social pages found: ${l.socialProfiles.map((p) => p.platform).join(', ')}` : 'Social pages found: none',
      l.googleProfile?.reviewCount ? `Google reviews: ${l.googleProfile.reviewCount} (${l.googleProfile.rating ?? '?'}★)` : null,
      l.recommendedServices?.length ? `Services to offer: ${l.recommendedServices.map((s) => s.label).join(', ')}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: `You are writing a cold outreach email for ${SENDER_NAME}, a local freelancer who helps small businesses with their marketing — websites, social media, Google profiles, logos, business cards, flyers and signage.

Write a short, genuine cold email (under 150 words) to the business owner. Include a subject line on the first line as "Subject: ...". Open with something specific and positive about the business (e.g. good reviews or what they do), then point out one or two specific gaps from the data — never list every gap. Offer one concrete, low-cost first step (like a free mockup of a flyer or business card, or a quick social media setup). No buzzwords, no exclamation marks, sound like a real neighbor, not an agency. End with a simple low-pressure question. Sign off as ${SENDER_NAME}.`,
      messages: [{ role: 'user', content: userContent }],
    })

    const block = message.content[0]
    const draft = block?.type === 'text' ? block.text.trim() : ''

    lead.outreachDraft = draft
    await lead.save()

    return NextResponse.json({ draft })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
