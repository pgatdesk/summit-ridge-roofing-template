# Summit Ridge Roofing: a Whop Websites template for roofing companies

A production-ready, fully hosted website for a US roofing business that demos the whole **deposit → job → final invoice** flow on Whop. Swap the company name, services and pricing in **one file** and ship.

Built with TanStack Start + React + Tailwind v4, hosted by Whop Websites (`*.whop.site`).

## What is in the box

| Area | What it does | Whop feature |
| --- | --- | --- |
| Sections | Hero, services (repair / replacement / inspection), pricing, service area, financing callout, reviews + trust, contact | Websites hosting |
| Checkout (`/book/:plan`) | `ExpressCheckoutElement` (Apple Pay / Google Pay) + `CheckoutElement` + required `BrandingElement`. No custom card fields. Financing (Klarna, Afterpay, Splitit…) surfaces automatically for approved merchants | Payment Elements |
| Plans | $149 inspection, $500 deposit, $350 flat-rate service (all editable) | Products + plans |
| Card on file | After the deposit, a setup-mode checkout saves a card and charges nothing | Setup intents / checkout configurations |
| Estimate form | Creates a lead on your Whop account, with project details stored as metadata | Members API (lead) |
| Staff console (`/staff`) | Bill the final balance: auto-charge the saved card **or** email the invoice | Invoices API |
| Tracking | `estimate_requested`, `service_viewed`, `deposit_started` (+ standard `lead`) via `whop.track`. Page views and checkout events are automatic on whop.site | Pixel |

> **About leads.** Whop retired `POST /leads` (it now returns `410 Gone`). The documented replacement is `POST /members`: a person with no purchases is a member with no access. That is what the estimate form uses, so quote requests appear in your dashboard under **Customers → Members** with the project details in their metadata.

## Re-brand in 10 minutes

1. **Edit `src/site.config.ts`**: company, colours, hero copy, services, service area, financing, reviews, form options. No component changes needed.
2. **Edit `scripts/catalog.json`**: plan names, descriptions and prices.
3. **Create your catalog** with an API key from [whop.com/dashboard/developer](https://whop.com/dashboard/developer) (or [sandbox.whop.com/dashboard/developer](https://sandbox.whop.com/dashboard/developer) for test mode):
   ```bash
   # PowerShell: $env:WHOP_API_KEY="apik_..."     bash: export WHOP_API_KEY=apik_...
   npm run provision                # production
   npm run provision -- --sandbox   # sandbox (test cards, no real money)
   ```
   Paste the printed IDs into the matching block of `IDS` at the top of `src/site.config.ts`.
   Set `ENVIRONMENT` there to `'sandbox'` or `'production'`. Sandbox mode shows a "test mode" banner on checkout.
   For sandbox, also store the sandbox key as a secret: `whop apps secrets set --secret "WHOP_SANDBOX_API_KEY=apik_..."`.
4. **Create your site and deploy**
   ```bash
   whop apps init --app_type website --name "Your Roofing Co" --domain your-roofing-co   # new project
   # or, in this folder: whop apps deploy --app app_XXXX
   ```
5. **Protect the staff console**: choose a strong passcode and store it as a secret:
   ```bash
   whop apps secrets set --secret "ADMIN_PASSCODE=choose-a-long-random-passcode"
   ```
   Until `ADMIN_PASSCODE` is set, `/staff` is disabled.
6. `npm install && npm run deploy`

## Local development

```bash
npm install
whop apps dev          # runs vite with WHOP_API_KEY / WHOP_ACCOUNT_ID injected
```

Open `http://localhost:3000/?debug=1` to see a live log of every `whop.track` call. (The Whop pixel only exists on the hosted domain, so locally events show as "local"; on `*.whop.site` they show as "sent".)

## Verifying the three custom pixel events

1. Visit your live site with `?debug=1`. A panel lists events as they fire.
2. `service_viewed`: expand a service card ("What's included") or open any `/book/:plan` page.
3. `deposit_started`: click **Pay deposit** or open `/book/deposit`.
4. `estimate_requested`: submit the estimate form.
5. Confirm in the Whop dashboard under **Websites** and the pixel/events view (allow ~1 minute). With the CLI: `whop events list`.

## The deposit → job → final invoice flow

1. Customer pays the **$500 deposit** at `/book/deposit` (cards, Apple/Google Pay, financing where offered).
2. **Step 2** saves a card with a **setup-mode checkout** (`ch_…`). Nothing is charged. The `sint_…` setup intent is confirmed server-side (`confirmCardOnFile`).
3. After the job, staff open `/staff`, find the customer, enter the remaining balance and choose:
   - **Auto-charge the stored card**: creates the invoice with `payment_method_id` then `POST /invoices/:id/issue`.
   - **Email invoice for manual payment**: `POST /invoices/:id/send`.

   The line item is an inline one-off variant, so no per-job plan is needed.

## Requirements and gotchas

- **Business verification.** Whop will not issue invoices until the business account has completed verification (Dashboard → Verification), in sandbox too. Checkout and leads work without it.
- **Test mode vs production.** `ENVIRONMENT` in `src/site.config.ts` switches plan IDs, API origin and the Payment Elements `environment`. Sandbox and production share no accounts, keys or plans.
- **Financing** (Klarna, Afterpay, Splitit…) is enabled per merchant: apply in your Whop dashboard under Payments → Financing. The site needs no code changes.
- **Apple Pay** works out of the box on `*.whop.site`. On a custom domain, add it via the Whop Domains API first.
- **Merchant name at checkout** is your Whop business name; set it to your company name in the dashboard.
- Prices are USD only (adaptive local-currency pricing is switched off by `npm run provision`).
- The API version is pinned in `src/lib/whop.server.ts` (`Api-Version-Date`).

## Project layout

```
src/site.config.ts        <- all content, colours, plan IDs (edit this)
src/routes/index.tsx      <- landing page
src/routes/book.$plan.tsx <- checkout (+ card-on-file step)
src/routes/staff.tsx      <- final-balance invoice console
src/routes/thanks.tsx     <- return URL for off-site payment steps
src/components/           <- sections, estimate form, checkout panel, pixel debug panel
src/lib/api.ts            <- server functions (lead, card-on-file, invoices)
src/lib/whop.server.ts    <- server-only Whop API helper
src/lib/track.ts          <- whop.track wrapper
scripts/provision.mjs     <- creates your Whop catalog from catalog.json
```

## License

MIT. Original code. No marketplace theme was used.
