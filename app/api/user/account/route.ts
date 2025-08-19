import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accountData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        subscriptionTier: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          }
        },
        _count: {
          select: {
            resumes: true,
            coverLetters: true,
            interviewPreps: true,
          }
        }
      }
    })

    if (!accountData) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(accountData)
  } catch (error) {
    console.error("Error fetching account data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
