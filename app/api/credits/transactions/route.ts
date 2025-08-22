/**
 * Credit Transactions API
 * 
 * GET /api/credits/transactions - Get user's credit transaction history
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { creditService } from "@/lib/services/credit-service"
import { CreditErrorType } from "@/lib/types/credits"

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)
    const type = searchParams.get('type') // Optional filter by transaction type

    // Get transaction history
    let transactions
    if (type) {
      // Validate transaction type
      const validTypes = [
        'EARNED_SIGNUP', 'EARNED_EMAIL_VERIFICATION', 'EARNED_REFERRAL', 
        'EARNED_PURCHASE', 'EARNED_ADMIN', 'EARNED_PROMOTION',
        'SPENT_VIDEO_INTERVIEW', 'SPENT_TEXT_INTERVIEW', 'SPENT_RESUME_BUILDER', 
        'SPENT_RESUME_TAILORING', 'SPENT_COVER_LETTER',
        'REFUND_RESUME_DELETE', 'REFUND_FAILED_OPERATION', 'REFUND_ADMIN'
      ]
      
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: "Invalid transaction type" },
          { status: 400 }
        )
      }
      
      transactions = await creditService.getTransactionsByType(
        session.user.id,
        type as any,
        limit
      )
    } else {
      transactions = await creditService.getTransactionHistory(
        session.user.id,
        limit,
        offset
      )
    }

    // Calculate summary statistics
    const totalEarned = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const totalSpent = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalTransactions: transactions.length,
          totalEarned,
          totalSpent,
          netChange: totalEarned - totalSpent,
        },
        pagination: {
          limit,
          offset,
          hasMore: transactions.length === limit, // Simple check
        }
      }
    })

  } catch (error) {
    console.error("Error getting credit transactions:", error)
    
    // Handle specific credit errors
    if (error && typeof error === 'object' && 'type' in error) {
      const creditError = error as { type: CreditErrorType; message: string }
      
      if (creditError.type === CreditErrorType.USER_NOT_FOUND) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to get credit transactions" },
      { status: 500 }
    )
  }
}
