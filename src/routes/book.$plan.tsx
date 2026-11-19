import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { site, type PlanKey } from '../site.config'
import { track } from '../lib/track'
import { confirmCardOnFile } from '../lib/api'
import { CheckoutPanel } from '../components/CheckoutPanel'
import { Icon, Footer } from '../components/sections'

export const Route = createFileRoute('/book/$plan')({
  beforeLoad: ({ params }) => {
    if (!(params.plan in site.plans)) throw notFound()
  },
  head: ({ params }) => ({
    meta: [{ title: `${site.plans[params.plan as PlanKey]?.title ?? 'Book'} — ${site.company.name}` }],
  }),
  component: BookPage,
})

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

type Step = 'pay' | 'card' | 'done'

function BookPage() {
  const { plan: key } = Route.useParams() as { plan: PlanKey }
  const plan = site.plans[key]
  const isDeposit = key === 'deposit'
  const [step, setStep] = useState<Step>('pay')
  const [cardSaved, setCardSaved] = useState<boolean | null>(null)
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const fired = useRef(false)

  // service_viewed for every plan page; deposit_started when the deposit checkout opens.
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const base = { variant_id: plan.id, value: plan.price, currency: 'USD' }
    track('service_viewed', { ...base, event_id: `sv_${key}_${Date.now()}` })
    if (isDeposit) track('deposit_started', { ...base, event_id: `dep_${Date.now()}` })
  }, [key, plan.id, plan.price, isDeposit])

  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-bold tracking-tight">
            ← {site.company.name}
          </Link>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
            <Icon name="shield" className="size-4" /> Secure checkout
          </span>
        </div>
      </header>

      <main className="bg-soft">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[.9fr_1.1fr] lg:py-14">
          <aside>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">{isDeposit ? 'Step 1 of 2 · Deposit' : 'Your order'}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{plan.title}</h1>
            <p className="mt-2 text-stone-600">{plan.blurb}</p>
            <p className="mt-5 text-4xl font-bold">{usd(plan.price)}</p>
            <ul className="mt-6 space-y-2 text-sm text-stone-700">
              {plan.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand" /> {b}
                </li>
              ))}
            </ul>
            {isDeposit && (
              <ol className="mt-8 space-y-3 rounded-xl border border-stone-200 bg-white p-4 text-sm">
                <Stage n={1} active={step === 'pay'} done={step !== 'pay'} label={`Pay your ${usd(plan.price)} deposit`} />
                <Stage n={2} active={step === 'card'} done={step === 'done'} label="Save a card for your final balance (nothing charged)" />
              </ol>
            )}
          </aside>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
            {site.whop.environment === 'sandbox' && (
              <p role="note" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <strong>Test mode: no real charges.</strong> Pay with the test card <span className="font-mono">4242 4242 4242 4242</span>, any future expiry, any CVC and any ZIP.
              </p>
            )}
            {step === 'pay' && (
              <>
                <h2 className="mb-4 text-lg font-bold">Payment</h2>
                <CheckoutPanel
                  plan={plan.id}
                  returnUrl={`${origin}/thanks?plan=${key}`}
                  metadata={{ site_plan: key }}
                  onComplete={(p) => {
                    if (p.result !== 'payment') return
                    if (isDeposit) setStep('card')
                    else window.location.assign(`/thanks?plan=${key}&payment=${p.paymentId}&status=succeeded`)
                  }}
                />
              </>
            )}

            {step === 'card' && (
              <>
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Deposit received — thank you!</div>
                <h2 className="text-lg font-bold">Keep a card on file</h2>
                <p className="mt-1 mb-4 text-sm text-stone-600">
                  Save a payment method now so your final balance can be billed automatically when the job is finished. <strong>Nothing is charged today.</strong>
                </p>
                <CheckoutPanel
                  express={false}
                  checkoutConfiguration={site.whop.setupCheckoutConfigId}
                  returnUrl={`${origin}/thanks?plan=${key}&card=1`}
                  onComplete={async (p) => {
                    if (p.result !== 'setup') return
                    try {
                      const r = await confirmCardOnFile({ data: { setupIntentId: p.setupIntentId } })
                      setCardSaved(r.saved)
                    } catch {
                      setCardSaved(false)
                    }
                    setStep('done')
                  }}
                />
                <button type="button" onClick={() => setStep('done')} className="mt-4 text-sm font-semibold text-stone-500 underline-offset-4 hover:underline">
                  Skip for now (we will email an invoice instead)
                </button>
              </>
            )}

            {step === 'done' && (
              <div className="py-8 text-center" role="status">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon name="check" className="size-7" />
                </span>
                <h2 className="mt-4 text-2xl font-bold">You are on the schedule</h2>
                <p className="mt-2 text-stone-600">
                  {cardSaved
                    ? 'Your deposit is paid and a card is saved. We will bill the remaining balance only after the work is complete.'
                    : 'Your deposit is paid. We will email you an invoice for the remaining balance when the work is complete.'}
                </p>
                <Link to="/" className="btn btn-primary mt-6">
                  Back to home
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Stage({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-3 ${active ? 'font-semibold text-ink' : 'text-stone-500'}`}>
      <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? 'bg-emerald-600 text-white' : active ? 'bg-brand text-white' : 'bg-stone-200'}`}>{done ? '✓' : n}</span>
      {label}
    </li>
  )
}
