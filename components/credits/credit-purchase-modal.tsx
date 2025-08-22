"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
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
import { Coins, ExternalLink, Check, Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreditPackage, CREDIT_PACKAGES } from "@/lib/types/credits"

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

interface PurchaseButtonProps {
  package_: CreditPackage
  onPurchase: (packageId: string) => void
  isLoading: boolean
}

function PurchaseButton({ package_, onPurchase, isLoading }: PurchaseButtonProps) {
  return (
    <Button
      onClick={() => onPurchase(package_.id)}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <Coins className="h-4 w-4 mr-2" />
          Purchase ${package_.price}
          <ExternalLink className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  )
}

export function CreditPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0,
  preselectedPackage,
}: CreditPurchaseModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const packages = Object.values(CREDIT_PACKAGES)

  const handlePurchase = async (packageId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { data } = await response.json()

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('Purchase error:', error)
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package and you'll be redirected to Stripe's secure checkout page
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`${pkg.popular ? 'border-primary/50 relative' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Credits and Price */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {pkg.credits}
                      </span>
                      <span className="text-lg font-semibold">
                        ${pkg.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>credits</span>
                      <span>${(pkg.price / pkg.credits).toFixed(3)}/credit</span>
                    </div>
                  </div>

                  {/* Savings Info */}
                  {pkg.bonusPercentage > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                      <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                        <Check className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          Save {pkg.bonusPercentage}% • Bonus credits included
                        </span>
                      </div>
                    </div>
                  )}

                  {/* New Balance Preview */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      New balance: <span className="font-medium text-foreground">
                        {currentBalance + pkg.credits} credits
                      </span>
                    </p>
                  </div>

                  {/* Purchase Button */}
                  <PurchaseButton
                    package_={pkg}
                    onPurchase={handlePurchase}
                    isLoading={loading}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Notice */}
          <div className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Secure payment processed by Stripe
            </p>
            <p className="mt-1">You'll be redirected to Stripe's secure checkout page</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
