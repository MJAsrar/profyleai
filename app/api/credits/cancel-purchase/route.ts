import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreditPurchaseStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'Missing purchase ID' }, { status: 400 })
    }

    // Find the purchase and verify it belongs to the current user
    const purchase = await prisma.creditPurchase.findFirst({
      where: {
        id: purchaseId,
        userId: session.user.id,
        status: CreditPurchaseStatus.PENDING
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found or already processed' }, { status: 404 })
    }

    // Update the purchase status to cancelled
    await prisma.creditPurchase.update({
      where: { id: purchaseId },
      data: {
        status: CreditPurchaseStatus.CANCELLED,
        errorMessage: 'User cancelled checkout'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Purchase cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling purchase:', error)
    return NextResponse.json(
      { error: 'Failed to cancel purchase' },
      { status: 500 }
    )
  }
}
