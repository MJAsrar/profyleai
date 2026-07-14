"use client"

import { Suspense, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Monogram } from "@/components/ui/monogram"

function CancelPageContent() {
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get("purchase_id")

  // Release the PENDING purchase row so it can't sit there forever looking like an
  // unfinished payment.
  useEffect(() => {
    if (!purchaseId) return

    fetch("/api/credits/cancel-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId }),
    }).catch(() => {
      /* Nothing was charged either way — this is only housekeeping. */
    })
  }, [purchaseId])

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Card className="p-8 text-center">
          <div className="flex justify-center">
            <Monogram tone="neutral" size="lg">
              ×
            </Monogram>
          </div>

          <h1 className="mt-6 font-display text-[28px] leading-tight text-ink">
            No charge made.
          </h1>

          <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-relaxed text-ink-muted">
            You backed out of checkout, so nothing was taken. Your credits and everything
            you&apos;ve written are exactly where you left them.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button asChild size="lg">
              <Link href="/dashboard">Back to your dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/pricing">Look at the packs again</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}

export default function CreditPurchaseCancel() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-paper px-6">
          <div className="h-12 w-12 animate-pulse rounded-full bg-section-tint" />
        </main>
      }
    >
      <CancelPageContent />
    </Suspense>
  )
}
