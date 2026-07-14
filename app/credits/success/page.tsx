'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Monogram } from '@/components/ui/monogram'
import { notifyCreditsChanged } from '@/lib/hooks/use-credits'

interface PurchaseDetails {
  credits: number
  amount: number
  packageName: string
  creditsGranted: boolean
  balance: number
}

// Credits are granted by the Stripe webhook (with this page's verify call as a
// fallback). That can take a moment, so poll briefly rather than asserting success.
const MAX_ATTEMPTS = 6
const RETRY_DELAY_MS = 1500

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [stillProcessing, setStillProcessing] = useState(false)
  const [failed, setFailed] = useState(false)
  const sessionId = searchParams.get('session_id')

  const verify = useCallback(async (attempt: number): Promise<void> => {
    try {
      const res = await fetch(`/api/credits/verify-purchase?session_id=${sessionId}`)
      const data = await res.json()

      if (!data.success) {
        setFailed(true)
        return
      }

      setPurchaseDetails(data.data)

      if (data.data.creditsGranted) {
        setStillProcessing(false)
        // Every credit display in the app is fed by one shared store — tell it to refetch,
        // so the balance in the header is right the moment the user lands back.
        notifyCreditsChanged()
        return
      }

      // Paid, but the credits are not in the ledger yet — keep checking.
      if (attempt < MAX_ATTEMPTS) {
        setStillProcessing(true)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
        return verify(attempt + 1)
      }

      // Give up polling but be honest: the payment succeeded, the grant hasn't landed.
      setStillProcessing(true)
    } catch (error) {
      console.error(error)
      setFailed(true)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    verify(1).finally(() => setLoading(false))
  }, [sessionId, verify])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="text-center" role="status" aria-live="polite">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-section-tint" />
          <p className="mt-5 text-[15px] text-ink-muted">Confirming your payment…</p>
        </div>
      </main>
    )
  }

  const granted = purchaseDetails?.creditsGranted ?? false

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Card className="p-8 text-center">
          <div className="flex justify-center">
            <Monogram tone={failed ? "clay" : granted ? "brand" : "olive"} size="lg">
              {failed ? "!" : granted ? "✓" : "··"}
            </Monogram>
          </div>

          <div role="status" aria-live="polite">
            <h1 className="mt-6 font-display text-[28px] leading-tight text-ink">
              {failed
                ? "We couldn't confirm your purchase"
                : granted
                  ? 'Credits added.'
                  : 'Payment received.'}
            </h1>

            <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-relaxed text-ink-muted">
              {failed
                ? 'Your payment may still have gone through. Check your balance in a moment — and if the credits never appear, send us your receipt and we will sort it out.'
                : granted
                  ? "They're in your account and ready to spend."
                  : "Your card went through. The credits are still landing — usually a few seconds."}
            </p>
          </div>

          {purchaseDetails && !failed && (
            <dl className="mt-6 space-y-2 rounded-[10px] bg-section-tint p-4 text-left text-[14px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">{purchaseDetails.packageName}</dt>
                <dd className="font-mono text-ink">${purchaseDetails.amount}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">Credits</dt>
                <dd className="font-mono font-semibold text-brand">
                  +{purchaseDetails.credits.toLocaleString()}
                </dd>
              </div>
              {granted && (
                <div className="flex items-baseline justify-between border-t border-border pt-2">
                  <dt className="font-semibold text-ink">New balance</dt>
                  <dd className="font-mono font-bold text-ink">
                    {purchaseDetails.balance.toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {stillProcessing && !failed && (
            <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-ink-faint">
              You can leave this page — the credits will appear on their own.
            </p>
          )}

          <Button size="lg" className="mt-6 w-full" onClick={handleContinue}>
            Back to your dashboard
          </Button>
        </Card>
      </div>
    </main>
  )
}

export default function CreditPurchaseSuccess() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="h-12 w-12 animate-pulse rounded-full bg-section-tint" />
      </main>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
