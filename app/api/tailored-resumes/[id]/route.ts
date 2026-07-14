import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"

/**
 * GET /api/tailored-resumes/[id] - Get a specific tailored resume by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id: tailoredResumeId } = await params

    console.log(`📋 Fetching tailored resume ${tailoredResumeId} for user ${user.id}`)

    // Get the specific tailored resume
    const tailoredResume = await prisma.tailoredResume.findFirst({
      where: {
        id: tailoredResumeId,
        userId: user.id // Ensure user owns this resume
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewUrl: true,
            cssData: true
          }
        },
        baseResume: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (!tailoredResume) {
      return NextResponse.json(
        { error: "Tailored resume not found" },
        { status: 404 }
      )
    }

    console.log(`✅ Found tailored resume: ${tailoredResume.title}`)

    return NextResponse.json({
      success: true,
      tailoredResume: tailoredResume
    })

  } catch (error) {
    console.error("❌ GET /api/tailored-resumes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tailored resume" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tailored-resumes/[id] - Delete a specific tailored resume
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id: tailoredResumeId } = await params

    console.log(`🗑️ Deleting tailored resume ${tailoredResumeId} for user ${user.id}`)

    // Delete the tailored resume (only if user owns it)
    const deletedResume = await prisma.tailoredResume.deleteMany({
      where: {
        id: tailoredResumeId,
        userId: user.id
      }
    })

    if (deletedResume.count === 0) {
      return NextResponse.json(
        { error: "Tailored resume not found" },
        { status: 404 }
      )
    }

    console.log(`✅ Tailored resume deleted successfully`)

    return NextResponse.json({
      success: true,
      message: "Tailored resume deleted successfully"
    })

  } catch (error) {
    console.error("❌ DELETE /api/tailored-resumes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete tailored resume" },
      { status: 500 }
    )
  }
}