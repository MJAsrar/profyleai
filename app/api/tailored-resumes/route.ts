import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"

/**
 * GET /api/tailored-resumes - Get all tailored resumes for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    console.log(`📋 Fetching tailored resumes for user ${user.id}`)

    // Get all tailored resumes for the user
    const tailoredResumes = await prisma.tailoredResume.findMany({
      where: {
        userId: user.id
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewUrl: true
          }
        },
        baseResume: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${tailoredResumes.length} tailored resumes`)

    return NextResponse.json({
      success: true,
      data: tailoredResumes
    })

  } catch (error) {
    console.error("❌ GET /api/tailored-resumes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tailored resumes" },
      { status: 500 }
    )
  }
}