import { NextRequest, NextResponse } from "next/server"
import { signIn, getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * POST /api/auth/extension-login - Handle extension-specific login
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, sessionToken } = body

    // If sessionToken provided, validate existing session
    if (sessionToken) {
      const user = await prisma.user.findUnique({
        where: { id: sessionToken }
      })
      
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          },
          token: user.id
        })
      }
    }

    // If credentials provided, authenticate
    if (email && password) {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        )
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: user.id
      })
    }

    return NextResponse.json(
      { success: false, error: "Missing credentials" },
      { status: 400 }
    )

  } catch (error) {
    console.error("[Auth] Extension login error:", error)
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    )
  }
}