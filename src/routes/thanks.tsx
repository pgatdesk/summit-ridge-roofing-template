import { createFileRoute, Link } from '@tanstack/react-router'
import { site, type PlanKey } from '../site.config'
import { Footer, Icon } from '../components/sections'

/**
 * Return URL for off-site payment steps (some financing / wallet flows leave
 * the page and come back here with ?status=succeeded|failed|canceled).
 * Order fulfilment should be driven by Whop webhooks, not this page.
 */
export const Route = createFileRoute('/thanks')({
  validateSearch: (s: Record<string, unknown>) => ({
    plan: typeof s.plan === 'string' ? s.plan : undefined,
    status: typeof s.status === 'string' ? s.status : undefined,
    payment: typeof s.payment === 'string' ? s.payment : undefined,
    card: typeof s.card === 'string' ? s.card : undefined,
  }),
  component: Thanks,
})

function Thanks() {
  const { plan, status, payment, card } = Route.useSearch()
  const p = plan && plan in site.plans ? site.plans[plan as PlanKey] : null
  const ok = !status || status === 'succeeded'
  return (
    <>
      <main className="grid min-h-[70vh] place-items-center bg-soft px-5 py-16">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm" role="status">
          <span className={`mx-auto grid size-14 place-items-center rounded-full ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            <Icon name={ok ? 'check' : 'shield'} className="size-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{ok ? (card ? 'Card saved' : 'Payment received') : 'Payment not completed'}</h1>
          <p className="mt-2 text-stone-600">
            {ok
              ? `${p ? `Your ${p.title} is confirmed. ` : ''}A receipt is on its way to your email, and ${site.company.name} will be in touch shortly.`
              : 'Your payment did not go through and you have not been charged. You can try again or call us.'}
          </p>
          {payment && <p className="mt-3 font-mono text-xs text-stone-400">Ref {payment}</p>}
          <Link to="/" className="btn btn-primary mt-6">
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
