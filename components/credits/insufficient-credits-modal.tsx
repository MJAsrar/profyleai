"use client"

import { useState } from "react"
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
import { 
  Coins, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight,
  Zap
} from "lucide-react"
import { 
  CreditAction, 
  CREDIT_COSTS, 
  CreditPackage,
  suggestPackageForCredits 
} from "@/lib/types/credits"
import { CreditPurchaseModal } from "./credit-purchase-modal"

interface InsufficientCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  action: CreditAction
  currentBalance: number
  onPurchaseSuccess?: () => void
}

const ACTION_DESCRIPTIONS: Record<CreditAction, string> = {
  VIDEO_INTERVIEW: "start a video interview session",
  TEXT_INTERVIEW: "access text interview preparation",
  RESUME_BUILDER: "create or edit a resume",
  RESUME_TAILORING: "tailor your resume for a job",
  COVER_LETTER: "generate a cover letter",
}

const ACTION_BENEFITS: Record<CreditAction, string[]> = {
  VIDEO_INTERVIEW: [
    "Real-time AI conversation practice",
    "Advanced analytics and feedback",
    "Professional interview experience",
    "Detailed performance insights"
  ],
  TEXT_INTERVIEW: [
    "AI-generated practice questions",
    "Industry-specific scenarios",
    "STAR method guidance",
    "Instant feedback"
  ],
  RESUME_BUILDER: [
    "Professional templates",
    "AI-powered content suggestions",
    "ATS optimization",
    "Real-time formatting"
  ],
  RESUME_TAILORING: [
    "Job-specific optimization",
    "Keyword analysis",
    "ATS compatibility check",
    "Match score analysis"
  ],
  COVER_LETTER: [
    "Personalized content",
    "Job-specific formatting",
    "Professional tone",
    "Company research integration"
  ],
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  action,
  currentBalance,
  onPurchaseSuccess,
}: InsufficientCreditsModalProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  
  const requiredCredits = CREDIT_COSTS[action]
  const shortfall = requiredCredits - currentBalance
  const suggestedPackage = suggestPackageForCredits(shortfall)
  
  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false)
    onPurchaseSuccess?.()
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen && !showPurchaseModal} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Insufficient Credits
            </DialogTitle>
            <DialogDescription>
              You need more credits to {ACTION_DESCRIPTIONS[action]}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Credit Status & Benefits */}
            <div className="space-y-4">
              {/* Credit Status */}
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current:</span>
                      <Badge variant="secondary" className="font-mono">
                        {currentBalance}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Required:</span>
                      <Badge variant="outline" className="font-mono">
                        {requiredCredits}
                      </Badge>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          Need:
                        </span>
                        <Badge className="bg-orange-600 text-white font-mono">
                          +{shortfall}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Benefits - Compact */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    What You'll Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-1">
                    {ACTION_BENEFITS[action].slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <ArrowRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                    {ACTION_BENEFITS[action].length > 3 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        +{ACTION_BENEFITS[action].length - 3} more features
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Suggested Package */}
            <div className="space-y-4">
              {suggestedPackage && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recommended Package</CardTitle>
                    <CardDescription className="text-xs">
                      Perfect for your needs with extra credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-white dark:bg-background rounded-lg border">
                        <div className="text-xl font-bold text-primary">
                          {suggestedPackage.credits} credits
                        </div>
                        <div className="text-2xl font-bold">${suggestedPackage.price}</div>
                        <div className="text-xs text-muted-foreground">
                          ${(suggestedPackage.price / suggestedPackage.credits).toFixed(3)} per credit
                        </div>
                      </div>
                      
                      {suggestedPackage.bonusPercentage > 0 && (
                        <div className="bg-green-100 dark:bg-green-950/20 p-2 rounded text-xs text-center">
                          <span className="text-green-700 dark:text-green-300 font-medium">
                            Save {suggestedPackage.bonusPercentage}%! 
                          </span>
                        </div>
                      )}

                      <div className="text-center p-2 bg-muted/50 rounded text-xs">
                        After purchase: <span className="font-medium">
                          {currentBalance + suggestedPackage.credits} credits
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={() => setShowPurchaseModal(true)}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
        currentBalance={currentBalance}
        preselectedPackage={suggestedPackage?.id}
      />
    </>
  )
}
