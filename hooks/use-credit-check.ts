'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { CREDIT_COSTS, CreditAction } from '@/lib/types/credits'

interface CreditCheckResult {
  hasEnoughCredits: boolean
  currentBalance: number
  requiredCredits: number
  shortfall: number
}

interface UseCreditCheckReturn {
  checkCredits: (action: CreditAction) => Promise<CreditCheckResult>
  isChecking: boolean
  showInsufficientCreditsModal: boolean
  setShowInsufficientCreditsModal: (show: boolean) => void
  showPurchaseModal: boolean
  setShowPurchaseModal: (show: boolean) => void
  requiredAction: CreditAction | null
  currentBalance: number
}

export function useCreditCheck(): UseCreditCheckReturn {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [isChecking, setIsChecking] = useState(false)
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [requiredAction, setRequiredAction] = useState<CreditAction | null>(null)
  const [currentBalance, setCurrentBalance] = useState(0)

  const checkCredits = async (action: CreditAction): Promise<CreditCheckResult> => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature.",
        variant: "destructive",
      })
      throw new Error('User not authenticated')
    }

    setIsChecking(true)
    setRequiredAction(action)

    try {
      // Get current credit balance
      const response = await fetch('/api/credits/balance')
      
      if (!response.ok) {
        throw new Error('Failed to check credit balance')
      }

      const { data } = await response.json()
      const balance = data.currentBalance
      const required = CREDIT_COSTS[action]
      
      setCurrentBalance(balance)

      const result: CreditCheckResult = {
        hasEnoughCredits: balance >= required,
        currentBalance: balance,
        requiredCredits: required,
        shortfall: Math.max(0, required - balance)
      }

      return result

    } catch (error) {
      console.error('Credit check error:', error)
      toast({
        title: "Error",
        description: "Failed to check credit balance. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsChecking(false)
    }
  }

  return {
    checkCredits,
    isChecking,
    showInsufficientCreditsModal,
    setShowInsufficientCreditsModal,
    showPurchaseModal,
    setShowPurchaseModal,
    requiredAction,
    currentBalance,
  }
}

// Helper function to get user-friendly action names
export function getActionDisplayName(action: CreditAction): string {
  const displayNames: Record<CreditAction, string> = {
    VIDEO_INTERVIEW: 'AI Video Interview',
    TEXT_INTERVIEW: 'Text Interview',
    RESUME_BUILDER: 'Resume Builder',
    RESUME_TAILORING: 'Resume Tailoring',
    COVER_LETTER: 'Cover Letter Generation'
  }
  return displayNames[action]
}
