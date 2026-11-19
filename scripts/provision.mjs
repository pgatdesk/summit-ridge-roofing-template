#!/usr/bin/env node
/**
 * Create the Whop products + plans (and the card-on-file checkout config)
 * for a new company straight from scripts/catalog.json.
 *
 *   WHOP_API_KEY=apik_...  node scripts/provision.mjs            # production
 *   WHOP_API_KEY=apik_...  node scripts/provision.mjs --sandbox  # sandbox.whop.com (test cards, no real money)
 *
 * Get a key at whop.com/dashboard/developer (or sandbox.whop.com/dashboard/developer).
 * Nothing is charged; it only creates catalog entries. Paste the printed IDs
 * into the matching block of `IDS` in src/site.config.ts.
 */
import { readFileSync } from 'node:fs'

const sandbox = process.argv.includes('--sandbox')
const key = process.env.WHOP_API_KEY
if (!key) throw new Error('Set WHOP_API_KEY (see the header of this file).')
const origin = sandbox ? 'https://sandbox-api.whop.com' : 'https://api.whop.com'
const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'))

async function api(method, path, body) {
  const res = await fetch(`${origin}/api/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Api-Version-Date': '2026-11-10-1' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text)
}

const me = await api('GET', '/accounts/me')
const accountId = me.id
console.log(`Provisioning ${sandbox ? 'SANDBOX' : 'PRODUCTION'} for ${me.title} (${accountId})\n`)

const out = {}
for (const p of catalog.plans) {
  const product = await api('POST', '/products', {
    account_id: accountId,
    title: p.title,
    headline: p.headline,
    description: p.description,
    visibility: p.hidden ? 'hidden' : 'visible',
  })
  const plan = await api('POST', '/variants', {
    account_id: accountId,
    product_id: product.id,
    title: p.title,
    billing_type: 'one_time',
    initial_price: p.price,
    currency: 'usd',
    unlimited_stock: true,
    visibility: 'visible',
    // USD only: do not convert the price to the buyer's local currency.
    adaptive_pricing_enabled: false,
  })
  out[p.key] = { productId: product.id, planId: plan.id }
  console.log(`created ${p.key.padEnd(13)} ${product.id}  ${plan.id}  $${p.price}`)
}
const setup = await api('POST', '/checkout_configurations', { account_id: accountId, mode: 'setup', currency: 'usd' })

console.log(`\nPaste into IDS.${sandbox ? 'sandbox' : 'production'} in src/site.config.ts:\n`)
console.log(`  accountId: '${accountId}',`)
console.log(`  setupCheckoutConfigId: '${setup.id}',`)
console.log(`  finalBalanceProductId: '${out.finalBalance?.productId ?? ''}',`)
console.log(`  plans: { inspection: '${out.inspection?.planId}', deposit: '${out.deposit?.planId}', flatRate: '${out.flatRate?.planId}' },`)
