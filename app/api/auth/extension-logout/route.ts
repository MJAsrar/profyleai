import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/auth/extension-logout - Revoke the caller's extension API token.
 * Identifies the user from their own credential (Bearer token or session) and
 * clears the stored token hash so it can no longer authenticate. Idempotent.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { apiTokenHash: null, apiTokenExpiresAt: null },
      })
    }

    // Always succeed: logging out an unknown/expired token is a no-op.
    return NextResponse.json({
      success: true,
      message: "Extension token revoked",
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