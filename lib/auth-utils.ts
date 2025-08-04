import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

/**
 * Get authenticated user from server session or Bearer token
 * Returns null if user is not authenticated
 */
export async function getAuthenticatedUser(req: NextRequest) {
  try {
    // First try Bearer token authentication (for extension)
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      // Look up user by ID (token is user ID in our implementation)
      const user = await prisma.user.findUnique({
        where: { id: token },
        select: {
          id: true,
          email: true,
          name: true
        }
      })
      
      if (user) {
        return user
      }
    }
    
    // Fallback to session-based auth (for web app)
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