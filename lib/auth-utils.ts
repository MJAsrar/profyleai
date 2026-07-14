import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

// Re-export the pure token helpers so existing imports from "@/lib/auth-utils" keep working.
export { generateApiToken, hashApiToken, API_TOKEN_TTL_MS } from "./api-token"
import { hashApiToken } from "./api-token"

/**
 * Get authenticated user from the server session or a Bearer API token.
 * Returns null if the user is not authenticated.
 *
 * SECURITY: the Bearer token is an opaque random secret looked up by its hash,
 * NOT the user id. Presenting another user's id no longer authenticates as them.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  try {
    // Bearer token authentication (for the browser extension)
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim()

      // Reject anything that looks like a bare Mongo ObjectId (legacy id-as-token) early.
      if (token.length >= 40) {
        const user = await prisma.user.findFirst({
          where: { apiTokenHash: hashApiToken(token) },
          select: { id: true, email: true, name: true, apiTokenExpiresAt: true },
        })

        if (user && user.apiTokenExpiresAt && user.apiTokenExpiresAt.getTime() > Date.now()) {
          return { id: user.id, email: user.email, name: user.name }
        }
      }
      // Invalid/expired token → fall through to session (do NOT trust the raw value).
    }

    // Session-based auth (for the web app)
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

/**
 * Check if user is authenticated and return formatted error response if not
 */
export function createAuthError() {
  return Response.json(
    { error: "Authentication required" },
    { status: 401 }
  )
}

/**
 * Check if user owns the resource (has matching userId)
 */
export function checkResourceOwnership(resourceUserId: string, authenticatedUserId: string) {
  return resourceUserId === authenticatedUserId
}

/**
 * Create ownership error response
 */
export function createOwnershipError() {
  return Response.json(
    { error: "Access denied: You don't own this resource" },
    { status: 403 }
  )
}