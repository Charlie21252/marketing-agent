'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }
      // Only follow same-site paths after login.
      const next = searchParams.get('next')
      window.location.href = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
    } catch {
      setError('Network error — check your connection')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">LeadFlow</h1>
        <p className="text-sm text-gray-500 mt-1">Enter the password to continue.</p>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs text-gray-400 font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white text-sm font-medium px-5 py-2 rounded transition-colors"
      >
        {loading ? 'Checking…' : 'Log in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
