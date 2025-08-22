import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCheckoutSession } from '@/lib/services/stripe-service'
import { CREDIT_PACKAGES, isCreditPackageId } from '@/lib/types/credits'

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

    return NextResponse.json({
      success: true,
      data: {
        credits: creditPackage.credits,
        amount: creditPackage.price,
        packageName: creditPackage.name,
        sessionId: checkoutSession.id,
        paymentStatus: checkoutSession.payment_status,
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
