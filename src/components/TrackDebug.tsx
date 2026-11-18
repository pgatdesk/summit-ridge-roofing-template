import { useEffect, useState } from 'react'
import { onTrack, type TrackLogEntry } from '../lib/track'

/**
 * Pixel event log. Appears only when the URL has ?debug=1 — handy for
 * demos and screen recordings. Shows each whop.track call as it fires.
 */
export function TrackDebug() {
  const [enabled, setEnabled] = useState(false)
  const [log, setLog] = useState<TrackLogEntry[]>([])
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const on = new URLSearchParams(window.location.search).get('debug') === '1' || sessionStorage.getItem('srr-debug') === '1'
    if (on) sessionStorage.setItem('srr-debug', '1')
    setEnabled(on)
    setLog(window.__trackLog ?? [])
    return onTrack((e) => setLog((l) => [...l, e].slice(-30)))
  }, [])

  if (!enabled) return null
  return (
    <aside
      aria-label="Pixel event log"
      className="fixed right-3 bottom-3 z-[60] w-[min(92vw,22rem)] rounded-xl border border-stone-700 bg-stone-900/95 text-xs text-stone-100 shadow-2xl"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 font-semibold"
      >
        <span>whop.track events ({log.length})</span>
        <span aria-hidden>{open ? '–' : '+'}</span>
      </button>
      {open && (
        <ol className="max-h-56 space-y-1 overflow-auto px-3 pb-3 font-mono">
          {log.length === 0 && <li className="text-stone-400">No events yet — interact with the page.</li>}
          {[...log].reverse().map((e, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-stone-400">{e.at}</span>
              <span className="font-semibold text-amber-300">{e.name}</span>
              <span className={e.delivered ? 'text-emerald-400' : 'text-stone-500'}>{e.delivered ? 'sent' : 'local'}</span>
              {e.options && <span className="w-full text-stone-400">{JSON.stringify(e.options)}</span>}
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}
