import type { ChannelScore } from '@/types/lead'
import { CHANNEL_LABELS, CHANNEL_ORDER } from '@/lib/channels'

function barColor(pct: number) {
  if (pct < 0.35) return 'bg-red-500'
  if (pct < 0.65) return 'bg-yellow-500'
  return 'bg-green-500'
}

/** Per-channel marketing scores. `compact` = tiny bars for the table. */
export function ChannelBars({ scores, compact = false }: { scores: ChannelScore[]; compact?: boolean }) {
  const ordered = CHANNEL_ORDER.map((c) => scores.find((s) => s.channel === c)).filter(
    (s): s is ChannelScore => !!s
  )

  return (
    <div className={compact ? 'space-y-1 w-36' : 'space-y-3'}>
      {ordered.map((s) => {
        const pct = s.max ? s.score / s.max : 0
        return (
          <div key={s.channel} className={compact ? 'flex items-center gap-2' : ''}>
            <div className={compact ? 'w-16 shrink-0 text-[10px] text-gray-500 truncate' : 'flex justify-between text-xs mb-1'}>
              <span className={compact ? '' : 'text-gray-300 font-medium'}>{CHANNEL_LABELS[s.channel]}</span>
              {!compact && (
                <span className="text-gray-500">
                  {s.checked ? `${s.score}/${s.max}` : 'not checked'}
                </span>
              )}
            </div>
            <div className={`${compact ? 'h-1.5 flex-1' : 'h-2'} bg-gray-800 rounded-full overflow-hidden`}>
              <div
                className={`h-full rounded-full ${s.checked ? barColor(pct) : 'bg-gray-600'}`}
                style={{ width: `${Math.max(pct * 100, 3)}%` }}
                title={s.checked ? `${s.score}/${s.max}` : 'Could not check'}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
