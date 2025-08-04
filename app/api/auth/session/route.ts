import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/auth/session - Get current session for extension
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session && session.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        },
        token: session.user.id // Using user ID as token for simplicity
      })
    }
    
    return NextResponse.json(
      { success: false, needsAuth: true },
      { status: 401 }
    )
  } catch (error) {
    console.error("[Auth] Session check error:", error)
    return NextResponse.json(
      { success: false, error: "Session check failed" },
      { status: 500 }
    )
  }
}