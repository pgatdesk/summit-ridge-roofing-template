#!/usr/bin/env node
/**
 * Provision the Whop products + plans (and the card-on-file checkout config)
 * for a new company, using the Whop CLI you are already logged in with.
 *
 *   1. Edit scripts/catalog.json (names, prices, descriptions).
 *   2. npm run provision
 *   3. Paste the printed IDs into src/site.config.ts.
 *
 * Nothing is charged by running this; it only creates catalog entries.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'))
const whop = (...args) => {
  const out = execFileSync('whop', [...args, '--format', 'json'], { encoding: 'utf8', shell: process.platform === 'win32' })
  return JSON.parse(out.replace(/^﻿/, ''))
}

const acct = process.argv[2] || catalog.accountId
if (!acct) throw new Error('Pass your business id: npm run provision -- biz_XXXX (or set accountId in catalog.json)')

const result = {}
for (const p of catalog.plans) {
  const product = whop('products', 'create', '--account_id', acct, '--title', p.title, '--headline', p.headline, '--description', p.description, '--visibility', p.hidden ? 'hidden' : 'visible')
  const plan = whop('variants', 'create', '--account_id', acct, '--product_id', product.id, '--title', p.title, '--billing_type', 'one_time', '--initial_price', String(p.price), '--currency', 'usd', '--unlimited_stock', '--visibility', 'visible')
  // USD-only: stop Whop converting the price to the buyer's local currency.
  whop('variants', 'update', plan.id, '--adaptive_pricing_enabled=false')
  result[p.key] = { productId: product.id, planId: plan.id }
  console.log(`created ${p.key}: ${product.id} / ${plan.id}`)
}
const setup = whop('checkout-configurations', 'create', '--account_id', acct, '--mode', 'setup', '--currency', 'usd')
console.log(`created card-on-file checkout config: ${setup.id}`)

console.log('\nPaste into src/site.config.ts:\n')
console.log(`  accountId: '${acct}',`)
console.log(`  setupCheckoutConfigId: '${setup.id}',`)
console.log(`  finalBalanceProductId: '${result.finalBalance?.productId ?? ''}',`)
for (const k of ['inspection', 'deposit', 'flatRate']) console.log(`  ${k}.id: '${result[k]?.planId ?? ''}'`)
