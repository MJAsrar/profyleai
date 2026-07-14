import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateApiToken } from "@/lib/auth-utils"
import bcrypt from "bcryptjs"

/**
 * POST /api/auth/extension-login - Authenticate the browser extension.
 *
 * Requires email + password. On success it mints an opaque, random, expiring
 * API token (only its hash is stored) and returns the raw token for the
 * extension to send as `Authorization: Bearer <token>`.
 *
 * The previous passwordless `sessionToken` branch (which logged in as any user
 * by id and returned `user.id` as a permanent credential) has been removed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Same generic error whether the user exists or the password is wrong,
    // so this endpoint does not reveal which emails are registered.
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const { raw, hash, expiresAt } = generateApiToken()
    await prisma.user.update({
      where: { id: user.id },
      data: { apiTokenHash: hash, apiTokenExpiresAt: expiresAt },
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token: raw,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("[Auth] Extension login error:", error)
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    )
  }
}