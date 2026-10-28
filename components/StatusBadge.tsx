import type { LeadStatus } from '@/types/lead'

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-violet-500/20 text-violet-400 ring-violet-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
  responded: 'bg-purple-500/20 text-purple-400 ring-purple-500/30',
  closed: 'bg-green-500/20 text-green-400 ring-green-500/30',
  not_interested: 'bg-gray-500/20 text-gray-400 ring-gray-500/30',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  responded: 'Responded',
  closed: 'Closed',
  not_interested: 'Not Interested',
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
