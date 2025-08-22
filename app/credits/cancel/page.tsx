'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/ui/page-container'

function CancelPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const purchaseId = searchParams.get('purchase_id')

  useEffect(() => {
    // Mark the purchase as cancelled if we have a purchase ID
    if (purchaseId) {
      fetch('/api/credits/cancel-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId })
      }).catch(console.error)
    }
  }, [purchaseId])

  const handleRetry = () => {
    setLoading(true)
    router.push('/dashboard')
  }

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  return (
    <PageContainer className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Purchase Cancelled
          </h1>
          <p className="text-lg text-muted-foreground">
            Your credit purchase was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-sm text-muted-foreground">
            Don't worry! You can try purchasing credits again anytime. 
            Your account and existing credits remain unchanged.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Try Again
                <RefreshCw className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleGoBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Need help? Contact our support team for assistance with your purchase.
        </p>
      </div>
    </PageContainer>
  )
}

export default function CreditPurchaseCancel() {
  return (
    <Suspense fallback={
      <PageContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageContainer>
    }>
      <CancelPageContent />
    </Suspense>
  )
}
