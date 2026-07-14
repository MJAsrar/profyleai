'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/ui/page-container'

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
      <PageContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Confirming your payment…</p>
        </div>
      </PageContainer>
    )
  }

  const granted = purchaseDetails?.creditsGranted ?? false

  return (
    <PageContainer className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
            failed ? 'bg-red-100' : granted ? 'bg-green-100' : 'bg-amber-100'
          }`}
        >
          {failed ? (
            <AlertCircle className="h-10 w-10 text-red-600" />
          ) : granted ? (
            <CheckCircle className="h-10 w-10 text-green-600" />
          ) : (
            <Clock className="h-10 w-10 text-amber-600" />
          )}
        </div>

        <div className="space-y-4" role="status" aria-live="polite">
          <h1 className="text-3xl font-bold text-foreground">
            {failed
              ? "We couldn't confirm your purchase"
              : granted
                ? 'Purchase complete'
                : 'Payment received'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {failed
              ? 'Your payment may still have gone through. Check your balance in a moment, and contact support if the credits do not appear.'
              : granted
                ? 'Your credits have been added to your account.'
                : 'Your payment went through. Your credits are still being applied — this usually takes a few seconds.'}
          </p>
        </div>

        {purchaseDetails && !failed && (
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Purchase Details</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package:</span>
                <span className="font-medium">{purchaseDetails.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits:</span>
                <span className="font-medium text-primary">
                  {purchaseDetails.credits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${purchaseDetails.amount}</span>
              </div>
              {granted && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">New balance:</span>
                  <span className="font-medium text-primary">
                    {purchaseDetails.balance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {stillProcessing && !failed && (
          <p className="text-sm text-amber-700 dark:text-amber-500">
            Still processing. You can safely leave this page — your credits will appear
            automatically. If they don&apos;t show up within a few minutes, contact support
            with your receipt.
          </p>
        )}

        <div className="space-y-3">
          <Button onClick={handleContinue} className="w-full">
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default function CreditPurchaseSuccess() {
  return (
    <Suspense fallback={
      <PageContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageContainer>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
