'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Lead } from '@/types/lead'
import { StatusDropdown } from './StatusDropdown'
import { ScoreChip } from './ScoreChip'
import { ChannelBars } from './ChannelBars'
import { OutreachModal } from './OutreachModal'

export function LeadTable({ leads }: { leads: Lead[] }) {
  const [outreachLeadId, setOutreachLeadId] = useState<string | null>(null)

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No leads yet.</p>
        <p className="text-sm mt-1">Use the form above to find local businesses with weak marketing.</p>
      </div>
    )
  }

  return (
    <>
      <div className="text-xs text-gray-500 mb-2 px-1">
        Score = how strong their marketing is (website, social, Google, branding, promo). Lower score ={' '}
        <span className="text-green-400">better opportunity for you.</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Breakdown</th>
              <th className="px-4 py-3">Pitch</th>
              <th className="px-4 py-3 max-w-xs">Pitch Angle</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {leads.map((lead) => (
              <tr key={lead._id} className="bg-gray-900/50 hover:bg-gray-900 transition-colors align-top">
                <td className="px-4 py-3 min-w-[180px]">
                  <div className="font-medium text-gray-100">{lead.businessName}</div>
                  {lead.category && <div className="text-xs text-gray-500 capitalize">{lead.category}</div>}
                  {lead.url ? (
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-400 hover:underline truncate max-w-[180px] block"
                    >
                      {lead.url.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <div className="text-xs text-red-400/80">No website</div>
                  )}
                  {lead.phone && <div className="text-xs text-gray-500 mt-0.5">{lead.phone}</div>}
                </td>
                <td className="px-4 py-3">
                  <ScoreChip score={lead.marketingScore} />
                </td>
                <td className="px-4 py-3">
                  <ChannelBars scores={lead.channelScores ?? []} compact />
                </td>
                <td className="px-4 py-3">
                  {lead.recommendedServices?.length ? (
                    <div className="flex flex-col items-start gap-1 min-w-[170px]">
                      {lead.recommendedServices.map((s) => (
                        <span
                          key={s.key}
                          title={s.reason}
                          className="whitespace-nowrap text-[11px] bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/30 rounded px-1.5 py-0.5"
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 min-w-[240px] max-w-xs">
                  <p className="text-xs text-gray-300 line-clamp-4">{lead.pitchAngle ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusDropdown leadId={lead._id} initialStatus={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/leads/${lead._id}`}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setOutreachLeadId(lead._id)}
                      className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                    >
                      Draft Email
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {outreachLeadId && (
        <OutreachModal
          leadId={outreachLeadId}
          leadName={leads.find((l) => l._id === outreachLeadId)?.businessName ?? ''}
          onClose={() => setOutreachLeadId(null)}
        />
      )}
    </>
  )
}
