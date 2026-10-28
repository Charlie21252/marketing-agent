import { LeadTable } from '@/components/LeadTable'
import { RunAgentForm } from '@/components/RunAgentForm'
import { DashboardTabs } from '@/components/DashboardTabs'
import type { Lead } from '@/types/lead'
import { isDemoMode, getDemoLeads } from '@/lib/demoData'
import { connectDB } from '@/lib/mongodb'
import { Lead as LeadModel } from '@/models/Lead'

export const dynamic = 'force-dynamic'

async function getLeads(): Promise<{ leads: Lead[]; error: string | null }> {
  if (isDemoMode()) return { leads: getDemoLeads(), error: null }
  try {
    await connectDB()
    const docs = await LeadModel.find({}).sort({ marketingScore: 1, createdAt: -1 }).lean()
    // Round-trip through JSON so ObjectIds/Dates become plain strings for client components.
    return { leads: JSON.parse(JSON.stringify(docs)), error: null }
  } catch (err) {
    return { leads: [], error: err instanceof Error ? err.message : 'Could not reach the database' }
  }
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center bg-gray-900 border border-gray-800 rounded-lg px-4 sm:px-5 py-3 min-w-[72px]">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  )
}

export default async function DashboardPage() {
  const { leads, error } = await getLeads()

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted' || l.status === 'responded').length,
    closed: leads.filter((l) => l.status === 'closed').length,
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              LeadFlow
              {isDemoMode() && (
                <span className="ml-3 align-middle text-xs font-medium bg-yellow-500/15 text-yellow-400 ring-1 ring-inset ring-yellow-500/30 rounded-full px-2 py-0.5">
                  Demo data
                </span>
              )}
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <StatPill label="Total" value={stats.total} color="text-violet-400" />
            <StatPill label="New" value={stats.new} color="text-violet-400" />
            <StatPill label="In Talks" value={stats.contacted} color="text-yellow-400" />
            <StatPill label="Closed" value={stats.closed} color="text-green-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-300 text-sm rounded-lg p-3">
            Couldn’t load leads: {error}
          </div>
        )}

        <DashboardTabs
          leadsContent={
            <div className="space-y-6">
              <RunAgentForm />
              <LeadTable leads={leads} />
            </div>
          }
        />
      </div>
    </div>
  )
}
