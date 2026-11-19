import { useEffect, useState, type ReactNode } from 'react'
import { loadWhop } from '@whop/elements'
import { WhopElements, Checkout, CheckoutElement, ExpressCheckoutElement, Payments, BrandingElement } from '@whop/elements-react'
import { site } from '../site.config'

type Completion = Parameters<NonNullable<React.ComponentProps<typeof Checkout>['onComplete']>>[0]

interface Props {
  /** A plan (plan_...) to charge. */
  plan?: string
  /** A checkout configuration (ch_...) for setup mode (save a card, charge nothing). */
  checkoutConfiguration?: string
  returnUrl: string
  onComplete: (payload: Completion) => void
  /** Show Apple Pay / Google Pay buttons above the full form. */
  express?: boolean
  metadata?: Record<string, string>
}

/**
 * Whop Payment Elements checkout. There are no custom card inputs: everything
 * below is rendered by Whop, so wallets and financing (Klarna, Afterpay,
 * Splitit...) appear automatically for merchants approved for them.
 *
 *  - ExpressCheckoutElement: Apple Pay / Google Pay one-tap buttons. Whop requires
 *    it to be the only entry element of its <Checkout>, so it gets its own.
 *  - CheckoutElement: the full checkout (cards, financing, promo codes).
 *  - BrandingElement: the required "Powered by Whop" mark. It lives inside a
 *    <Payments> provider.
 */
export function CheckoutPanel({ plan, checkoutConfiguration, returnUrl, onComplete, express = true, metadata }: Props) {
  // loadWhop() touches `window`, so only create it in the browser.
  const [elements, setElements] = useState<ReturnType<typeof loadWhop> | null>(null)
  const [walletReady, setWalletReady] = useState(false)
  useEffect(() => setElements(loadWhop()), [])

  if (!elements) return <Skeleton />

  const source = checkoutConfiguration ? { checkoutConfiguration } : { plan }
  const common = { returnUrl, metadata, onComplete }
  const key = checkoutConfiguration ?? plan

  return (
    <WhopElements elements={elements} environment={site.whop.environment}>
      <div className="grid gap-4">
        {express && !checkoutConfiguration && (
          <>
            <Checkout key={`${key}-express`} {...source} {...common}>
              <ExpressCheckoutElement wallets={{ applePay: 'auto', googlePay: 'auto', payPal: 'never' }} layout="auto" onReady={() => setWalletReady(true)} />
            </Checkout>
            {walletReady && <p className="text-center text-xs font-medium tracking-wide text-stone-400 uppercase">or pay another way</p>}
          </>
        )}
        <Checkout key={`${key}-full`} {...source} {...common} fallback={<Skeleton />}>
          <CheckoutElement />
        </Checkout>
        <Payments accountId={site.whop.accountId}>
          <BrandingElement />
        </Payments>
      </div>
    </WhopElements>
  )
}

export function Skeleton(): ReactNode {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading secure checkout">
      <div className="h-12 rounded-xl bg-stone-200" />
      <div className="h-40 rounded-xl bg-stone-100" />
      <div className="h-12 rounded-xl bg-stone-200" />
    </div>
  )
}
