'use client'

import { useEffect, useState } from 'react'

interface Props {
  leadId: string
  leadName: string
  onClose: () => void
}

export function OutreachModal({ leadId, leadName, onClose }: Props) {
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function generate() {
      try {
        const res = await fetch('/api/outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to generate email')
        setDraft(data.draft)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    generate()
  }, [leadId])

  async function handleClose() {
    if (draft && !saving) {
      setSaving(true)
      try {
        await fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outreachDraft: draft }),
        })
      } finally {
        setSaving(false)
      }
    }
    onClose()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-100">Draft Cold Email</h2>
            <p className="text-xs text-gray-500 mt-0.5">{leadName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-800 rounded w-full" />
              <div className="h-4 bg-gray-800 rounded w-5/6" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
              <div className="h-4 bg-gray-800 rounded w-full" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none font-mono leading-relaxed"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button
            onClick={handleClose}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors px-4 py-2"
          >
            {saving ? 'Saving…' : 'Close'}
          </button>
          {!loading && !error && (
            <button
              onClick={handleCopy}
              className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy to clipboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
