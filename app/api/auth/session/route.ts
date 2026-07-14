import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateApiToken } from "@/lib/auth-utils"

/**
 * GET /api/auth/session - Report the current web session to the extension and,
 * when logged in, mint a real opaque API token for it to use as a Bearer credential.
 * Never returns the user id as a token.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      // Only mint a new token if the user doesn't already have a valid one,
      // so repeated polls don't rotate (and invalidate) the extension's token.
      const current = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { apiTokenExpiresAt: true },
      })
      const hasValidToken =
        !!current?.apiTokenExpiresAt && current.apiTokenExpiresAt.getTime() > Date.now()

      let token: string | undefined
      let expiresAt: Date | undefined
      if (!hasValidToken) {
        const minted = generateApiToken()
        token = minted.raw
        expiresAt = minted.expiresAt
        await prisma.user.update({
          where: { id: session.user.id },
          data: { apiTokenHash: minted.hash, apiTokenExpiresAt: minted.expiresAt },
        })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        },
        // Present only when freshly minted; the extension persists it on first receipt.
        token,
        expiresAt: expiresAt?.toISOString(),
        hasValidToken,
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