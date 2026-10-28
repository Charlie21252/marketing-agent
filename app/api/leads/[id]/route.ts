import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Lead } from '@/models/Lead'
import { z } from 'zod'
import { isDemoMode, getDemoLead, updateDemoLead, deleteDemoLead } from '@/lib/demoData'

const PatchSchema = z.object({
  status: z
    .enum(['new', 'contacted', 'responded', 'closed', 'not_interested'])
    .optional(),
  notes: z.string().optional(),
  outreachDraft: z.string().optional(),
  closingScript: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (isDemoMode()) {
    const lead = getDemoLead(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json(lead)
  }
  try {
    await connectDB()
    const lead = await Lead.findById(params.id).lean()
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json(lead)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    if (isDemoMode()) {
      const lead = updateDemoLead(params.id, parsed.data)
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      return NextResponse.json(lead)
    }
    await connectDB()
    const lead = await Lead.findByIdAndUpdate(params.id, parsed.data, { new: true }).lean()
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json(lead)
  } catch {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (isDemoMode()) {
    if (!deleteDemoLead(params.id)) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  }
  try {
    await connectDB()
    const lead = await Lead.findByIdAndDelete(params.id)
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
