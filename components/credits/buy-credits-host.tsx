"use client"

import { CreditPurchaseModal } from "./credit-purchase-modal"
import { useBuyCredits, closeBuyCredits } from "@/lib/hooks/use-buy-credits"
import { useCredits } from "@/lib/hooks/use-credits"

/**
 * Mounted once in the dashboard layout. Renders the single purchase modal that every
 * "Buy credits" surface opens via `openBuyCredits()`.
 */
export function BuyCreditsHost() {
  const { isOpen, suggested } = useBuyCredits()
  const { balance } = useCredits()

  return (
    <CreditPurchaseModal
      isOpen={isOpen}
      onClose={closeBuyCredits}
      currentBalance={balance ?? undefined}
      preselectedPackage={suggested}
    />
  )
}
