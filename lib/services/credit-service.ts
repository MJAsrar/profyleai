/**
 * Credit Service
 * 
 * This service handles all credit-related operations including spending, earning,
 * refunding, and purchasing credits. It ensures atomic transactions and maintains
 * data integrity across all credit operations.
 */

import { prisma } from "@/lib/prisma"
import { CreditTransactionType, CreditPurchaseStatus } from "@prisma/client"
import {
  CREDIT_COSTS,
  CREDIT_PACKAGES,
  CREDIT_THRESHOLDS,
  CreditAction,
  CreditPackageId,
  CreditSummary,
  CreditTransactionDetails,
  CreditPurchaseDetails,
  PurchaseCreditsResponse,
  SpendCreditsResponse,
  RefundCreditsResponse,
  CreditError,
  CreditErrorType,
  InsufficientCreditsError,
  ICreditService,
  CreditTransactionMetadata,
  isCreditAction,
  isCreditPackageId,
  suggestPackageForCredits,
} from "@/lib/types/credits"

/**
 * Core credit service implementation with atomic transactions and comprehensive error handling
 */
export class CreditService implements ICreditService {
  
  // =============================================================================
  // BALANCE OPERATIONS
  // =============================================================================
  
  /**
   * Get current credit balance for a user
   */
  async getCreditBalance(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })
      
      if (!user) {
        throw this.createError(CreditErrorType.USER_NOT_FOUND, `User ${userId} not found`)
      }
      
      return user.credits
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Failed to get credit balance', { originalError: error })
    }
  }
  
  /**
   * Get comprehensive credit summary for a user
   */
  async getCreditSummary(userId: string): Promise<CreditSummary> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          credits: true,
          totalCreditsEarned: true,
          totalCreditsSpent: true,
          lastCreditUpdate: true,
        }
      })
      
      if (!user) {
        throw this.createError(CreditErrorType.USER_NOT_FOUND, `User ${userId} not found`)
      }
      
      // Get recent transactions (last 10)
      const recentTransactions = await prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          balanceAfter: true,
          createdAt: true,
          referenceType: true,
        }
      })
      
      return {
        userId,
        currentBalance: user.credits,
        totalEarned: user.totalCreditsEarned,
        totalSpent: user.totalCreditsSpent,
        lastUpdate: user.lastCreditUpdate,
        recentTransactions: recentTransactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          balanceAfter: tx.balanceAfter,
          createdAt: tx.createdAt,
          referenceType: tx.referenceType,
        })),
        lowBalanceWarning: user.credits <= CREDIT_THRESHOLDS.LOW_BALANCE,
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Failed to get credit summary', { originalError: error })
    }
  }
  
  // =============================================================================
  // CREDIT SPENDING OPERATIONS
  // =============================================================================
  
  /**
   * Spend credits for a specific action with atomic transaction
   */
  async spendCredits(
    userId: string,
    action: CreditAction,
    referenceId?: string,
    metadata?: Record<string, any>
  ): Promise<CreditTransactionDetails> {
    const amount = CREDIT_COSTS[action]
    const description = this.getTransactionDescription(action, 'spend')
    
    // Check if user has enough credits first
    const hasEnough = await this.hasEnoughCredits(userId, action)
    if (!hasEnough) {
      const currentBalance = await this.getCreditBalance(userId)
      throw this.createInsufficientCreditsError(currentBalance, amount)
    }
    
    return this.executeTransaction(async (tx) => {
      // Atomic conditional decrement: only succeeds if the balance still covers the
      // cost. This is what makes concurrent spends safe — a read-then-write could let
      // two in-flight requests each see a sufficient balance and both proceed.
      const claimed = await tx.user.updateMany({
        where: { id: userId, credits: { gte: amount } },
        data: {
          credits: { decrement: amount },
          totalCreditsSpent: { increment: amount },
          lastCreditUpdate: new Date(),
        }
      })

      if (claimed.count === 0) {
        // Either the user vanished or the balance is insufficient — distinguish for a
        // useful error.
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { credits: true }
        })
        if (!user) {
          throw this.createError(CreditErrorType.USER_NOT_FOUND, `User ${userId} not found`)
        }
        throw this.createInsufficientCreditsError(user.credits, amount)
      }

      // Read back the post-decrement balance so the ledger row is exact.
      const updated = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })
      const newBalance = updated!.credits
      const balanceBefore = newBalance + amount

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: this.getSpendTransactionType(action),
          amount: -amount, // Negative for spending
          description,
          referenceId,
          referenceType: this.getReferenceType(action),
          balanceBefore,
          balanceAfter: newBalance,
          metadata: this.enrichMetadata(metadata, { action }),
        }
      })

      return this.mapTransactionToDetails(transaction)
    })
  }
  
  /**
   * Check if user has enough credits for an action
   */
  async hasEnoughCredits(userId: string, action: CreditAction): Promise<boolean> {
    try {
      const balance = await this.getCreditBalance(userId)
      return balance >= CREDIT_COSTS[action]
    } catch (error) {
      // If we can't get balance, assume insufficient credits for safety
      return false
    }
  }
  
  // =============================================================================
  // CREDIT EARNING OPERATIONS
  // =============================================================================
  
  /**
   * Add credits to user account (for purchases, bonuses, etc.)
   */
  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    referenceId?: string,
    metadata?: Record<string, any>
  ): Promise<CreditTransactionDetails> {
    if (amount <= 0) {
      throw this.createError(CreditErrorType.INVALID_ACTION, 'Credit amount must be positive')
    }
    
    const description = this.getTransactionDescription(type, 'earn')
    
    return this.executeTransaction(async (tx) => {
      // Get current user state
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, totalCreditsEarned: true }
      })
      
      if (!user) {
        throw this.createError(CreditErrorType.USER_NOT_FOUND, `User ${userId} not found`)
      }
      
      const newBalance = user.credits + amount
      const newTotalEarned = user.totalCreditsEarned + amount
      
      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: newBalance,
          totalCreditsEarned: newTotalEarned,
          lastCreditUpdate: new Date(),
        }
      })
      
      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type,
          amount, // Positive for earning
          description,
          referenceId,
          referenceType: this.getReferenceTypeFromTransactionType(type),
          balanceBefore: user.credits,
          balanceAfter: newBalance,
          metadata: this.enrichMetadata(metadata, { type }),
        }
      })
      
      return this.mapTransactionToDetails(transaction)
    })
  }
  
  // =============================================================================
  // CREDIT REFUND OPERATIONS
  // =============================================================================
  
  /**
   * Refund credits (e.g., when resume is deleted)
   */
  async refundCredits(
    userId: string,
    originalTransactionId: string,
    reason?: string
  ): Promise<CreditTransactionDetails> {
    return this.executeTransaction(async (tx) => {
      // Find the original transaction
      const originalTx = await tx.creditTransaction.findUnique({
        where: { id: originalTransactionId },
        include: { user: true }
      })
      
      if (!originalTx) {
        throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Original transaction not found')
      }
      
      if (originalTx.userId !== userId) {
        throw this.createError(CreditErrorType.INVALID_ACTION, 'Transaction does not belong to user')
      }
      
      if (originalTx.isReversed) {
        throw this.createError(CreditErrorType.REFUND_NOT_ALLOWED, 'Transaction already refunded')
      }
      
      if (originalTx.amount >= 0) {
        throw this.createError(CreditErrorType.REFUND_NOT_ALLOWED, 'Can only refund spending transactions')
      }
      
      const refundAmount = Math.abs(originalTx.amount)
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true, totalCreditsEarned: true }
      })
      
      if (!currentUser) {
        throw this.createError(CreditErrorType.USER_NOT_FOUND, `User ${userId} not found`)
      }
      
      const newBalance = currentUser.credits + refundAmount
      const newTotalEarned = currentUser.totalCreditsEarned + refundAmount
      
      // Update user credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: newBalance,
          totalCreditsEarned: newTotalEarned,
          lastCreditUpdate: new Date(),
        }
      })
      
      // Mark original transaction as reversed
      await tx.creditTransaction.update({
        where: { id: originalTransactionId },
        data: { isReversed: true }
      })
      
      // Create refund transaction
      const refundTransaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: this.getRefundTransactionType(originalTx.type),
          amount: refundAmount, // Positive for refund
          description: `Refund: ${originalTx.description}${reason ? ` (${reason})` : ''}`,
          referenceId: originalTx.referenceId,
          referenceType: originalTx.referenceType,
          balanceBefore: currentUser.credits,
          balanceAfter: newBalance,
          reversalId: originalTransactionId,
          metadata: this.enrichMetadata({
            originalTransactionId,
            reason: reason || 'User requested refund',
            refundType: 'automatic'
          }, { type: 'refund' }),
        }
      })
      
      return this.mapTransactionToDetails(refundTransaction)
    })
  }
  
  // =============================================================================
  // PURCHASE OPERATIONS
  // =============================================================================
  
  /**
   * Initiate credit purchase (creates payment intent)
   */
  async initiateCreditPurchase(
    userId: string,
    packageId: CreditPackageId
  ): Promise<PurchaseCreditsResponse> {
    if (!isCreditPackageId(packageId)) {
      throw this.createError(CreditErrorType.PACKAGE_NOT_FOUND, `Invalid package ID: ${packageId}`)
    }
    
    const package_ = CREDIT_PACKAGES[packageId]
    
    // Create purchase record
    const purchase = await prisma.creditPurchase.create({
      data: {
        userId,
        packageType: packageId,
        creditsAmount: package_.credits,
        dollarAmount: package_.price,
        creditsPerDollar: package_.creditsPerDollar,
        paymentProvider: 'stripe', // TODO: Make configurable
        paymentIntentId: '', // Will be updated with actual Stripe payment intent ID
        status: CreditPurchaseStatus.PENDING,
        purchaseMetadata: {
          packageName: package_.name,
          bonusPercentage: package_.bonusPercentage,
          userAgent: 'server', // TODO: Get from request headers
          timestamp: new Date().toISOString(),
        }
      }
    })
    
    // TODO: Integrate with Stripe to create actual payment intent
    // For now, return mock response
    return {
      success: true,
      purchaseId: purchase.id,
      paymentIntentId: 'pi_mock_' + purchase.id,
      clientSecret: 'pi_mock_' + purchase.id + '_secret',
      amount: package_.price,
      credits: package_.credits,
    }
  }
  
  /**
   * Update purchase record with payment intent ID or checkout session ID
   */
  async updatePurchaseRecord(
    purchaseId: string,
    paymentIdentifier: string,
    type: 'payment_intent' | 'checkout_session' = 'checkout_session'
  ): Promise<void> {
    try {
      const updateData = {
        updatedAt: new Date(),
        ...(type === 'payment_intent' 
          ? { paymentIntentId: paymentIdentifier }
          : { checkoutSessionId: paymentIdentifier }
        )
      }

      await prisma.creditPurchase.update({
        where: { id: purchaseId },
        data: updateData
      })
    } catch (error) {
      throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Failed to update purchase record', { originalError: error })
    }
  }

  /**
   * Complete credit purchase after successful payment
   */
  async completeCreditPurchase(
    purchaseId: string,
    paymentId: string
  ): Promise<CreditTransactionDetails> {
    return this.executeTransaction(async (tx) => {
      // Get purchase record
      const purchase = await tx.creditPurchase.findUnique({
        where: { id: purchaseId }
      })
      
      if (!purchase) {
        throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Purchase record not found')
      }
      
      if (purchase.status !== CreditPurchaseStatus.PENDING) {
        throw this.createError(CreditErrorType.DUPLICATE_TRANSACTION, 'Purchase already processed')
      }

      // Atomic compare-and-swap: only the first caller flips PENDING -> COMPLETED.
      // Stripe delivers webhooks at-least-once (and both checkout.session.completed
      // and payment_intent.succeeded can fire for one purchase), so this guard is
      // what prevents a duplicate delivery from crediting the user twice.
      const claimed = await tx.creditPurchase.updateMany({
        where: { id: purchaseId, status: CreditPurchaseStatus.PENDING },
        data: {
          status: CreditPurchaseStatus.COMPLETED,
          paymentId,
          completedAt: new Date(),
        }
      })

      if (claimed.count === 0) {
        // Another concurrent delivery already claimed it — treat as duplicate.
        throw this.createError(CreditErrorType.DUPLICATE_TRANSACTION, 'Purchase already processed')
      }

      // Add credits to user account
      const transaction = await this.addCreditsWithTransaction(
        tx,
        purchase.userId,
        purchase.creditsAmount,
        CreditTransactionType.EARNED_PURCHASE,
        purchaseId,
        {
          packageType: purchase.packageType,
          dollarAmount: purchase.dollarAmount,
          paymentId,
          purchaseId,
        }
      )
      
      return transaction
    })
  }
  
  /**
   * Remove credits that were granted for a payment that has since been refunded or
   * charged back, and mark the purchase REFUNDED.
   *
   * Without this, a customer could buy credits, spend or keep them, then refund the
   * payment and keep the credits — free money, repeatably.
   *
   * The balance is clamped at zero: if the user already spent the credits we do not
   * push them negative, we just take back what remains and record the full clawback
   * amount in the ledger so the shortfall is visible.
   *
   * Idempotent: a purchase that is already REFUNDED is a no-op.
   */
  async clawbackPurchase(purchaseId: string, reason: string): Promise<void> {
    return this.executeTransaction(async (tx) => {
      // Claim the purchase atomically so duplicate refund events cannot double-claw.
      const claimed = await tx.creditPurchase.updateMany({
        where: { id: purchaseId, status: CreditPurchaseStatus.COMPLETED },
        data: { status: CreditPurchaseStatus.REFUNDED },
      })

      if (claimed.count === 0) {
        // Not completed (or already refunded) — nothing to take back.
        return
      }

      const purchase = await tx.creditPurchase.findUnique({
        where: { id: purchaseId },
        select: { userId: true, creditsAmount: true, packageType: true },
      })
      if (!purchase) return

      const user = await tx.user.findUnique({
        where: { id: purchase.userId },
        select: { credits: true },
      })
      if (!user) return

      // Take back as much as is actually there; never drive the balance negative.
      const removable = Math.min(user.credits, purchase.creditsAmount)
      const newBalance = user.credits - removable

      await tx.user.update({
        where: { id: purchase.userId },
        data: {
          credits: newBalance,
          totalCreditsEarned: { decrement: purchase.creditsAmount },
          lastCreditUpdate: new Date(),
        },
      })

      await tx.creditTransaction.create({
        data: {
          userId: purchase.userId,
          type: CreditTransactionType.CLAWBACK_REFUND,
          amount: -purchase.creditsAmount, // full amount reversed, even if partly unrecoverable
          description: 'Credits reversed — payment refunded',
          referenceId: purchaseId,
          referenceType: 'purchase',
          balanceBefore: user.credits,
          balanceAfter: newBalance,
          metadata: this.enrichMetadata(
            { reason, packageType: purchase.packageType, unrecovered: purchase.creditsAmount - removable },
            { action: 'clawback' }
          ),
        },
      })

      console.log(
        `Clawed back ${removable}/${purchase.creditsAmount} credits from user ${purchase.userId} (purchase ${purchaseId}): ${reason}`
      )
    })
  }

  // =============================================================================
  // TRANSACTION HISTORY
  // =============================================================================
  
  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransactionDetails[]> {
    try {
      const transactions = await prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      })
      
      return transactions.map(tx => this.mapTransactionToDetails(tx))
    } catch (error) {
      throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Failed to get transaction history', { originalError: error })
    }
  }
  
  /**
   * Get transactions by type
   */
  async getTransactionsByType(
    userId: string,
    type: CreditTransactionType,
    limit: number = 20
  ): Promise<CreditTransactionDetails[]> {
    try {
      const transactions = await prisma.creditTransaction.findMany({
        where: { userId, type },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      
      return transactions.map(tx => this.mapTransactionToDetails(tx))
    } catch (error) {
      throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Failed to get transactions by type', { originalError: error })
    }
  }
  
  // =============================================================================
  // VALIDATION
  // =============================================================================
  
  /**
   * Validate credit action
   */
  validateCreditAction(action: string): action is CreditAction {
    return isCreditAction(action)
  }
  
  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================
  
  /**
   * Execute database operations within a transaction
   */
  private async executeTransaction<T>(
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    try {
      return await prisma.$transaction(operation, {
        maxWait: 5000,
        timeout: 10000,
      })
    } catch (error) {
      throw this.createError(CreditErrorType.TRANSACTION_FAILED, 'Database transaction failed', { originalError: error })
    }
  }
  
  /**
   * Add credits within an existing transaction
   */
  private async addCreditsWithTransaction(
    tx: any,
    userId: string,
    amount: number,
    type: CreditTransactionType,
    referenceId?: string,
    metadata?: Record<string, any>
  ): Promise<CreditTransactionDetails> {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true, totalCreditsEarned: true }
    })
    
    if (!user) {
      throw this.createError(CreditErrorType.USER_NOT_FOUND, `User ${userId} not found`)
    }
    
    const newBalance = user.credits + amount
    const newTotalEarned = user.totalCreditsEarned + amount
    
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: newBalance,
        totalCreditsEarned: newTotalEarned,
        lastCreditUpdate: new Date(),
      }
    })
    
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        type,
        amount,
        description: this.getTransactionDescription(type, 'earn'),
        referenceId,
        referenceType: this.getReferenceTypeFromTransactionType(type),
        balanceBefore: user.credits,
        balanceAfter: newBalance,
        metadata: this.enrichMetadata(metadata, { type }),
      }
    })
    
    return this.mapTransactionToDetails(transaction)
  }
  
  /**
   * Map database transaction to details interface
   */
  private mapTransactionToDetails(transaction: any): CreditTransactionDetails {
    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      referenceId: transaction.referenceId,
      referenceType: transaction.referenceType,
      balanceAfter: transaction.balanceAfter,
      balanceBefore: transaction.balanceBefore,
      isReversed: transaction.isReversed,
      reversalId: transaction.reversalId,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }
  }
  
  /**
   * Get transaction type for spending actions
   */
  private getSpendTransactionType(action: CreditAction): CreditTransactionType {
    const mapping: Record<CreditAction, CreditTransactionType> = {
      VIDEO_INTERVIEW: CreditTransactionType.SPENT_VIDEO_INTERVIEW,
      TEXT_INTERVIEW: CreditTransactionType.SPENT_TEXT_INTERVIEW,
      RESUME_BUILDER: CreditTransactionType.SPENT_RESUME_BUILDER,
      RESUME_TAILORING: CreditTransactionType.SPENT_RESUME_TAILORING,
      COVER_LETTER: CreditTransactionType.SPENT_COVER_LETTER,
    }
    return mapping[action]
  }
  
  /**
   * Get refund transaction type based on original type
   */
  private getRefundTransactionType(originalType: CreditTransactionType): CreditTransactionType {
    if (originalType.startsWith('SPENT_')) {
      return CreditTransactionType.REFUND_RESUME_DELETE // Default refund type
    }
    return CreditTransactionType.REFUND_ADMIN
  }
  
  /**
   * Get reference type for different actions
   */
  private getReferenceType(action: CreditAction): string {
    const mapping: Record<CreditAction, string> = {
      VIDEO_INTERVIEW: 'video_interview',
      TEXT_INTERVIEW: 'interview_prep',
      RESUME_BUILDER: 'resume',
      RESUME_TAILORING: 'tailored_resume',
      COVER_LETTER: 'cover_letter',
    }
    return mapping[action]
  }
  
  /**
   * Get reference type from transaction type
   */
  private getReferenceTypeFromTransactionType(type: CreditTransactionType): string | null {
    if (type === CreditTransactionType.EARNED_PURCHASE) return 'purchase'
    if (type === CreditTransactionType.EARNED_SIGNUP) return 'signup'
    if (type === CreditTransactionType.EARNED_REFERRAL) return 'referral'
    return null
  }
  
  /**
   * Generate human-readable transaction description
   */
  private getTransactionDescription(
    actionOrType: CreditAction | CreditTransactionType,
    operation: 'spend' | 'earn'
  ): string {
    if (operation === 'spend') {
      const action = actionOrType as CreditAction
      const descriptions: Record<CreditAction, string> = {
        VIDEO_INTERVIEW: 'Video Interview Session',
        TEXT_INTERVIEW: 'Text Interview Preparation',
        RESUME_BUILDER: 'Resume Builder',
        RESUME_TAILORING: 'Resume Tailoring',
        COVER_LETTER: 'Cover Letter Generation',
      }
      return descriptions[action]
    }
    
    const type = actionOrType as CreditTransactionType
    const descriptions: Partial<Record<CreditTransactionType, string>> = {
      [CreditTransactionType.EARNED_SIGNUP]: 'Welcome Bonus',
      [CreditTransactionType.EARNED_EMAIL_VERIFICATION]: 'Email Verification Bonus',
      [CreditTransactionType.EARNED_REFERRAL]: 'Referral Bonus',
      [CreditTransactionType.EARNED_PURCHASE]: 'Credit Purchase',
      [CreditTransactionType.EARNED_ADMIN]: 'Admin Credit Grant',
      [CreditTransactionType.EARNED_PROMOTION]: 'Promotional Credits',
      [CreditTransactionType.REFUND_RESUME_DELETE]: 'Resume Deletion Refund',
      [CreditTransactionType.REFUND_FAILED_OPERATION]: 'Failed Operation Refund',
      [CreditTransactionType.REFUND_ADMIN]: 'Admin Refund',
    }
    
    return descriptions[type] || 'Credit Transaction'
  }
  
  /**
   * Enrich metadata with common fields
   */
  private enrichMetadata(
    metadata?: Record<string, any>,
    context?: Record<string, any>
  ): CreditTransactionMetadata {
    return {
      ...metadata,
      ...context,
      timestamp: new Date().toISOString(),
    } as CreditTransactionMetadata
  }
  
  /**
   * Create credit error with consistent structure
   */
  private createError(
    type: CreditErrorType,
    message: string,
    details?: Record<string, any>
  ): CreditError {
    return {
      type,
      message,
      code: type.toUpperCase().replace(/_/g, '_'),
      details,
      retryable: type === CreditErrorType.TRANSACTION_FAILED,
    }
  }
  
  /**
   * Create insufficient credits error with helpful details
   */
  private createInsufficientCreditsError(
    currentBalance: number,
    requiredCredits: number
  ): InsufficientCreditsError {
    const shortfall = requiredCredits - currentBalance
    const suggestedPackage = suggestPackageForCredits(shortfall)
    
    return {
      type: CreditErrorType.INSUFFICIENT_CREDITS,
      message: `Insufficient credits. You have ${currentBalance} credits but need ${requiredCredits}.`,
      code: 'INSUFFICIENT_CREDITS',
      currentBalance,
      requiredCredits,
      shortfall,
      suggestedPackage: suggestedPackage ?? undefined,
      retryable: false,
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Singleton instance of the credit service
 */
export const creditService = new CreditService()

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick check if user has enough credits for an action
 */
export async function hasEnoughCredits(userId: string, action: CreditAction): Promise<boolean> {
  return creditService.hasEnoughCredits(userId, action)
}

/**
 * Spend credits for an action with simplified interface
 */
export async function spendCredits(
  userId: string,
  action: CreditAction,
  referenceId?: string,
  metadata?: Record<string, any>
): Promise<SpendCreditsResponse> {
  try {
    const transaction = await creditService.spendCredits(userId, action, referenceId, metadata)
    return {
      success: true,
      transactionId: transaction.id,
      newBalance: transaction.balanceAfter,
      amountSpent: Math.abs(transaction.amount),
      message: `Successfully spent ${Math.abs(transaction.amount)} credits for ${transaction.description}`,
    }
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      newBalance: await creditService.getCreditBalance(userId).catch(() => 0),
      amountSpent: 0,
      message: error instanceof Error ? error.message : 'Failed to spend credits',
    }
  }
}

/**
 * Refund credits with simplified interface
 */
export async function refundCredits(
  userId: string,
  originalTransactionId: string,
  reason?: string
): Promise<RefundCreditsResponse> {
  try {
    const transaction = await creditService.refundCredits(userId, originalTransactionId, reason)
    return {
      success: true,
      transactionId: transaction.id,
      refundedAmount: transaction.amount,
      newBalance: transaction.balanceAfter,
      message: `Successfully refunded ${transaction.amount} credits`,
    }
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      refundedAmount: 0,
      newBalance: await creditService.getCreditBalance(userId).catch(() => 0),
      message: error instanceof Error ? error.message : 'Failed to refund credits',
    }
  }
}
