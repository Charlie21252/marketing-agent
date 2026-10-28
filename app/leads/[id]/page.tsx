'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead } from '@/types/lead'
import { StatusBadge } from '@/components/StatusBadge'
import { ScoreChip } from '@/components/ScoreChip'
import { ChannelBars } from '@/components/ChannelBars'
import { OutreachModal } from '@/components/OutreachModal'
import { ClosingScriptPanel } from '@/components/ClosingScriptPanel'
import { DEFAULT_CLOSING_SCRIPT } from '@/lib/closingScript'
import { CHANNEL_LABELS, CHANNEL_ORDER } from '@/lib/channels'

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-gray-200 break-words">{value}</dd>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [closingScript, setClosingScript] = useState('')
  const [showOutreach, setShowOutreach] = useState(false)
  const [loading, setLoading] = useState(true)
  const [researching, setResearching] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'closing'>('overview')

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setLead(data)
          setNotes(data.notes ?? '')
          setClosingScript(data.closingScript ?? DEFAULT_CLOSING_SCRIPT)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function patch(body: Record<string, string>) {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async function handleDelete() {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    router.push('/')
  }

  async function handleReResearch() {
    setResearching(true)
    setActionError(null)
    try {
      const res = await fetch('/api/agents/research-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Re-research failed')
      setLead(data)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Re-research failed')
    } finally {
      setResearching(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Lead not found.</p>
        <Link href="/" className="text-violet-400 hover:underline text-sm">← Back to dashboard</Link>
      </div>
    )
  }

  const g = lead.googleProfile
  const tabClass = (on: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      on ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-6">
          ← LeadFlow
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{lead.businessName}</h1>
            {lead.category && <p className="text-sm text-gray-500 capitalize">{lead.category}</p>}
            {lead.url ? (
              <a href={lead.url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-400 hover:underline mt-1 block break-all">
                {lead.url}
              </a>
            ) : (
              <p className="text-sm text-red-400/80 mt-1">No website</p>
            )}
            <div className="flex items-start gap-3 mt-2">
              <StatusBadge status={lead.status} />
              <ScoreChip score={lead.marketingScore} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <button onClick={() => setShowOutreach(true)} className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded transition-colors">
              Draft Email
            </button>
            <button
              onClick={handleReResearch}
              disabled={researching}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded transition-colors disabled:opacity-50"
            >
              {researching ? 'Re-auditing…' : 'Re-research'}
            </button>
            <button onClick={handleDelete} className="text-sm bg-red-900/40 hover:bg-red-900/70 text-red-400 px-4 py-2 rounded transition-colors">
              Delete
            </button>
          </div>
        </div>
        {actionError && <p className="text-sm text-red-400 mb-4">{actionError}</p>}

        <div className="flex gap-2 border-b border-gray-800 mb-6">
          <button onClick={() => setActiveTab('overview')} className={tabClass(activeTab === 'overview')}>Marketing Audit</button>
          <button onClick={() => setActiveTab('closing')} className={tabClass(activeTab === 'closing')}>Call Script</button>
        </div>

        {activeTab === 'closing' && (
          <ClosingScriptPanel
            lead={lead}
            script={closingScript}
            onScriptChange={setClosingScript}
            onSaveScript={() => patch({ closingScript })}
          />
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {lead.pitchAngle && (
                <Card title="Pitch Angle">
                  <p className="text-sm text-gray-200 leading-relaxed">{lead.pitchAngle}</p>
                </Card>
              )}

              {lead.recommendedServices?.length > 0 && (
                <Card title="What to Sell Them">
                  <ul className="space-y-3">
                    {lead.recommendedServices.map((s) => (
                      <li key={s.key} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                        <div>
                          <div className="text-sm text-gray-100 font-medium">{s.label}</div>
                          <div className="text-xs text-gray-500">{s.reason}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card title="Marketing Audit">
                <ChannelBars scores={lead.channelScores ?? []} />
                <div className="mt-6 space-y-4">
                  {CHANNEL_ORDER.map((ch) => {
                    const items = lead.issues?.filter((i) => i.channel === ch) ?? []
                    if (!items.length) return null
                    return (
                      <div key={ch}>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{CHANNEL_LABELS[ch]}</h3>
                        <ul className="space-y-1">
                          {items.map((i) => (
                            <li key={i.text} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-red-400">✗</span> {i.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card title="Business Info">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Business Name" value={lead.businessName} />
                  <Field label="Category" value={lead.category} />
                  <Field label="Phone" value={lead.phone} />
                  <Field label="Email" value={lead.contactEmail} />
                  <Field label="Owner" value={lead.ownerName} />
                  <Field label="Address" value={lead.address} />
                </dl>
              </Card>

              {lead.outreachDraft && (
                <Card title="Outreach Draft">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{lead.outreachDraft}</pre>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card title="Social & Listings">
                {lead.socialProfiles?.length ? (
                  <ul className="space-y-2">
                    {lead.socialProfiles.map((p) => (
                      <li key={p.url} className="flex items-center justify-between gap-2 text-sm">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline truncate">
                          {p.platform}
                        </a>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {p.followers != null ? `${p.followers.toLocaleString()} followers` : p.kind === 'directory' ? 'listing' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">None found.</p>
                )}
              </Card>

              <Card title="Google Profile">
                {g ? (
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-xs text-gray-500">Rating</dt><dd className="text-gray-200">{g.rating != null ? `${g.rating.toFixed(1)}★` : '—'}</dd></div>
                    <div><dt className="text-xs text-gray-500">Reviews</dt><dd className="text-gray-200">{g.reviewCount ?? 0}</dd></div>
                    <div><dt className="text-xs text-gray-500">Photos</dt><dd className="text-gray-200">{(g.photoCount ?? 0) >= 10 ? '10+' : g.photoCount ?? 0}</dd></div>
                    <div><dt className="text-xs text-gray-500">Hours listed</dt><dd className="text-gray-200">{g.hasHours ? 'Yes' : 'No'}</dd></div>
                    <div className="col-span-2"><dt className="text-xs text-gray-500">Description</dt><dd className="text-gray-200">{g.hasDescription ? 'Yes' : 'No'}</dd></div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">Not checked (found via OpenStreetMap, not Google).</p>
                )}
              </Card>

              <Card title="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => patch({ notes })}
                  placeholder="Add private notes about this lead…"
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
                <p className="text-xs text-gray-600 mt-1">Auto-saves when you click away</p>
              </Card>

              {lead.sources?.length > 0 && (
                <Card title="Data Sources">
                  <dl className="space-y-3">
                    {lead.sources.map((s, i) => (
                      <div key={i}>
                        <dt className="text-xs font-medium text-gray-500">{s.field}</dt>
                        <dd className="text-xs text-gray-400 mt-0.5 break-words">{s.source}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {showOutreach && (
        <OutreachModal leadId={lead._id} leadName={lead.businessName} onClose={() => setShowOutreach(false)} />
      )}
    </div>
  )
}
