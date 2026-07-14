/**
 * Stripe Service
 * 
 * This service handles all Stripe payment processing for credit purchases.
 * It integrates with our credit system to provide seamless payment experiences.
 */

import Stripe from 'stripe'
import { CREDIT_PACKAGES, CreditPackageId, isCreditPackageId, CreditErrorType } from '@/lib/types/credits'

/**
 * Result of processing a webhook event.
 * - processed: the event was fully handled (or is an idempotent duplicate) → HTTP 200
 * - retryable: a HANDLED event failed transiently → the route returns 5xx so Stripe retries
 *   (unhandled event types are processed:false, retryable:false → HTTP 200, no retry)
 */
export type WebhookResult = { processed: boolean; message: string; retryable?: boolean }

/** True if the error means the purchase was already completed (safe, idempotent). */
function isDuplicatePurchaseError(error: unknown): boolean {
  const err = error as any
  const type = err?.type ?? err?.details?.originalError?.type
  return type === CreditErrorType.DUPLICATE_TRANSACTION
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// =============================================================================
// STRIPE CONFIGURATION
// =============================================================================

/**
 * Stripe configuration for credit packages
 */
const STRIPE_CONFIG = {
  currency: 'usd',
  automatic_payment_methods: {
    enabled: true,
  },
  payment_method_types: ['card'],
} as const

/**
 * Create Stripe products and prices for credit packages
 * This should be run once during setup to create the products in Stripe Dashboard
 */
export async function createStripeProducts() {
  const products = []
  
  for (const [packageId, packageInfo] of Object.entries(CREDIT_PACKAGES)) {
    try {
      // Create product
      const product = await stripe.products.create({
        id: `credits_${packageId}`,
        name: `${packageInfo.name} - ${packageInfo.credits} Credits`,
        description: packageInfo.description,
        metadata: {
          packageId,
          credits: packageInfo.credits.toString(),
          creditsPerDollar: packageInfo.creditsPerDollar.toString(),
          bonusPercentage: packageInfo.bonusPercentage.toString(),
        },
      })
      
      // Create price (Stripe assigns the price id automatically; it cannot be set)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(packageInfo.price * 100), // Convert to cents
        currency: STRIPE_CONFIG.currency,
        metadata: {
          packageId,
          credits: packageInfo.credits.toString(),
        },
      })
      
      products.push({ product, price })
    } catch (error) {
      console.error(`Failed to create Stripe product for ${packageId}:`, error)
    }
  }
  
  return products
}

// =============================================================================
// CHECKOUT SESSION OPERATIONS
// =============================================================================

/**
 * Create checkout session for credit purchase
 */
export async function createCreditCheckoutSession(
  packageId: CreditPackageId,
  userId: string,
  purchaseId: string,
  options: {
    successUrl: string
    cancelUrl: string
    userEmail?: string
    userName?: string
  }
): Promise<Stripe.Checkout.Session> {
  if (!isCreditPackageId(packageId)) {
    throw new Error(`Invalid package ID: ${packageId}`)
  }
  
  const package_ = CREDIT_PACKAGES[packageId]
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `${package_.name}`,
              description: `${package_.credits} Credits - ${package_.description}`,
              metadata: {
                packageId,
                credits: package_.credits.toString(),
              },
            },
            unit_amount: Math.round(package_.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        purchaseId,
        packageId,
        credits: package_.credits.toString(),
        creditsPerDollar: package_.creditsPerDollar.toString(),
      },
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.userEmail,
      billing_address_collection: 'auto',
      automatic_tax: {
        enabled: false, // Enable if you need tax calculation
      },
    })
    
    return session
  } catch (error) {
    console.error('Failed to create Stripe checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Retrieve checkout session
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('Failed to retrieve checkout session:', error)
    throw new Error('Failed to retrieve checkout session')
  }
}

// =============================================================================
// PAYMENT INTENT OPERATIONS
// =============================================================================

/**
 * Create payment intent for credit purchase
 */
export async function createCreditPurchaseIntent(
  packageId: CreditPackageId,
  userId: string,
  purchaseId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  if (!isCreditPackageId(packageId)) {
    throw new Error(`Invalid package ID: ${packageId}`)
  }
  
  const package_ = CREDIT_PACKAGES[packageId]
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(package_.price * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      automatic_payment_methods: STRIPE_CONFIG.automatic_payment_methods,
      metadata: {
        userId,
        purchaseId,
        packageId,
        credits: package_.credits.toString(),
        creditsPerDollar: package_.creditsPerDollar.toString(),
        ...metadata,
      },
      description: `${package_.name} - ${package_.credits} Credits`,
    })
    
    return paymentIntent
  } catch (error) {
    console.error('Failed to create Stripe payment intent:', error)
    throw new Error('Failed to create payment intent')
  }
}

