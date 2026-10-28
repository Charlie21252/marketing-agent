export function getLeadStrength(score: number): { label: string; color: string } {
  if (score <= 35) return { label: 'Strong Lead', color: 'text-green-400 bg-green-500/20 ring-green-500/30' }
  if (score <= 55) return { label: 'Medium Lead', color: 'text-yellow-400 bg-yellow-500/20 ring-yellow-500/30' }
  return { label: 'Weak Lead', color: 'text-gray-400 bg-gray-500/20 ring-gray-500/30' }
}

export function getMarketingChip(score: number): { label: string; color: string } {
  if (score <= 35) return { label: 'Weak Marketing', color: 'text-red-400 bg-red-500/20 ring-red-500/30' }
  if (score <= 55) return { label: 'Patchy Marketing', color: 'text-yellow-400 bg-yellow-500/20 ring-yellow-500/30' }
  return { label: 'Strong Marketing', color: 'text-green-400 bg-green-500/20 ring-green-500/30' }
}

export function ScoreChip({ score }: { score: number | undefined }) {
  if (score === undefined || score === null) {
    return <span className="text-xs text-gray-600">—</span>
  }
  const mk = getMarketingChip(score)
  const lead = getLeadStrength(score)
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${mk.color}`}>
        {score} · {mk.label}
      </span>
      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${lead.color}`}>
        {lead.label}
      </span>
    </div>
  )
}
