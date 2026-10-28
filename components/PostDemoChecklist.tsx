'use client'

import { useEffect, useState } from 'react'

const SEQUENCE_STEPS = [
  'Show free mockup (business card / flyer / social page)',
  'They agree → confirm package and send payment request',
  'Collect brand assets: logo files, colors, photos, hours, contact info',
  'Send proofs for approval (cards, flyers, signage)',
  'Approved → place print order / set up social & Google profile',
  'Deliver print materials and hand over social logins',
  'Follow up in 2 weeks: ask for a Google review + referral',
]

const ASSET_REQUEST_MESSAGE = `Thanks again — excited to get started. To put everything together I'll need:

1. Your logo (any format — even a photo of a sign or old card works)
2. Any colors or fonts you already use
3. 5–10 photos of your work, team or storefront
4. Business hours, phone, email, and address exactly as you want them printed
5. Any offer you'd like on the flyer (e.g. "10% off first visit")

You can just reply to this email with whatever you have.`

const REVIEW_REQUEST_MESSAGE = `Hope the new cards and flyers are working out. Quick favor — if you've been happy with everything, would you mind leaving a short Google review? It really helps me out.

And if you know another business owner who could use the same thing, I'd appreciate the intro.`

const STORAGE_KEY = 'adamPostPitchChecklist'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors flex-shrink-0"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function MessageCard({ title, hint, text }: { title: string; hint: string; text: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
        <CopyButton text={text} />
      </div>
      <p className="text-xs text-gray-500 mb-3">{hint}</p>
      <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed bg-gray-800 border border-gray-700 rounded-lg p-3">
        {text}
      </pre>
    </div>
  )
}

export function PostDemoChecklist() {
  const [checked, setChecked] = useState<boolean[]>(() => SEQUENCE_STEPS.map(() => false))

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
      if (Array.isArray(parsed) && parsed.length === SEQUENCE_STEPS.length) setChecked(parsed)
    } catch {
      // ignore missing or corrupt storage
    }
  }, [])

  function save(next: boolean[]) {
    setChecked(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable — checklist still works for this visit
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">After the Pitch</h2>
          <button
            onClick={() => save(SEQUENCE_STEPS.map(() => false))}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
        <ul className="space-y-3">
          {SEQUENCE_STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => save(checked.map((c, j) => (j === i ? !c : c)))}
                className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-gray-800 accent-violet-500"
              />
              <span className={`text-sm ${checked[i] ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <MessageCard title="Brand Asset Request" hint="Send once they say yes." text={ASSET_REQUEST_MESSAGE} />
      <MessageCard title="Review & Referral Ask" hint="Send about two weeks after delivery." text={REVIEW_REQUEST_MESSAGE} />
    </div>
  )
}
