/**
 * Thin wrapper around Whop's pixel (`window.whop.track`).
 *
 * On a *.whop.site domain Whop injects the pixel into every page, so
 * `window.whop` already exists; page views + checkout events are automatic.
 * We only fire the three custom events: estimate_requested, service_viewed,
 * deposit_started. Every call is also mirrored to a tiny on-page log
 * (visible with `?debug=1`) so the events are easy to verify in a demo.
 */

export type TrackName =
  | 'estimate_requested'
  | 'service_viewed'
  | 'deposit_started'
  | (string & {})

export interface TrackOptions {
  value?: number
  currency?: string
  event_id?: string
  variant_id?: string
  product_id?: string
}

export interface TrackLogEntry {
  at: string
  name: string
  options?: TrackOptions
  delivered: boolean
}

declare global {
  interface Window {
    whop?: { track?: (name: string, options?: TrackOptions) => void }
    __trackLog?: TrackLogEntry[]
  }
}

const EVENT = 'srr:track'

export function track(name: TrackName, options?: TrackOptions) {
  if (typeof window === 'undefined') return
  let delivered = false
  try {
    if (typeof window.whop?.track === 'function') {
      window.whop.track(name, options)
      delivered = true
    }
  } catch (err) {
    console.warn('[track] whop.track failed', err)
  }
  const entry: TrackLogEntry = {
    at: new Date().toISOString().slice(11, 19),
    name,
    options,
    delivered,
  }
  window.__trackLog = [...(window.__trackLog ?? []), entry].slice(-50)
  console.info(`[whop.track] ${name}`, options ?? '', delivered ? '(sent)' : '(pixel not present — local only)')
  window.dispatchEvent(new CustomEvent(EVENT, { detail: entry }))
}

/** Subscribe to the local log (used by the debug panel). */
export function onTrack(cb: (e: TrackLogEntry) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<TrackLogEntry>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
