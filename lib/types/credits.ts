/**
 * Credit System Types
 * 
 * This file defines all TypeScript types and interfaces for the credit-based payment system.
 * These types ensure type safety and consistency across the application.
 */

import { CreditTransactionType, CreditPurchaseStatus } from "@prisma/client"

// =============================================================================
// CREDIT COSTS CONFIGURATION
// =============================================================================

/**
 * Credit costs for different actions in the application
 * These values represent the cost in credits for each feature
 */
export const CREDIT_COSTS = {
  VIDEO_INTERVIEW: 50,   // $5.00 equivalent
  TEXT_INTERVIEW: 5,     // $0.50 equivalent
  RESUME_BUILDER: 3,     // $0.30 equivalent
  RESUME_TAILORING: 2,   // $0.20 equivalent
  COVER_LETTER: 2,       // $0.20 equivalent
} as const

/**
 * Available credit actions that can be performed
 */
export type CreditAction = keyof typeof CREDIT_COSTS

/**
 * Credit package configurations for purchase
 */
export const CREDIT_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 5.00,
    creditsPerDollar: 10.0,
    bonusPercentage: 0,
    description: 'Perfect for trying out our services',
    popular: false,
  },
  value: {
    id: 'value',
    name: 'Value Pack',
    credits: 105,
    price: 10.00,
    creditsPerDollar: 10.5,
    bonusPercentage: 5,
    description: 'Great value with 5% bonus credits',
    popular: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium Pack',
    credits: 275,
    price: 25.00,
    creditsPerDollar: 11.0,
    bonusPercentage: 10,
    description: 'Most popular choice with 10% bonus',
    popular: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro Pack',
    credits: 575,
    price: 50.00,
    creditsPerDollar: 11.5,
    bonusPercentage: 15,
    description: 'For power users with 15% bonus',
    popular: false,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1200,
    price: 100.00,
    creditsPerDollar: 12.0,
    bonusPercentage: 20,
    description: 'Maximum value with 20% bonus',
    popular: false,
  },
} as const

export type CreditPackageId = keyof typeof CREDIT_PACKAGES
export type CreditPackage = typeof CREDIT_PACKAGES[CreditPackageId]

// =============================================================================
// CORE CREDIT INTERFACES
// =============================================================================

/**
 * User credit summary with balance and statistics
 */
export interface CreditSummary {
  userId: string
  currentBalance: int
  totalEarned: int
  totalSpent: int
  lastUpdate: Date
  recentTransactions: CreditTransactionSummary[]
  lowBalanceWarning: boolean // true if balance < 10 credits
}

/**
 * Simplified transaction for summary views
 */
export interface CreditTransactionSummary {
  id: string
  type: CreditTransactionType
  amount: int
  description: string
  balanceAfter: int
  createdAt: Date
  referenceType?: string | null
}

/**
 * Complete credit transaction details
 */
export interface CreditTransactionDetails {
  id: string
  userId: string
  type: CreditTransactionType
  amount: int
  description: string
  referenceId?: string | null
  referenceType?: string | null
  balanceAfter: int
  balanceBefore: int
  isReversed: boolean
  reversalId?: string | null
  metadata?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Credit purchase details
 */
export interface CreditPurchaseDetails {
  id: string
  userId: string
  packageType: string
  creditsAmount: int
  dollarAmount: number
  creditsPerDollar: number
  paymentProvider: string
  paymentIntentId: string
  paymentId?: string | null
  status: CreditPurchaseStatus
  createdAt: Date
  updatedAt: Date
  completedAt?: Date | null
  failedAt?: Date | null
  errorMessage?: string | null
  retryCount: int
  purchaseMetadata?: Record<string, any> | null
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Request to spend credits
 */
export interface SpendCreditsRequest {
  action: CreditAction
  referenceId?: string
  metadata?: Record<string, any>
}

/**
 * Response after spending credits
 */
export interface SpendCreditsResponse {
  success: boolean
  transactionId: string
  newBalance: int
  amountSpent: int
  message: string
}

/**
 * Request to purchase credits
 */
export interface PurchaseCreditsRequest {
  packageId: CreditPackageId
  successUrl?: string
  cancelUrl?: string
}

/**
 * Response when initiating credit purchase
 */
export interface PurchaseCreditsResponse {
  success: boolean
  purchaseId: string
  paymentIntentId: string
  clientSecret: string
  amount: number
  credits: int
  redirectUrl?: string
}

/**
 * Request to refund credits
 */
export interface RefundCreditsRequest {
  originalTransactionId: string
  reason?: string
  metadata?: Record<string, any>
}

/**
 * Response after refunding credits
 */
export interface RefundCreditsResponse {
  success: boolean
  transactionId: string
  refundedAmount: int
  newBalance: int
  message: string
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Credit-related error types
 */
export enum CreditErrorType {
  INSUFFICIENT_CREDITS = 'insufficient_credits',
  INVALID_ACTION = 'invalid_action',
  TRANSACTION_FAILED = 'transaction_failed',
  PAYMENT_FAILED = 'payment_failed',
  USER_NOT_FOUND = 'user_not_found',
  PACKAGE_NOT_FOUND = 'package_not_found',
  REFUND_NOT_ALLOWED = 'refund_not_allowed',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
}

/**
 * Credit operation error details
 */
export interface CreditError {
  type: CreditErrorType
  message: string
  code: string
  details?: Record<string, any>
  retryable: boolean
}

/**
 * Insufficient credits error with specific details
 */
export interface InsufficientCreditsError extends CreditError {
  type: CreditErrorType.INSUFFICIENT_CREDITS
  currentBalance: int
  requiredCredits: int
  shortfall: int
  suggestedPackage?: CreditPackage
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Core credit service interface
 */
export interface ICreditService {
  // Balance operations
  getCreditBalance(userId: string): Promise<int>
  getCreditSummary(userId: string): Promise<CreditSummary>
  
