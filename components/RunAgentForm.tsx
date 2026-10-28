'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BUSINESS_TYPES } from '@/lib/businessTypes'

interface BatchProgress {
  current: number
  total: number
  label: string
  found: number
}

export function RunAgentForm() {
  const router = useRouter()
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordDropdownOpen, setKeywordDropdownOpen] = useState(false)
  const keywordDropdownRef = useRef<HTMLDivElement>(null)
  const [zip, setZip] = useState('')
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ found: number; skippedStrong?: number; skippedChains?: number; errors?: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (keywordDropdownRef.current && !keywordDropdownRef.current.contains(e.target as Node)) {
        setKeywordDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleKeyword(value: string) {
    setKeywords((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const zipValid = /^\d{5}$/.test(zip)

  async function runSearch(searchKeyword: string) {
    const res = await fetch('/api/agents/find-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: searchKeyword, zip, count }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
    return data as { found: number; skippedStrong?: number; skippedChains?: number; errors?: string[] }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (keywords.length === 0 || !zipValid) return

    setLoading(true)
    setResult(null)
    setError(null)
    setKeywordDropdownOpen(false)

    if (keywords.length === 1) {
      try {
        const data = await runSearch(keywords[0])
        setResult({ found: data.found, skippedStrong: data.skippedStrong, skippedChains: data.skippedChains, errors: data.errors })
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error — check your connection')
      } finally {
        setLoading(false)
      }
      return
    }

    setBatchProgress({ current: 0, total: keywords.length, label: '', found: 0 })
    let totalFound = 0
    let totalSkipped = 0
    let totalChains = 0
    const errors: string[] = []

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i]
      const typeLabel = BUSINESS_TYPES.find((t) => t.value === keyword)?.label ?? keyword
      setBatchProgress({ current: i + 1, total: keywords.length, label: `${typeLabel} near ${zip}`, found: totalFound })

      try {
        const data = await runSearch(keyword)
        totalFound += data.found
        totalSkipped += data.skippedStrong ?? 0
        totalChains += data.skippedChains ?? 0
        if (data.errors) errors.push(...data.errors)
        router.refresh()
      } catch (err) {
        errors.push(`${typeLabel} near ${zip}: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }

    setResult({ found: totalFound, skippedStrong: totalSkipped, skippedChains: totalChains, errors })
    setBatchProgress(null)
    setLoading(false)
  }

  const keywordTriggerLabel =
    keywords.length === 0
      ? 'Select business types…'
      : keywords.length === 1
        ? (BUSINESS_TYPES.find((t) => t.value === keywords[0])?.label ?? keywords[0])
        : `${keywords.length} types selected`

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        {/* Business type multi-select */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px] relative" ref={keywordDropdownRef}>
          <label className="text-xs text-gray-400 font-medium">Business type</label>
          <button
            type="button"
            disabled={loading}
            onClick={() => setKeywordDropdownOpen((o) => !o)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          >
            <span className={keywords.length === 0 ? 'text-gray-500' : 'text-gray-100'}>{keywordTriggerLabel}</span>
            <svg
              className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${keywordDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {keywordDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-gray-800 border border-gray-700 rounded shadow-xl max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 sticky top-0 bg-gray-800">
                <button
                  type="button"
                  onClick={() => setKeywords(BUSINESS_TYPES.map((t) => t.value))}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setKeywords([])}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              {BUSINESS_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={keywords.includes(type.value)}
                    onChange={() => toggleKeyword(type.value)}
                    className="accent-violet-500 shrink-0"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Zip code */}
        <div className="flex flex-col gap-1 w-40">
          <label htmlFor="zip" className="text-xs text-gray-400 font-medium">
            Zip code <span className="text-gray-500 font-normal">(20 mi radius)</span>
          </label>
          <input
            id="zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 60540"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            disabled={loading}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>

        {/* Count */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Count</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={loading}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || keywords.length === 0 || !zipValid}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white text-sm font-medium px-5 py-2 rounded transition-colors flex items-center gap-2"
        >
          {loading && !batchProgress ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Finding leads…
            </>
          ) : (
            'Find Leads'
          )}
        </button>
      </form>

      {batchProgress && (
        <p className="text-xs text-gray-500 mt-3">
          Searching {batchProgress.current}/{batchProgress.total}: {batchProgress.label}… ({batchProgress.found} found
          so far). This can take a long time — feel free to leave this tab open.
        </p>
      )}

      {loading && !batchProgress && (
        <p className="text-xs text-gray-500 mt-3">
          Auditing websites, social pages and Google listings, then writing pitch angles — this takes 1–3 minutes depending on batch size…
        </p>
      )}

      {result && (
        <div className="mt-3 text-sm text-green-400">
          ✓ Found and saved {result.found} lead{result.found !== 1 ? 's' : ''}.
          {!!result.skippedStrong && (
            <span className="text-gray-500 ml-2">({result.skippedStrong} already had strong marketing)</span>
          )}
          {!!result.skippedChains && (
            <span className="text-gray-500 ml-2">({result.skippedChains} chains skipped)</span>
          )}
          {result.errors && result.errors.length > 0 && (
            <span className="text-yellow-400 ml-2">({result.errors.length} failed)</span>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  )
}
