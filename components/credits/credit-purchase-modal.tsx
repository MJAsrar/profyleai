"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CREDIT_PACKAGES, type CreditPackageId } from "@/lib/types/credits"
import { cn } from "@/lib/utils"

const ORDER: CreditPackageId[] = ["starter", "value", "premium", "pro", "enterprise"]

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  currentBalance?: number
  /** Preselect a pack — e.g. one big enough for what the user was just blocked on. */
  preselectedPackage?: CreditPackageId
}

/**
 * Buying credits.
 *
 * The packs come from `CREDIT_PACKAGES` — the same constant the purchase API prices
 * against — so what's shown here cannot drift from what actually gets charged.
 */
export function CreditPurchaseModal({
  isOpen,
  onClose,
  currentBalance,
  preselectedPackage = "premium",
}: CreditPurchaseModalProps) {
  const [selected, setSelected] = useState<CreditPackageId>(preselectedPackage)
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function checkout() {
    setIsRedirecting(true)

    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected }),
      })

      const body = await res.json()
      const url = body?.data?.checkoutUrl

      if (!res.ok || !url) {
        toast.error(body?.error ?? "Couldn't open checkout. You haven't been charged.")
        return
      }

      // Stripe hosts the card form — no card details ever touch this app.
      window.location.href = url
    } catch {
      toast.error("Couldn't open checkout. You haven't been charged.")
    } finally {
      setIsRedirecting(false)
    }
  }

  const pack = CREDIT_PACKAGES[selected]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Top up your credits</DialogTitle>
          <DialogDescription>
            {typeof currentBalance === "number"
              ? `You have ${currentBalance} left. Credits don't expire, and there's no subscription.`
              : "Credits don't expire, and there's no subscription. You buy what you need, when you need it."}
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-2">
          {ORDER.map((id) => {
            const option = CREDIT_PACKAGES[id]
            const isSelected = id === selected

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setSelected(id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-input border px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "border-brand bg-brand-tint"
                      : "border-border hover:border-brand/40"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border-2",
                      isSelected ? "border-[5px] border-brand" : "border-border"
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-ink">
                      {option.credits} credits
                      {option.bonusPercentage > 0 && (
                        <span className="ml-2 rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-brand">
                          +{option.bonusPercentage}% bonus
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                      {option.creditsPerDollar.toFixed(1)} credits per $1
                    </span>
                  </span>

                  <span className="shrink-0 font-display text-[20px] text-ink">
                    ${option.price.toFixed(0)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <Button size="lg" className="mt-4 w-full" onClick={checkout} disabled={isRedirecting}>
          {isRedirecting
            ? "Opening checkout…"
            : `Buy ${pack.credits} credits — $${pack.price.toFixed(0)}`}
        </Button>

        <p className="mt-2 text-center font-mono text-[10px] leading-relaxed tracking-[0.06em] text-ink-faint">
          Card handled by Stripe. We never see it.
        </p>
      </DialogContent>
    </Dialog>
  )
}
