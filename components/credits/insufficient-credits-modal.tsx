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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Insufficient Credits
            </DialogTitle>
            <DialogDescription>
              You need more credits to {ACTION_DESCRIPTIONS[action]}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Credit Status */}
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Balance:</span>
                    <Badge variant="secondary" className="font-mono">
                      {currentBalance} credits
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Required:</span>
                    <Badge variant="outline" className="font-mono">
                      {requiredCredits} credits
                    </Badge>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Need:
                      </span>
                      <Badge className="bg-orange-600 text-white font-mono">
                        {shortfall} more credits
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Benefits */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ACTION_BENEFITS[action].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Suggested Package */}
            {suggestedPackage && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recommended Package</CardTitle>
                  <CardDescription>
                    Perfect for your needs with extra credits for future use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{suggestedPackage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {suggestedPackage.credits} credits
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${suggestedPackage.price}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(suggestedPackage.price / suggestedPackage.credits).toFixed(3)}/credit
                        </p>
                      </div>
                    </div>
                    
                    {suggestedPackage.bonusPercentage > 0 && (
                      <div className="bg-green-100 dark:bg-green-950/20 p-2 rounded text-sm">
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Save {suggestedPackage.bonusPercentage}%! 
                        </span>
                        <span className="text-green-600 dark:text-green-400 ml-1">
                          Get {suggestedPackage.credits - Math.floor(suggestedPackage.price * 10)} bonus credits
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        After purchase: <span className="font-medium text-foreground">
                          {currentBalance + suggestedPackage.credits} credits
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
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
