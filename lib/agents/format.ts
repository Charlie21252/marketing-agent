import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { connectDB } from '@/lib/mongodb'
import { Lead } from '@/models/Lead'
import { CHANNEL_LABELS } from '@/lib/channels'
import type { PlaceResult } from '@/types/lead'
import { categoryFromPlace, type ResearchResult } from './research'

const PITCH_SYSTEM = `You are a sales assistant for a local marketing freelancer who sells websites, social media setup, Google profile cleanup, logos, business cards, flyers, door hangers and signage to small local businesses.

Given an audit of a business's marketing, write a pitch angle: 1–2 sentences that name the single biggest marketing gap and what it is likely costing them (customers, trust, repeat business). Be specific to this business and its category. No jargon, no buzzwords, no exclamation marks. Return only the pitch angle text.`

function fallbackPitch(research: ResearchResult): string {
  const worst = [...research.channelScores].filter((c) => c.checked).sort((a, b) => a.score / a.max - b.score / b.max)[0]
  const firstIssue = research.issues.find((i) => i.channel === worst?.channel)
  return firstIssue
    ? `Their ${CHANNEL_LABELS[worst.channel].toLowerCase()} is the weakest part of their marketing (${firstIssue.text.toLowerCase()}), which makes it easy for nearby competitors to win the customer first.`
    : 'Their marketing is thin across the board, so customers searching nearby are likely finding competitors first.'
}

export async function generatePitch(input: {
  businessName: string
  category: string
  research: ResearchResult
}): Promise<string> {
  const { research } = input
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: PITCH_SYSTEM,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            businessName: input.businessName,
            category: input.category,
            marketingScore: research.score,
            channelScores: research.channelScores.map((c) => ({
              channel: CHANNEL_LABELS[c.channel],
              score: `${c.score}/${c.max}`,
              checked: c.checked,
            })),
            issues: research.issues.map((i) => `${CHANNEL_LABELS[i.channel]}: ${i.text}`),
            socialPagesFound: research.socialProfiles.map((p) => p.platform),
            googleProfile: research.googleProfile,
            servicesToPitch: research.recommendedServices.map((s) => s.label),
          }),
        },
      ],
    })
    const block = message.content[0]
    if (block?.type === 'text' && block.text.trim()) return block.text.trim()
  } catch {
    // fall through to the rule-based pitch
  }
  return fallbackPitch(research)
}

/** Agent 3 — writes the pitch angle with Claude and saves the finished lead. */
export async function formatLead(place: PlaceResult, research: ResearchResult, niche?: string) {
  await connectDB()

  const businessName = place.displayName.text
  const category = categoryFromPlace(place)
  const pitchAngle = await generatePitch({ businessName, category, research })

  const lead = await Lead.create({
    businessName,
    url: place.websiteUri,
    phone: place.internationalPhoneNumber,
    address: place.formattedAddress,
    category,
    niche,
    ownerName: research.ownerName,
    contactEmail: research.contactEmail,
    marketingScore: research.score,
    channelScores: research.channelScores,
    issues: research.issues,
    socialProfiles: research.socialProfiles,
    googleProfile: research.googleProfile,
    recommendedServices: research.recommendedServices,
    pitchAngle,
    sources: research.sources,
    status: 'new',
  })

  return lead.toObject()
}
