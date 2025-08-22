"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { loadStripe } from "@stripe/stripe-js"
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, CreditCard, Check, Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreditPackage, CREDIT_PACKAGES } from "@/lib/types/credits"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  currentBalance?: number
  preselectedPackage?: string
}

interface CreditPackageDisplayProps {
  package_: CreditPackage
  isSelected: boolean
  onSelect: () => void
  currentBalance: number
}

function CreditPackageDisplay({ 
  package_, 
  isSelected, 
  onSelect,
  currentBalance 
}: CreditPackageDisplayProps) {
  const savings = package_.bonusPercentage > 0 ? {
    percentage: package_.bonusPercentage,
    bonusCredits: package_.credits - Math.floor(package_.price * 10),
    dollarsOff: (package_.credits - Math.floor(package_.price * 10)) * 0.1,
  } : null

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${package_.popular ? 'border-primary/50' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{package_.name}</CardTitle>
          {package_.popular && (
            <Badge className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {package_.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Credits and Price */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {package_.credits}
            </span>
            <span className="text-lg font-semibold">
              ${package_.price}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>credits</span>
            <span>${(package_.price / package_.credits).toFixed(3)}/credit</span>
          </div>
        </div>

        {/* Savings Info */}
        {savings && (
          <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
            <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
              <Check className="h-3 w-3" />
              <span className="text-xs font-medium">
                Save {savings.percentage}% • +{savings.bonusCredits} bonus credits
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              ${savings.dollarsOff.toFixed(2)} extra value
            </p>
          </div>
        )}

        {/* New Balance Preview */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            New balance: <span className="font-medium text-foreground">
              {currentBalance + package_.credits} credits
            </span>
          </p>
        </div>

        {isSelected && (
          <div className="flex items-center justify-center py-1">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PaymentFormProps {
  selectedPackage: CreditPackage
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({ selectedPackage, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !session?.user?.id) {
      return
    }

    setProcessing(true)

    try {
      // Create purchase intent
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create purchase intent')
      }

      const { data } = await response.json()

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: session.user.name || '',
              email: session.user.email || '',
            },
          },
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: `${selectedPackage.credits} credits have been added to your account.`,
        })
        onSuccess()
      }

    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>{selectedPackage.name}</span>
            <span>{selectedPackage.credits} credits</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${selectedPackage.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: 'hsl(var(--foreground))',
                    '::placeholder': {
                      color: 'hsl(var(--muted-foreground))',
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 mr-2" />
              Purchase ${selectedPackage.price}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function CreditPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0,
  preselectedPackage,
}: CreditPurchaseModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedPackage || 'premium'
  )
  const [showPayment, setShowPayment] = useState(false)

  const packages = Object.values(CREDIT_PACKAGES)
  const selectedPackage = CREDIT_PACKAGES[selectedPackageId as keyof typeof CREDIT_PACKAGES]

  const handleSuccess = () => {
    setShowPayment(false)
    onSuccess?.()
    onClose()
  }

  const handleClose = () => {
    setShowPayment(false)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            {showPayment ? 'Complete Purchase' : 'Purchase Credits'}
          </DialogTitle>
          <DialogDescription>
            {showPayment 
              ? 'Enter your payment details to complete the purchase'
              : 'Choose a credit package to continue using Resumaid features'
            }
          </DialogDescription>
        </DialogHeader>

        {!showPayment ? (
          <div className="space-y-6">
            {/* Package Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <CreditPackageDisplay
                  key={pkg.id}
                  package_={pkg}
                  isSelected={selectedPackageId === pkg.id}
                  onSelect={() => setSelectedPackageId(pkg.id)}
                  currentBalance={currentBalance}
                />
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => setShowPayment(true)}
                disabled={!selectedPackage}
                size="lg"
              >
                Continue to Payment
                <CreditCard className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPackage={selectedPackage}
              onSuccess={handleSuccess}
              onCancel={() => setShowPayment(false)}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  )
}
