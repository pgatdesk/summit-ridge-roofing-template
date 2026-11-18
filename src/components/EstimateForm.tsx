import { useState, type FormEvent } from 'react'
import { site } from '../site.config'
import { submitEstimate } from '../lib/api'
import { track } from '../lib/track'
import { Icon } from './sections'

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done'; leadId: string } | { kind: 'error'; message: string }

/** "Request an Estimate" — creates a lead on your Whop account (see lib/api.ts). */
export function EstimateForm() {
  const f = site.estimateForm
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setState({ kind: 'sending' })
    try {
      const res = await submitEstimate({
        data: {
          name: String(fd.get('name') ?? ''),
          email: String(fd.get('email') ?? ''),
          phone: String(fd.get('phone') ?? ''),
          zip: String(fd.get('zip') ?? ''),
          interest: String(fd.get('interest') ?? ''),
          message: String(fd.get('message') ?? ''),
          website: String(fd.get('website') ?? ''),
          source: 'estimate_form',
        },
      })
      // Custom pixel event + Whop's standard "lead" event, deduplicated by lead id.
      track('estimate_requested', { event_id: `est_${res.leadId}` })
      track('lead', { event_id: `lead_${res.leadId}` })
      setState({ kind: 'done', leadId: res.leadId })
      form.reset()
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong. Please call us instead.' })
    }
  }

  return (
    <section id="estimate" className="bg-soft py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">Contact</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{f.heading}</h2>
          <p className="mt-3 text-stone-600">{f.sub}</p>
          <ul className="mt-6 space-y-3 text-stone-700">
            <li className="flex items-center gap-3">
              <Icon name="phone" className="size-5 text-brand" />
              <a href={site.company.phoneHref} className="font-semibold">
                {site.company.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Icon name="pin" className="size-5 text-brand" /> {site.company.address}
            </li>
            <li className="flex items-center gap-3">
              <Icon name="shield" className="size-5 text-brand" /> {site.company.hours}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {state.kind === 'done' ? (
            <div role="status" className="py-10 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon name="check" className="size-7" />
              </span>
              <h3 className="mt-4 text-2xl font-bold">Request received</h3>
              <p className="mt-2 text-stone-600">Thanks! A roofing specialist will contact you within one business day.</p>
              <button type="button" className="btn btn-ghost mt-6" onClick={() => setState({ kind: 'idle' })}>
                Send another request
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate={false} className="grid gap-4" aria-describedby="est-status">
              <div className="grid gap-4 sm:grid-cols-2">
                <Labeled label="Full name" htmlFor="name">
                  <input id="name" name="name" required autoComplete="name" className="field" placeholder="Jane Homeowner" />
                </Labeled>
                <Labeled label="Phone" htmlFor="phone">
                  <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" className="field" placeholder="(303) 555-0100" />
                </Labeled>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Labeled label="Email" htmlFor="email">
                  <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" />
                </Labeled>
                <Labeled label="Property ZIP" htmlFor="zip">
                  <input id="zip" name="zip" required autoComplete="postal-code" inputMode="numeric" pattern="\d{5}(-\d{4})?" className="field" placeholder="80204" />
                </Labeled>
              </div>
              <Labeled label="What do you need?" htmlFor="interest">
                <select id="interest" name="interest" className="field" defaultValue={f.interests[0]}>
                  {f.interests.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Tell us about the roof (optional)" htmlFor="message">
                <textarea id="message" name="message" rows={4} maxLength={450} className="field" placeholder="Age of roof, any leaks, storm damage, timeline…" />
              </Labeled>
              {/* Honeypot: hidden from people, irresistible to bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <p id="est-status" role="alert" className="min-h-5 text-sm font-medium text-red-700">
                {state.kind === 'error' ? state.message : ''}
              </p>
              <button type="submit" className="btn btn-primary" disabled={state.kind === 'sending'}>
                {state.kind === 'sending' ? 'Sending…' : 'Get my free estimate'}
              </button>
              <p className="text-center text-xs text-stone-500">No spam, no obligation. We only use your details to prepare your quote.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Labeled({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-stone-700">
        {label}
      </label>
      {children}
    </div>
  )
}
