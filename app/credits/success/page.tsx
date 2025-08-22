'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react'
import { PageContainer } from '@/components/ui/page-container'

interface PurchaseDetails {
  credits: number
  amount: number
  packageName: string
}

export default function CreditPurchaseSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      // Verify the purchase and get details
      fetch(`/api/credits/verify-purchase?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPurchaseDetails(data.data)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <PageContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying your purchase...</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Purchase Successful!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your credits have been added to your account.
          </p>
        </div>

        {purchaseDetails && (
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
                <span className="font-medium text-primary">{purchaseDetails.credits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${purchaseDetails.amount}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={handleContinue} className="w-full">
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            You can now use your credits for AI interviews, resume building, and more!
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
