"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  CREDIT_COSTS,
  suggestPackageForCredits,
  type CreditAction,
  type CreditPackageId,
} from "@/lib/types/credits"
import { CreditPurchaseModal } from "./credit-purchase-modal"

interface InsufficientCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  action: CreditAction
  currentBalance: number
  onPurchaseSuccess?: () => void
}

/** What the user was actually trying to do, in their words. */
const ACTION_LABEL: Record<CreditAction, string> = {
  VIDEO_INTERVIEW: "run a voice interview",
  TEXT_INTERVIEW: "write your practice questions",
  RESUME_BUILDER: "build this résumé",
  RESUME_TAILORING: "tailor your résumé to this job",
  COVER_LETTER: "write this cover letter",
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  action,
  currentBalance,
  onPurchaseSuccess,
}: InsufficientCreditsModalProps) {
  const [showPurchase, setShowPurchase] = useState(false)

  const cost = CREDIT_COSTS[action]
  const short = Math.max(0, cost - currentBalance)

  // Suggest a pack that actually covers the shortfall, not just the cheapest one.
  const suggested = suggestPackageForCredits(short)?.id as CreditPackageId | undefined

  if (showPurchase) {
    return (
      <CreditPurchaseModal
        isOpen={isOpen}
        onClose={() => {
          setShowPurchase(false)
          onClose()
        }}
        currentBalance={currentBalance}
        preselectedPackage={suggested ?? "premium"}
        onSuccess={onPurchaseSuccess}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>You&apos;re {short} credit{short === 1 ? "" : "s"} short</DialogTitle>
          <DialogDescription>
            It costs {cost} to {ACTION_LABEL[action]}, and you have {currentBalance}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-[10px] bg-section-tint p-4">
          <dl className="space-y-2 text-[14px]">
            <div className="flex items-baseline justify-between">
              <dt className="text-ink-muted">This costs</dt>
              <dd className="font-mono font-semibold text-ink">{cost}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-ink-muted">You have</dt>
              <dd className="font-mono font-semibold text-ink">{currentBalance}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-semibold text-ink">Short by</dt>
              <dd className="font-mono font-bold text-clay">{short}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button size="lg" onClick={() => setShowPurchase(true)}>
            Top up
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
        </div>

        <p className="mt-1 text-center font-mono text-[10px] leading-relaxed tracking-[0.06em] text-ink-faint">
          Nothing has been charged, and your work is still here.
        </p>
      </DialogContent>
    </Dialog>
  )
}
