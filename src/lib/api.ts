/**
 * Server functions (RPC). The handlers run on the Whop-hosted worker, so the
 * API key never reaches the browser. See whop.server.ts for the HTTP helper.
 */
import { createServerFn } from '@tanstack/react-start'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface EstimateInput {
  name: string
  email: string
  phone: string
  zip: string
  interest: string
  message: string
  /** Honeypot — real users never fill this. */
  website?: string
  /** Where on the site the form was submitted (for attribution). */
  source?: string
}

/* ------------------------------------------------------------------ */
/* 1. Estimate form → Whop lead                                        */
/* ------------------------------------------------------------------ */

/**
 * Whop retired POST /leads (it now answers 410 Gone and points to POST
 * /members). A "lead" is a member with no access and no purchases, so a quote
 * request creates that member, then stores the project details on it as
 * metadata. It appears in the dashboard under Customers → Members.
 */
export const submitEstimate = createServerFn({ method: 'POST' })
  .validator((d: EstimateInput) => {
    const clean = (s: unknown, max: number) => String(s ?? '').trim().slice(0, max)
    const out = {
      name: clean(d.name, 120),
      email: clean(d.email, 200).toLowerCase(),
      phone: clean(d.phone, 40),
      zip: clean(d.zip, 12),
      interest: clean(d.interest, 80),
      message: clean(d.message, 450),
      website: clean(d.website, 200),
      source: clean(d.source, 80),
    }
    if (out.name.length < 2) throw new Error('Please enter your name.')
    if (!EMAIL.test(out.email)) throw new Error('Please enter a valid email address.')
    if (out.phone.replace(/\D/g, '').length < 10) throw new Error('Please enter a 10-digit phone number.')
    if (!/^\d{5}(-\d{4})?$/.test(out.zip)) throw new Error('Please enter a 5-digit ZIP code.')
    return out
  })
  .handler(async ({ data }) => {
    // Honeypot tripped: pretend success so bots learn nothing.
    if (data.website) return { ok: true as const, leadId: 'ignored' }

    const { whop, accountId } = await import('./whop.server')
    const member = await whop<{ id: string }>('POST', '/members', {
      account_id: accountId(),
      email: data.email,
      name: data.name,
    })
    await whop('PATCH', `/members/${member.id}`, {
      name: data.name,
      metadata: {
        lead_source: data.source || 'website_estimate_form',
        lead_status: 'new',
        phone: data.phone,
        zip: data.zip,
        interest: data.interest,
        message: data.message,
        requested_at: new Date().toISOString(),
      },
    })
    return { ok: true as const, leadId: member.id }
  })

/* ------------------------------------------------------------------ */
/* 2. Card on file (setup intent) bookkeeping                          */
/* ------------------------------------------------------------------ */

/**
 * After the setup-mode checkout completes in the browser we only get the
 * `sint_` id. Confirm it server-side and tag the customer so staff can find
 * them in the invoice console.
 */
export const confirmCardOnFile = createServerFn({ method: 'POST' })
  .validator((d: { setupIntentId: string }) => {
    if (!/^sint_[A-Za-z0-9]+$/.test(d.setupIntentId ?? '')) throw new Error('Invalid setup intent.')
    return { setupIntentId: d.setupIntentId }
  })
  .handler(async ({ data }) => {
    const { whop, accountId } = await import('./whop.server')
    const si = await whop<any>('GET', `/setup_intents/${data.setupIntentId}`)
    if (si.account_id && si.account_id !== accountId()) throw new Error('Setup intent belongs to another account.')
    if (si.status === 'succeeded' && si.member_id) {
      await whop('PATCH', `/members/${si.member_id}`, {
        metadata: { card_on_file: 'yes', card_saved_at: new Date().toISOString() },
      }).catch(() => undefined)
    }
    return {
      status: String(si.status ?? 'unknown'),
      saved: si.status === 'succeeded',
      type: si.payment_method_type ?? null,
    }
  })

/* ------------------------------------------------------------------ */
/* 3. Staff console: find customer, bill the final balance             */
/* ------------------------------------------------------------------ */

export interface CustomerSummary {
  memberId: string
  name: string | null
  email: string | null
  metadata: Record<string, string>
  paymentMethods: { id: string; label: string }[]
}