/**
 * Retrieve payment intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error)
    throw new Error('Failed to retrieve payment intent')
  }
}

/**
 * Update payment intent
 */
export async function updatePaymentIntent(
  paymentIntentId: string,
  updates: Stripe.PaymentIntentUpdateParams
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.update(paymentIntentId, updates)
  } catch (error) {
    console.error('Failed to update payment intent:', error)
    throw new Error('Failed to update payment intent')
  }
}

// =============================================================================
// WEBHOOK VERIFICATION
// =============================================================================

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Process webhook event
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<WebhookResult> {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      
      case 'checkout.session.expired':
        return await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
      
      case 'payment_intent.succeeded':
        return await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
      
      case 'payment_intent.payment_failed':
        return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
      
      case 'payment_intent.canceled':
        return await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)

      // Money went back to the customer — take the credits back too.
      case 'charge.refunded':
        return await handleChargeReversed(
          event.data.object as Stripe.Charge,
          'Payment refunded'
        )

      case 'charge.dispute.created':
        return await handleDisputeCreated(event.data.object as Stripe.Dispute)

      default:
        return {
          processed: false,
          retryable: false,
          message: `Unhandled event type: ${event.type}`
        }
    }
  } catch (error) {
    console.error('Error processing webhook event:', error)
    // Unexpected failure at the dispatch level — treat as transient so Stripe retries.
    return {
      processed: false,
      retryable: true,
      message: `Error processing event: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// =============================================================================
// WEBHOOK EVENT HANDLERS
// =============================================================================

/**
 * A charge was refunded — reverse the credits it bought.
 * Without this, a customer can buy credits, then refund the payment and keep them.
 */
async function handleChargeReversed(charge: Stripe.Charge, reason: string): Promise<WebhookResult> {
  const paymentIntentId =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id

  if (!paymentIntentId) {
    return { processed: false, retryable: false, message: 'Charge has no payment_intent to match' }
  }

  return reverseCreditsForPayment(paymentIntentId, reason)
}

/** A dispute/chargeback was opened — reverse the credits immediately. */
async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<WebhookResult> {
  const paymentIntentId =
    typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id

  if (!paymentIntentId) {
    return { processed: false, retryable: false, message: 'Dispute has no payment_intent to match' }
  }

  return reverseCreditsForPayment(paymentIntentId, 'Payment disputed (chargeback)')
}

/** Find the purchase behind a payment and claw its credits back. */
async function reverseCreditsForPayment(paymentIntentId: string, reason: string): Promise<WebhookResult> {
  try {
    const { prisma } = await import('@/lib/prisma')
    const { creditService } = await import('@/lib/services/credit-service')

    // The purchase may be keyed by either field depending on the checkout path used.
    const purchase = await prisma.creditPurchase.findFirst({
      where: {
        OR: [{ paymentId: paymentIntentId }, { paymentIntentId: paymentIntentId }],
      },
      select: { id: true },
    })

    if (!purchase) {
      // Nothing of ours to reverse (e.g. a payment unrelated to credits).
      return { processed: false, retryable: false, message: `No credit purchase for payment ${paymentIntentId}` }
    }

    // Idempotent: a purchase already REFUNDED is a no-op inside clawbackPurchase.
    await creditService.clawbackPurchase(purchase.id, reason)

    return { processed: true, message: `Reversed credits for purchase ${purchase.id}: ${reason}` }
  } catch (error) {
    console.error('Failed to reverse credits for payment:', error)
    // Transient — let Stripe retry so we don't silently leave credits with a refunder.
    return {
      processed: false,
      retryable: true,
      message: `Failed to reverse credits: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<WebhookResult> {
  const { purchaseId, userId, packageId, credits } = session.metadata || {}

  if (!purchaseId || !userId || !packageId || !credits) {
    // Permanent problem with this event — retrying won't help.
    return {
      processed: false,
      retryable: false,
      message: 'Missing required metadata in checkout session'
    }
  }

  try {
    // Import here to avoid circular dependencies
    const { creditService } = await import('@/lib/services/credit-service')

    // Complete the credit purchase
    await creditService.completeCreditPurchase(purchaseId, session.id)

    return {
      processed: true,
      message: `Successfully processed credit purchase for user ${userId}`
    }
  } catch (error) {
    // Already granted (duplicate delivery) is success, not a failure to retry.
    if (isDuplicatePurchaseError(error)) {
      return { processed: true, message: `Credit purchase already completed for user ${userId}` }
    }
    // Transient failure (e.g. DB unavailable): return retryable so the route emits 5xx
    // and Stripe retries — otherwise the customer paid but was never credited.
    console.error('Error completing credit purchase from checkout session:', error)
    return {
      processed: false,
      retryable: true,
      message: `Failed to complete credit purchase: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<{
  processed: boolean
  message: string
}> {
  const { purchaseId, userId } = session.metadata || {}
  
  if (!purchaseId || !userId) {
    return {
      processed: false,
      message: 'Missing required metadata in checkout session'
    }
  }
  
  try {
    // Import here to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma')
    const { CreditPurchaseStatus } = await import('@prisma/client')
    
    // Update purchase status to expired
    await prisma.creditPurchase.update({
      where: { id: purchaseId },
      data: {
        status: CreditPurchaseStatus.CANCELLED,
        errorMessage: 'Checkout session expired',
        paymentId: session.id,
      }
    })
    
    return {
      processed: true,
      message: `Checkout session expired for user ${userId}, purchase ${purchaseId}`
    }
  } catch (error) {
    console.error('Error handling checkout session expiration:', error)
    return {
      processed: false,
      message: `Failed to handle checkout session expiration: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<WebhookResult> {
  const { purchaseId, userId, packageId, credits } = paymentIntent.metadata

  if (!purchaseId || !userId || !packageId || !credits) {
    return {
      processed: false,
      retryable: false,
      message: 'Missing required metadata in payment intent'
    }
  }

  try {
    // Import here to avoid circular dependencies
    const { creditService } = await import('@/lib/services/credit-service')

    // Complete the credit purchase
    await creditService.completeCreditPurchase(purchaseId, paymentIntent.id)

    return {
      processed: true,
      message: `Successfully processed credit purchase for user ${userId}`
    }
  } catch (error) {
    if (isDuplicatePurchaseError(error)) {
      return { processed: true, message: `Credit purchase already completed for user ${userId}` }
    }
    console.error('Error completing credit purchase:', error)
    return {
      processed: false,
      retryable: true,
      message: `Failed to complete credit purchase: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<{
  processed: boolean
  message: string
}> {
  const { purchaseId, userId } = paymentIntent.metadata
  
  if (!purchaseId || !userId) {
    return {
      processed: false,
      message: 'Missing required metadata in payment intent'
    }
  }
  
  try {
    // Import here to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma')
    const { CreditPurchaseStatus } = await import('@prisma/client')
    
    // Update purchase status to failed
    await prisma.creditPurchase.update({
      where: { id: purchaseId },
      data: {
        status: CreditPurchaseStatus.FAILED,
        failedAt: new Date(),
        errorMessage: 'Payment failed via Stripe webhook',
        paymentId: paymentIntent.id,
      }
    })
    
    return {
      processed: true,
      message: `Payment failed for user ${userId}, purchase ${purchaseId}`
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
    return {
      processed: false,
      message: `Failed to handle payment failure: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<{
  processed: boolean
  message: string
}> {
  const { purchaseId, userId } = paymentIntent.metadata
  
  if (!purchaseId || !userId) {
    return {
      processed: false,
      message: 'Missing required metadata in payment intent'
    }
  }
  
  try {
    // Import here to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma')
    const { CreditPurchaseStatus } = await import('@prisma/client')
    
    // Update purchase status to cancelled
    await prisma.creditPurchase.update({
      where: { id: purchaseId },
      data: {
        status: CreditPurchaseStatus.CANCELLED,
        paymentId: paymentIntent.id,
      }
    })
    
    return {
      processed: true,
      message: `Payment canceled for user ${userId}, purchase ${purchaseId}`
    }
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
    return {
      processed: false,
      message: `Failed to handle payment cancellation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get Stripe publishable key for frontend
 */
export function getStripePublishableKey(): string {
  const key = process.env.STRIPE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is not set')
  }
  return key
}

/**
 * Format amount for Stripe (convert dollars to cents)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format amount from Stripe (convert cents to dollars)
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}

/**
 * Validate Stripe configuration
 */
export function validateStripeConfig(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY environment variable is not set')
  }
  
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    errors.push('STRIPE_PUBLISHABLE_KEY environment variable is not set')
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    errors.push('STRIPE_WEBHOOK_SECRET environment variable is not set')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Export the stripe instance for advanced usage
export { stripe }
