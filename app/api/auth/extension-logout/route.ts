import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * POST /api/auth/extension-logout - Notify that user has logged out
 * This endpoint allows the web app to signal that a user has logged out
 * so the extension can clear its stored session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    // We don't need to validate session here since we're logging out
    // Just return success to indicate the logout was acknowledged
    console.log(`[Auth] Extension logout signal received for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: "Logout signal received"
    })
  } catch (error) {
    console.error("[Auth] Extension logout error:", error)
    return NextResponse.json(
      { success: false, error: "Logout signal failed" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/extension-logout - Check if user should be logged out
 * Extension can poll this endpoint to check if the user has been logged out
 * from the web app. We'll use a simple timestamp-based approach.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session && session.user) {
      // User is still logged in
      return NextResponse.json({
        success: true,
        loggedIn: true,
        userId: session.user.id
      })
    } else {
      // User is not logged in
      return NextResponse.json({
        success: true,
        loggedIn: false
      })
    }
  } catch (error) {
    console.error("[Auth] Extension logout check error:", error)
    return NextResponse.json(
      { success: false, error: "Logout check failed" },
      { status: 500 }
    )
  }
}