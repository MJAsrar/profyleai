import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError, checkResourceOwnership, createOwnershipError } from "@/lib/auth-utils"
import { updateResumeSchema } from "@/lib/validations/resume"
import { z } from "zod"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/resumes/[id] - Get specific resume
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id } = await params

    // Fetch resume with template information
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewUrl: true,
            cssData: true
          }
        }
      }
    })

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    // Check ownership (user can only access their own resumes)
    if (!checkResourceOwnership(resume.userId, user.id)) {
      return createOwnershipError()
    }

    return NextResponse.json({ resume })
  } catch (error) {
    console.error("GET /api/resumes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/resumes/[id] - Update resume
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id } = await params

    // Check if resume exists and user owns it
    const existingResume = await prisma.resume.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingResume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    if (!checkResourceOwnership(existingResume.userId, user.id)) {
      return createOwnershipError()
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = updateResumeSchema.parse({ ...body, id })

    // If templateId is being updated, verify it exists and is active
    if (validatedData.templateId) {
      const template = await prisma.template.findUnique({
        where: { 
          id: validatedData.templateId,
          isActive: true
        }
      })

      if (!template) {
        return NextResponse.json(
          { error: "Template not found or inactive" },
          { status: 400 }
        )
      }
    }

    // Prepare update data (exclude id and undefined values)
    const { id: _, ...updateData } = validatedData
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    // Update resume
    const updatedResume = await prisma.resume.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      resume: updatedResume,
      message: "Resume updated successfully"
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error("PUT /api/resumes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/resumes/[id] - Delete resume
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id } = await params

    // Check if resume exists and user owns it
    const existingResume = await prisma.resume.findUnique({
      where: { id },
      select: { 
        userId: true,
        title: true
      }
    })

    if (!existingResume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    if (!checkResourceOwnership(existingResume.userId, user.id)) {
      return createOwnershipError()
    }

    // Delete resume
    await prisma.resume.delete({
      where: { id }
    })

    return NextResponse.json({
      message: `Resume "${existingResume.title}" deleted successfully`
    })
  } catch (error) {
    console.error("DELETE /api/resumes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    )
  }
}