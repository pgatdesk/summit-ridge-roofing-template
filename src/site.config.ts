/**
 * SITE CONFIG — the only file you edit to re-brand this template.
 *
 * Swap the company, services, prices, service area, reviews and colours here.
 * Plan IDs come from `npm run provision` (see README) which creates the
 * Whop products + plans listed in `plans` and prints the IDs to paste below.
 * No component needs to change.
 */

export type PlanKey = 'inspection' | 'deposit' | 'flatRate'

export interface PlanConfig {
  /** Whop plan id (plan_...) — printed by `npm run provision`. */
  id: string
  title: string
  /** Display price in USD (the real price lives on the Whop plan). */
  price: number
  blurb: string
  bullets: string[]
}

export const site = {
  company: {
    name: 'Summit Ridge Roofing',
    tagline: 'Roofs built to outlast the weather.',
    phone: '(303) 555-0142',
    phoneHref: 'tel:+13035550142',
    email: 'hello@summitridge.example',
    address: '1200 Larimer St, Denver, CO 80204',
    license: 'CO Lic. #RC-0000000 · Fully insured',
    founded: 2004,
    hours: 'Mon–Sat 7am–6pm · 24/7 storm response',
  },

  /** Brand colours (any CSS colour). Applied as CSS variables. */
  theme: {
    primary: '#c2410c', // buttons, accents
    primaryDark: '#9a3412',
    ink: '#1c1917',
    soft: '#faf7f5',
  },

  hero: {
    eyebrow: 'Denver metro roofing · Family owned since 2004',
    headline: 'A roof you never have to think about.',
    sub: 'Honest inspections, clear written quotes, and craftsmanship backed by a 25-year workmanship warranty.',
    stats: [
      { value: '4.9★', label: '1,200+ verified reviews' },
      { value: '18,000+', label: 'roofs completed' },
      { value: '25 yr', label: 'workmanship warranty' },
    ],
  },

  /**
   * Pay-online plans. Each maps to a real Whop plan.
   * Change the price on the Whop plan and here, nothing else.
   */
  plans: {
    inspection: {
      id: 'plan_WXabZNvYKHE0d',
      title: 'Roof Inspection',
      price: 149,
      blurb: 'A certified inspector on your roof, a photo report in your inbox.',
      bullets: [
        '40-point shingle, flashing & attic check',
        'Drone + close-up photo report',
        'Written, no-pressure estimate',
        'Fee credited toward your project',
      ],
    },
    deposit: {
      id: 'plan_iJFoVdBw0wiEj',
      title: 'Project Deposit',
      price: 500,
      blurb: 'Lock in your crew, your materials and your install date.',
      bullets: [
        'Reserves your crew & shingle order',
        'Applied to your final invoice',
        'Card saved securely for the final balance',
        'Balance billed only after the job is done',
      ],
    },
    flatRate: {
      id: 'plan_fvUvXcec66Rvp',
      title: 'Gutter Clean + Roof Tune-Up',
      price: 350,
      blurb: 'Flat-rate seasonal maintenance. One price, no surprises.',
      bullets: [
        'Full gutter & downspout cleaning',
        'Debris cleared from roof surfaces',
        'Sealant touch-ups on flashing & fasteners',
        'Photo summary of the work',
      ],
    },
  } satisfies Record<PlanKey, PlanConfig>,

  /** Whop identifiers for server-side flows. */
  whop: {
    /** Your business id (biz_...). Overridden by the WHOP_ACCOUNT_ID env var when present. */
    accountId: 'biz_GQidznCfMbL3Gs',
    /** Setup-mode checkout configuration (ch_...) used to save a card on file. */
    setupCheckoutConfigId: 'ch_9LVeE5BEPLR5NHa',
    /** Hidden product that holds one-off "final balance" plans for invoices. */
    finalBalanceProductId: 'prod_HklmaWt4O9u72',
  },

  services: [
    {
      slug: 'repair',
      title: 'Roof Repair',
      icon: 'wrench',
      from: 'From $350',
      summary: 'Leaks, missing shingles, flashing and storm damage fixed fast — most repairs done in a day.',
      points: ['Leak tracing & sealing', 'Shingle & flashing replacement', 'Emergency tarping', 'Insurance documentation'],
      cta: { label: 'Book flat-rate tune-up', plan: 'flatRate' },
    },
    {
      slug: 'replacement',
      title: 'Roof Replacement',
      icon: 'home',
      from: 'Free written quote',
      summary: 'Complete tear-off and install with premium architectural shingles, new underlayment and ventilation.',
      points: ['Asphalt, metal, tile & flat roofs', 'Manufacturer-backed warranties', 'Magnetic nail sweep & full cleanup', 'Reserve your date with a deposit'],
      cta: { label: 'Reserve with a deposit', plan: 'deposit' },
    },
    {
      slug: 'inspection',
      title: 'Roof Inspection',
      icon: 'search',
      from: '$149',
      summary: 'Know exactly what shape your roof is in — before a leak, a sale, or an insurance claim.',
      points: ['Certified inspector, 40-point check', 'Photo & drone report', 'Storm-damage assessment', 'Credited toward any project'],
      cta: { label: 'Book an inspection', plan: 'inspection' },
    },
  ],

  serviceArea: {
    headline: 'Proudly serving the Denver metro',
    sub: 'Free estimates within 45 miles of downtown Denver. Not sure if we cover you? Ask — we usually do.',
    cities: [
      'Denver', 'Aurora', 'Lakewood', 'Arvada', 'Westminster', 'Thornton',
      'Centennial', 'Littleton', 'Highlands Ranch', 'Parker', 'Castle Rock',
      'Boulder', 'Broomfield', 'Golden', 'Englewood', 'Commerce City',
    ],
  },

  financing: {
    headline: 'Roof now. Pay over time.',
    body: 'At checkout you will see flexible payment options such as Klarna, Afterpay and Splitit when they are available for your order. Pick the one that fits your budget — no hidden fees, no pressure.',
    badges: ['Klarna', 'Afterpay', 'Splitit', 'Apple Pay', 'Google Pay'],
    note: 'Financing options are shown automatically at secure checkout and subject to approval by the provider.',
  },

  reviews: {
    rating: 4.9,
    count: 1243,
    items: [
      { name: 'Marcus T.', town: 'Lakewood', text: 'They found hail damage two other roofers missed, handled the insurance paperwork, and finished in a day and a half. Spotless cleanup.' },
      { name: 'Priya S.', town: 'Centennial', text: 'The inspection report had photos of everything and the quote matched to the dollar. Deposit, then a clear final invoice. Zero surprises.' },
      { name: 'Dale & Ruth H.', town: 'Arvada', text: 'Fourth roof we have bought in our lives and by far the easiest. The crew was on time every single morning.' },
    ],
    trust: ['BBB A+ rated', 'GAF Master Elite', 'Licensed & insured', '25-yr workmanship warranty'],
  },

  estimateForm: {
    heading: 'Request a free estimate',
    sub: 'Tell us about your roof. A real person replies within one business day.',
    /** Options in the "What do you need?" dropdown. */
    interests: ['Roof repair', 'Roof replacement', 'Roof inspection', 'Storm / hail damage', 'Gutter cleaning', 'Not sure yet'],
  },
} as const

export type Site = typeof site
