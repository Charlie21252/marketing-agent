'use client'

import { useState } from 'react'
import type { Lead } from '@/types/lead'

interface Props {
  lead: Lead
  script: string
  onScriptChange: (value: string) => void
  onSaveScript: () => void
}

export function ClosingScriptPanel({ lead, script, onScriptChange, onSaveScript }: Props) {
  const [subTab, setSubTab] = useState<'script' | 'calendar'>('script')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setSubTab('script')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            subTab === 'script'
              ? 'border-violet-500 text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Script
        </button>
        <button
          onClick={() => setSubTab('calendar')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            subTab === 'calendar'
              ? 'border-violet-500 text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Book Meeting
        </button>
      </div>

      {subTab === 'script' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Closing Script</h2>
          <textarea
            value={script}
            onChange={(e) => onScriptChange(e.target.value)}
            onBlur={onSaveScript}
            placeholder="Write your closing script / call notes here…"
            rows={16}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none font-mono leading-relaxed"
          />
          <p className="text-xs text-gray-600 mt-1">Auto-saves when you click away</p>
        </div>
      )}

      {subTab === 'calendar' && <CalendarInviteForm lead={lead} />}
    </div>
  )
}

function CalendarInviteForm({ lead }: { lead: Lead }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(30)
  const [guestEmail, setGuestEmail] = useState(lead.contactEmail ?? '')

  function buildCalendarLink(): string | null {
    if (!date || !time) return null

    const start = new Date(`${date}T${time}`)
    if (Number.isNaN(start.getTime())) return null
    const end = new Date(start.getTime() + duration * 60000)

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Marketing Review — ${lead.businessName}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Quick look at your current marketing (Google listing, social pages, print) and a few free mockups.${
        lead.url ? `\n\nSite: ${lead.url}` : ''
      }`,
    })
    if (lead.address) params.set('location', lead.address)
    if (guestEmail) params.set('add', guestEmail)

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const link = buildCalendarLink()

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Book Meeting</h2>
        <p className="text-xs text-gray-500">
          Pick a date and time to invite {lead.businessName} to a quick marketing review. This opens a
          pre-filled Google Calendar event you can review and send.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Client Email</label>
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="client@example.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <p className="text-xs text-gray-600 mt-1">
          {lead.contactEmail
            ? 'Pre-filled from this lead — edit if needed.'
            : 'No contact email on file — enter one to invite the client directly.'}
        </p>
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded transition-colors"
        >
          Create Calendar Invite
        </a>
      ) : (
        <p className="text-xs text-gray-600">Pick a date and time to continue.</p>
      )}
    </div>
  )
}
