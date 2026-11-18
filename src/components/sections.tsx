import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { site, type PlanKey } from '../site.config'
import { track } from '../lib/track'

const usd = (n: number) => `$${n.toLocaleString('en-US')}`

/* ---------- icons ---------- */
function Icon({ name, className = 'size-6' }: { name: string; className?: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  const paths: Record<string, React.ReactNode> = {
    wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />,
    home: <path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
    check: <path d="M5 12l5 5 9-10" />,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    pin: (
      <>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    shield: <path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z" />,
    star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...p}>
      {paths[name] ?? paths.check}
    </svg>
  )
}
export { Icon }

/* ---------- header ---------- */
export function Header() {
  const [open, setOpen] = useState(false)
  const links = [
    ['Services', '#services'],
    ['Pricing', '#pricing'],
    ['Service area', '#area'],
    ['Financing', '#financing'],
    ['Reviews', '#reviews'],
    ['Contact', '#estimate'],
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-brand text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 13l9-8 9 8M6 11v9h12v-9" />
            </svg>
          </span>
          {site.company.name}
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 lg:flex" aria-label="Primary">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="hover:text-brand">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={site.company.phoneHref} className="hidden items-center gap-2 text-sm font-semibold sm:flex">
            <Icon name="phone" className="size-4 text-brand" /> {site.company.phone}
          </a>
          <a href="#estimate" className="btn btn-primary !min-h-10 !px-4 !py-2 text-sm">
            Free estimate
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-lg border border-stone-200 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-stone-200 bg-white px-5 py-3 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {links.map(([l, h]) => (
              <li key={h}>
                <a href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-soft">
                  {l}
                </a>
              </li>
            ))}
            <li>
              <a href={site.company.phoneHref} className="block rounded-lg px-3 py-3 font-semibold text-brand">
                Call {site.company.phone}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

/* ---------- hero ---------- */
export function Hero() {
  const h = site.hero
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(1200px 500px at 85% -10%, color-mix(in srgb, var(--color-brand) 55%, transparent), transparent 60%), radial-gradient(800px 400px at -10% 110%, color-mix(in srgb, var(--color-brand) 30%, transparent), transparent 60%)',
        }}
      />
      <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 22px)' }} />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
        <div>
          <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-orange-200 ring-1 ring-white/15">{h.eyebrow}</p>
          <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">{h.headline}</h1>
          <p className="mt-5 max-w-xl text-lg text-stone-300 text-pretty">{h.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#estimate" className="btn btn-primary">
              Request a free estimate
            </a>
            <Link
              to="/book/$plan"
              params={{ plan: 'inspection' }}
              onClick={() => track('service_viewed', { variant_id: site.plans.inspection.id, value: site.plans.inspection.price, currency: 'USD' })}
              className="btn border border-white/25 bg-white/5 text-white hover:bg-white/15"
            >
              Book inspection · {usd(site.plans.inspection.price)}
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {h.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-bold text-white sm:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs text-stone-400 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/15 backdrop-blur">
          <p className="text-sm font-semibold tracking-wide text-orange-200 uppercase">How it works</p>
          <ol className="mt-4 space-y-4">
            {[
              ['Inspect', `Book a ${usd(site.plans.inspection.price)} inspection. Credited to your project.`],
              ['Quote', 'Get a clear written quote with photos. No pressure.'],
              ['Reserve', `Secure your date with a ${usd(site.plans.deposit.price)} deposit.`],
              ['Finish', 'Pay the balance only after the job is complete.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold">{i + 1}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-stone-300">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------- trust strip ---------- */
export function TrustStrip() {
  return (
    <section aria-label="Trust badges" className="border-b border-stone-200 bg-soft">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-4 text-sm font-semibold text-stone-600">
        {site.reviews.trust.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Icon name="shield" className="size-4 text-brand" /> {t}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- services ---------- */
export function Services() {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <SectionHead eyebrow="Services" title="Repair, replace, or just know where you stand" sub="Three ways to work with us. Every job starts with a written, itemised price." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {site.services.map((s) => {
          const plan = site.plans[s.cta.plan as PlanKey]
          const isOpen = openSlug === s.slug
          return (
            <article key={s.slug} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <span className="grid size-12 place-items-center rounded-xl bg-orange-50 text-brand">
                <Icon name={s.icon} />
              </span>
              <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
              <p className="mt-1 text-sm font-semibold text-brand">{s.from}</p>
              <p className="mt-3 text-stone-600">{s.summary}</p>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => {
                  const next = isOpen ? null : s.slug
                  setOpenSlug(next)
                  if (next) track('service_viewed', { variant_id: plan.id, value: plan.price, currency: 'USD' })
                }}
                className="mt-4 self-start text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                {isOpen ? 'Hide details' : 'What’s included'}
              </button>
              {isOpen && (
                <ul className="mt-3 space-y-2 text-sm text-stone-700">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand" /> {p}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto pt-6">
                <Link to="/book/$plan" params={{ plan: s.cta.plan }} className="btn btn-primary w-full">
                  {s.cta.label} · {usd(plan.price)}
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- pricing / plans ---------- */
export function Pricing() {
  const order: PlanKey[] = ['inspection', 'deposit', 'flatRate']
  return (
    <section id="pricing" className="bg-soft py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead eyebrow="Book online" title="Pay securely, only for what you need" sub="Checkout runs on Whop with Apple Pay, Google Pay and cards. Financing options appear automatically when available." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {order.map((k) => {
            const p = site.plans[k]
            const featured = k === 'deposit'
            return (
              <article
                key={k}
                className={`relative flex flex-col rounded-2xl bg-white p-7 shadow-sm ${featured ? 'border-2 border-brand' : 'border border-stone-200'}`}
              >
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">Most popular</span>}
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{p.blurb}</p>
                <p className="mt-5 text-4xl font-bold tracking-tight">{usd(p.price)}</p>
                <ul className="mt-5 space-y-2 text-sm text-stone-700">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand" /> {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/book/$plan"
                  params={{ plan: k }}
                  onClick={() => k === 'deposit' && track('deposit_started', { variant_id: p.id, value: p.price, currency: 'USD', event_id: `dep_click_${Date.now()}` })}
                  className={`btn mt-7 ${featured ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {k === 'deposit' ? 'Pay deposit' : k === 'inspection' ? 'Book inspection' : 'Book flat-rate service'}
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- service area ---------- */
export function ServiceArea() {
  const a = site.serviceArea
  return (
    <section id="area" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHead eyebrow="Service area" title={a.headline} sub={a.sub} left />
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-stone-700 sm:grid-cols-3">
            {a.cities.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <Icon name="pin" className="size-4 shrink-0 text-brand" /> {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-ink text-white">
          <div aria-hidden className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-brand) 0, transparent 55%), repeating-radial-gradient(circle at 50% 50%, transparent 0 38px, rgba(255,255,255,.12) 39px 40px)' }} />
          <div className="relative text-center">
            <Icon name="pin" className="mx-auto size-10 text-orange-300" />
            <p className="mt-2 text-3xl font-bold">45 miles</p>
            <p className="text-stone-300">of downtown Denver</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- financing ---------- */
export function Financing() {
  const f = site.financing
  return (
    <section id="financing" className="bg-ink py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold tracking-wide text-orange-300 uppercase">Financing</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{f.headline}</h2>
          <p className="mt-4 max-w-xl text-stone-300">{f.body}</p>
          <p className="mt-4 text-xs text-stone-400">{f.note}</p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {f.badges.map((b) => (
            <li key={b} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- reviews ---------- */
export function Reviews() {
  const r = site.reviews
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <SectionHead eyebrow="Reviews" title={`${r.rating} out of 5 from ${r.count.toLocaleString('en-US')} homeowners`} sub="Real customers, real roofs. Ask us for references any time." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {r.items.map((i) => (
          <figure key={i.name} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, n) => (
                <Icon key={n} name="star" className="size-5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 text-stone-700">“{i.text}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold">
              {i.name} <span className="font-normal text-stone-500">· {i.town}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ---------- footer ---------- */
export function Footer() {
  const c = site.company
  return (
    <footer className="border-t border-stone-200 bg-soft">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{c.name}</p>
          <p className="mt-2 text-sm text-stone-600">{c.tagline}</p>
          <p className="mt-2 text-xs text-stone-500">{c.license}</p>
        </div>
        <address className="text-sm not-italic text-stone-700">
          <p>{c.address}</p>
          <p className="mt-1">
            <a href={c.phoneHref} className="font-semibold text-brand">
              {c.phone}
            </a>
          </p>
          <p className="mt-1">
            <a href={`mailto:${c.email}`}>{c.email}</a>
          </p>
          <p className="mt-1 text-stone-500">{c.hours}</p>
        </address>
        <p className="text-xs text-stone-500">
          © {new Date().getFullYear()} {c.name}. Payments processed securely by Whop.
        </p>
      </div>
    </footer>
  )
}

/* ---------- shared ---------- */
export function SectionHead({ eyebrow, title, sub, left }: { eyebrow: string; title: string; sub?: string; left?: boolean }) {
  return (
    <div className={left ? '' : 'mx-auto max-w-2xl text-center'}>
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-stone-600 text-pretty">{sub}</p>}
    </div>
  )
}
