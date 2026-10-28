'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LeadStatus } from '@/types/lead'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'responded', 'closed', 'not_interested']

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  responded: 'Responded',
  closed: 'Closed',
  not_interested: 'Not Interested',
}

export function StatusDropdown({ leadId, initialStatus }: { leadId: string; initialStatus: LeadStatus }) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus

    if (newStatus === 'not_interested') {
      if (!confirm('Mark as Not Interested and delete this lead?')) {
        e.target.value = status
        return
      }
      setSaving(true)
      try {
        await fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
        router.refresh()
      } finally {
        setSaving(false)
      }
      return
    }

    setStatus(newStatus)
    setSaving(true)
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className="rounded bg-gray-800 border border-gray-700 text-gray-200 text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}
