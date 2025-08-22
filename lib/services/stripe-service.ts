/**
 * Stripe Service
 * 
 * This service handles all Stripe payment processing for credit purchases.
 * It integrates with our credit system to provide seamless payment experiences.
 */

import Stripe from 'stripe'
import { CREDIT_PACKAGES, CreditPackageId, isCreditPackageId } from '@/lib/types/credits'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
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
      
      // Create price
      const price = await stripe.prices.create({
        id: `price_${packageId}`,
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
export async function processWebhookEvent(event: Stripe.Event): Promise<{
  processed: boolean
  message: string
}> {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
      
      case 'payment_intent.payment_failed':
        return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
      
      case 'payment_intent.canceled':
        return await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
      
      default:
        return {
          processed: false,
          message: `Unhandled event type: ${event.type}`
        }
    }
  } catch (error) {
    console.error('Error processing webhook event:', error)
    return {
      processed: false,
      message: `Error processing event: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// =============================================================================
// WEBHOOK EVENT HANDLERS
// =============================================================================

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<{
  processed: boolean
  message: string
}> {
  const { purchaseId, userId, packageId, credits } = paymentIntent.metadata
  
  if (!purchaseId || !userId || !packageId || !credits) {
    return {
      processed: false,
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
    console.error('Error completing credit purchase:', error)
    return {
      processed: false,
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
