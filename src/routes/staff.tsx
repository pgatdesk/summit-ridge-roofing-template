import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { site } from '../site.config'
import { findCustomer, createFinalInvoice, type CustomerSummary } from '../lib/api'

/**
 * Staff invoice console — the "final balance" half of deposit → job → invoice.
 * Protected by the ADMIN_PASSCODE app secret (checked on the server).
 * Not linked from the public site, and told not to be indexed.
 */
export const Route = createFileRoute('/staff')({
  head: () => ({ meta: [{ title: `Staff console — ${site.company.name}` }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: Staff,
})

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function Staff() {
  const [pass, setPass] = useState('')
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null)
  const [sel, setSel] = useState<CustomerSummary | null>(null)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('Final balance — roof replacement (contract total less deposit)')
  const [mode, setMode] = useState<'charge' | 'send'>('charge')
  const [pm, setPm] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function search(e?: FormEvent) {
    e?.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const list = await findCustomer({ data: { passcode: pass, query } })
      setCustomers(list)
      if (!list.length) setMsg({ ok: false, text: 'No customers found.' })
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Lookup failed' })
    } finally {
      setBusy(false)
    }
  }

  async function bill(e: FormEvent) {
    e.preventDefault()
    if (!sel) return
    setBusy(true)
    setMsg(null)
    try {
      const r = await createFinalInvoice({
        data: { passcode: pass, memberId: sel.memberId, amount: Number(amount), description: desc, memo: 'Thank you for choosing ' + site.company.name + '.', mode, paymentMethodId: pm || sel.paymentMethods[0]?.id },
      })
      setMsg({
        ok: true,
        text:
          (r.mode === 'charge' ? 'Invoice issued and the saved card was charged' : 'Invoice emailed to the customer for manual payment') +
          ` — ${r.invoiceId} (${r.status || 'created'}).` +
          (r.url ? ` ${r.url}` : ''),
      })
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Invoice failed' })
    } finally {
      setBusy(false)
    }
  }

  const hasCard = !!sel?.paymentMethods.length
  return (
    <main className="min-h-screen bg-soft px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-semibold text-brand">
          ← Site
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Final balance invoices</h1>
        <p className="mt-2 text-stone-600">
          After the job, bill what remains. Auto-charge the card saved at deposit checkout, or send the invoice for the customer to pay manually. Built on the Whop Invoices API.
        </p>

        <form onSubmit={search} className="mt-6 grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-[1fr_1fr_auto]">
          <input className="field" type="password" placeholder="Staff passcode" value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="current-password" />
          <input className="field" placeholder="Customer name or email (blank = newest)" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-primary" disabled={busy || !pass}>
            Find
          </button>
        </form>

        {customers && customers.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {customers.map((c) => (
              <li key={c.memberId}>
                <button
                  type="button"
                  onClick={() => {
                    setSel(c)
                    setPm(c.paymentMethods[0]?.id ?? '')
                    setMode(c.paymentMethods.length ? 'charge' : 'send')
                    setMsg(null)
                  }}
                  className={`w-full rounded-xl border bg-white p-4 text-left ${sel?.memberId === c.memberId ? 'border-brand ring-2 ring-brand/20' : 'border-stone-200'}`}
                >
                  <span className="font-semibold">{c.name ?? 'Unnamed'}</span> <span className="text-stone-500">{c.email}</span>
                  <span className="mt-1 block text-xs text-stone-500">
                    {c.paymentMethods.length ? `Card on file: ${c.paymentMethods.map((p) => p.label).join(', ')}` : 'No card on file'}
                    {c.metadata.interest ? ` · ${c.metadata.interest}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {sel && (
          <form onSubmit={bill} className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-bold">Bill {sel.name ?? sel.email}</h2>
            <label className="grid gap-1.5 text-sm font-semibold">
              Remaining balance (USD)
              <input className="field" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="8450.00" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Line item
              <input className="field" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </label>
            <fieldset className="grid gap-2 text-sm">
              <legend className="mb-1 font-semibold">How to collect</legend>
              <label className={`flex items-center gap-2 ${hasCard ? '' : 'opacity-50'}`}>
                <input type="radio" checked={mode === 'charge'} disabled={!hasCard} onChange={() => setMode('charge')} /> Auto-charge the saved card
                {hasCard && sel.paymentMethods.length > 1 && (
                  <select className="field !min-h-9 !w-auto !py-1" value={pm} onChange={(e) => setPm(e.target.value)}>
                    {sel.paymentMethods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={mode === 'send'} onChange={() => setMode('send')} /> Email invoice for manual payment
              </label>
            </fieldset>
            <button className="btn btn-primary" disabled={busy || !amount}>
              {busy ? 'Working…' : amount ? `${mode === 'charge' ? 'Charge' : 'Send invoice for'} ${usd(Number(amount) || 0)}` : 'Enter an amount'}
            </button>
          </form>
        )}

        {msg && (
          <p role="status" className={`mt-4 rounded-xl p-4 text-sm font-medium break-words ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </main>
  )
}