export const findCustomer = createServerFn({ method: 'POST' })
  .validator((d: { passcode: string; query: string }) => ({
    passcode: String(d.passcode ?? ''),
    query: String(d.query ?? '').trim().slice(0, 120),
  }))
  .handler(async ({ data }): Promise<CustomerSummary[]> => {
    const { whop, accountId, assertAdmin } = await import('./whop.server')
    assertAdmin(data.passcode)
    const q = new URLSearchParams({ account_id: accountId(), first: '8', order: 'created_at', direction: 'desc' })
    if (data.query) q.set('query', data.query)
    const list = await whop<{ data: any[] }>('GET', `/members?${q}`)
    const out: CustomerSummary[] = []
    for (const m of list.data ?? []) {
      let pms: any[] = []
      try {
        const r = await whop<{ data: any[] }>(
          'GET',
          `/payment_methods?${new URLSearchParams({ member_id: m.id, account_id: accountId(), first: '10' })}`,
        )
        pms = r.data ?? []
      } catch {
        /* member may have no saved methods */
      }
      out.push({
        memberId: m.id,
        name: m.name ?? m.display_name ?? null,
        email: m.email ?? null,
        metadata: m.metadata ?? {},
        paymentMethods: pms.map((p) => {
          const card = p.card ?? p.payment_instrument?.card ?? p.payment_instrument ?? {}
          const brand = card.brand ?? p.brand ?? p.payment_method_type ?? p.type ?? 'card'
          const last4 = card.last4 ?? p.last4 ?? ''
          return { id: p.id as string, label: `${brand}${last4 ? ` ····${last4}` : ''}` }
        }),
      })
    }
    return out
  })

export interface FinalInvoiceInput {
  passcode: string
  memberId: string
  /** Remaining balance in USD (e.g. 8450). */
  amount: number
  description: string
  memo: string
  /** 'charge' = auto-charge the saved card; 'send' = email invoice for manual payment. */
  mode: 'charge' | 'send'
  paymentMethodId?: string
}

export const createFinalInvoice = createServerFn({ method: 'POST' })
  .validator((d: FinalInvoiceInput) => {
    const amount = Number(d.amount)
    if (!Number.isFinite(amount) || amount < 1 || amount > 250000) throw new Error('Amount must be between $1 and $250,000.')
    if (!/^mber_[A-Za-z0-9]+$/.test(d.memberId ?? '')) throw new Error('Pick a customer first.')
    if (d.mode === 'charge' && !/^payt_[A-Za-z0-9]+$/.test(d.paymentMethodId ?? '')) {
      throw new Error('This customer has no saved card — send the invoice instead.')
    }
    return {
      passcode: String(d.passcode ?? ''),
      memberId: d.memberId,
      amount: Math.round(amount * 100) / 100,
      description: String(d.description ?? '').trim().slice(0, 900) || 'Final balance — roofing project',
      memo: String(d.memo ?? '').trim().slice(0, 1500),
      mode: d.mode === 'charge' ? ('charge' as const) : ('send' as const),
      paymentMethodId: d.paymentMethodId,
    }
  })
  .handler(async ({ data }) => {
    const { whop, accountId, assertAdmin } = await import('./whop.server')
    const { site } = await import('../site.config')
    assertAdmin(data.passcode)

    // 1) Draft the invoice with a one-off priced line (no plan to pre-create).
    const draft = await whop<any>('POST', '/invoices', {
      account_id: accountId(),
      member_id: data.memberId,
      items: [
        {
          description: data.description,
          variant: {
            currency: 'usd',
            billing_type: 'one_time',
            initial_price: data.amount,
            title: 'Final project balance',
            product_id: site.whop.finalBalanceProductId,
            visibility: 'hidden',
            force_create_new_plan: true,
          },
        },
      ],
      memo: data.memo || undefined,
      ...(data.mode === 'charge' ? { payment_method_id: data.paymentMethodId } : {}),
    })

    // 2) Charge the stored method now, or email the invoice for manual payment.
    const result =
      data.mode === 'charge'
        ? await whop<any>('POST', `/invoices/${draft.id}/issue`, {})
        : await whop<any>('POST', `/invoices/${draft.id}/send`, {})

    return {
      mode: data.mode,
      invoiceId: (result?.id ?? draft.id) as string,
      status: String(result?.status ?? draft.status ?? ''),
      total: result?.total ?? result?.amount_due ?? data.amount,
      url: (result?.hosted_url ?? result?.url ?? result?.payment_url ?? null) as string | null,
    }
  })
