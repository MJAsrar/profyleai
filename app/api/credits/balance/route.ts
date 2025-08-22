/**
 * Credit Balance API
 * 
 * GET /api/credits/balance - Get user's current credit balance and summary
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

    // Get credit summary
    const summary = await creditService.getCreditSummary(session.user.id)

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error("Error getting credit balance:", error)
    
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
      { error: "Failed to get credit balance" },
      { status: 500 }
    )
  }
}
