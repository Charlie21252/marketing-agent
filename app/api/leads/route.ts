import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Lead } from '@/models/Lead'
import { isDemoMode, getDemoLeads } from '@/lib/demoData'

// Always read fresh from the database; never cache the lead list at build time.
export const dynamic = 'force-dynamic'

export async function GET() {
  if (isDemoMode()) return NextResponse.json(getDemoLeads())
  try {
    await connectDB()
    const leads = await Lead.find({}).sort({ marketingScore: 1, createdAt: -1 }).lean()
    return NextResponse.json(leads)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