  // Transaction operations
  spendCredits(userId: string, action: CreditAction, referenceId?: string, metadata?: Record<string, any>): Promise<CreditTransactionDetails>
  addCredits(userId: string, amount: int, type: CreditTransactionType, referenceId?: string, metadata?: Record<string, any>): Promise<CreditTransactionDetails>
  refundCredits(userId: string, originalTransactionId: string, reason?: string): Promise<CreditTransactionDetails>
  
  // Validation
  hasEnoughCredits(userId: string, action: CreditAction): Promise<boolean>
  validateCreditAction(action: string): action is CreditAction
  
  // Purchase operations
  initiateCreditPurchase(userId: string, packageId: CreditPackageId): Promise<PurchaseCreditsResponse>
  completeCreditPurchase(purchaseId: string, paymentId: string): Promise<CreditTransactionDetails>
  
  // Transaction history
  getTransactionHistory(userId: string, limit?: int, offset?: int): Promise<CreditTransactionDetails[]>
  getTransactionsByType(userId: string, type: CreditTransactionType, limit?: int): Promise<CreditTransactionDetails[]>
}

/**
 * Credit middleware configuration
 */
export interface CreditMiddlewareOptions {
  action: CreditAction
  skipOnInsufficientCredits?: boolean
  requireExactBalance?: boolean
  metadata?: Record<string, any>
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Credit operation result with success/error handling
 */
export type CreditOperationResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: CreditError
}

/**
 * Credit balance thresholds for UI warnings
 */
export const CREDIT_THRESHOLDS = {
  LOW_BALANCE: 10,      // Show warning when balance is below this
  CRITICAL_BALANCE: 5,  // Show critical warning when balance is below this
  ZERO_BALANCE: 0,      // Block actions when balance is at or below this
} as const

/**
 * Credit transaction metadata schemas for different actions
 */
export interface CreditTransactionMetadata {
  // Common fields
  userAgent?: string
  ipAddress?: string
  timestamp: string
  
  // Video interview metadata
  videoInterview?: {
    sessionId: string
    duration?: int
    questionsCount?: int
    jobTitle?: string
    companyName?: string
  }
  
  // Resume metadata
  resume?: {
    resumeId: string
    templateId?: string
    title?: string
    action: 'create' | 'edit' | 'delete'
  }
  
  // Tailoring metadata
  tailoring?: {
    baseResumeId: string
    tailoredResumeId: string
    jobTitle?: string
    companyName?: string
    matchScore?: int
  }
  
  // Cover letter metadata
  coverLetter?: {
    coverLetterId: string
    templateId?: string
    jobTitle?: string
    companyName?: string
  }
  
  // Purchase metadata
  purchase?: {
    packageId: CreditPackageId
    paymentProvider: string
    paymentIntentId: string
    originalAmount: number
    bonusCredits?: int
  }
  
  // Refund metadata
  refund?: {
    originalTransactionId: string
    reason: string
    refundType: 'automatic' | 'manual' | 'admin'
  }
}

/**
 * Type guard to check if a string is a valid credit action
 */
export function isCreditAction(action: string): action is CreditAction {
  return action in CREDIT_COSTS
}

/**
 * Type guard to check if a string is a valid package ID
 */
export function isCreditPackageId(packageId: string): packageId is CreditPackageId {
  return packageId in CREDIT_PACKAGES
}

/**
 * Calculate credits needed for multiple actions
 */
export function calculateTotalCredits(actions: CreditAction[]): int {
  return actions.reduce((total, action) => total + CREDIT_COSTS[action], 0)
}

/**
 * Get the appropriate package suggestion for a credit amount
 */
export function suggestPackageForCredits(creditsNeeded: int): CreditPackage | null {
  const packages = Object.values(CREDIT_PACKAGES)
  const suitablePackages = packages.filter(pkg => pkg.credits >= creditsNeeded)
  
  if (suitablePackages.length === 0) {
    return packages[packages.length - 1] // Return largest package if none are sufficient
  }
  
  // Return the smallest suitable package
  return suitablePackages.reduce((smallest, current) => 
    current.credits < smallest.credits ? current : smallest
  )
}
