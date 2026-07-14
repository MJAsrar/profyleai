import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCheckoutSession } from '@/lib/services/stripe-service'
import { creditService } from '@/lib/services/credit-service'
import { prisma } from '@/lib/prisma'
import { CREDIT_PACKAGES, isCreditPackageId, CreditErrorType } from '@/lib/types/credits'

/**
 * GET /api/credits/verify-purchase?session_id=...
 *
 * Confirms a checkout and — critically — acts as an idempotent FALLBACK GRANT.
 *
 * The Stripe webhook is the primary path that adds credits, but webhooks are
 * best-effort: if delivery is delayed or the handler fails, the customer has paid and
 * has nothing. This route completes a still-PENDING purchase itself, guarded by the
 * same PENDING->COMPLETED compare-and-swap the webhook uses, so the two can race
 * safely and never double-credit.
 *
 * It reports the REAL granted state, so the UI can stop claiming credits were added
 * before they actually were.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    // Get the checkout session from Stripe
    const checkoutSession = await getCheckoutSession(sessionId)

    if (!checkoutSession || checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Invalid or unpaid session' }, { status: 400 })
    }

    // Verify this session belongs to the current user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const packageId = checkoutSession.metadata?.packageId
    if (!packageId || !isCreditPackageId(packageId)) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 })
    }

    const creditPackage = CREDIT_PACKAGES[packageId]
    const purchaseId = checkoutSession.metadata?.purchaseId

    // Fallback grant: if the webhook has not completed this purchase yet, do it here.
    let creditsGranted = false
    if (purchaseId) {
      const purchase = await prisma.creditPurchase.findUnique({
        where: { id: purchaseId },
        select: { status: true },
      })

      if (purchase?.status === 'COMPLETED') {
        creditsGranted = true
      } else if (purchase?.status === 'PENDING') {
        try {
          await creditService.completeCreditPurchase(purchaseId, checkoutSession.id)
          creditsGranted = true
        } catch (error) {
          // The webhook may have won the race between our read and our write. That is
          // success, not failure.
          const err = error as { type?: string; details?: { originalError?: { type?: string } } }
          const errType = err?.type ?? err?.details?.originalError?.type
          if (errType === CreditErrorType.DUPLICATE_TRANSACTION) {
            creditsGranted = true
          } else {
            console.error('Fallback credit grant failed:', error)
          }
        }
      }
    }

    const balance = await creditService.getCreditBalance(session.user.id)

    return NextResponse.json({
      success: true,
      data: {
        credits: creditPackage.credits,
        amount: creditPackage.price,
        packageName: creditPackage.name,
        sessionId: checkoutSession.id,
        paymentStatus: checkoutSession.payment_status,
        // The truth the UI should render, instead of assuming success.
        creditsGranted,
        balance,
      }
    })

  } catch (error) {
    console.error('Error verifying purchase:', error)
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    )
  }
}
