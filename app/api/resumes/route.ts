import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { createResumeSchema } from "@/lib/validations/resume"
import { withCreditCheck } from "@/lib/middleware/credit-middleware"
import { z } from "zod"

/**
 * GET /api/resumes - Get all resumes for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    console.log(`📋 Fetching all resumes for user ${user.id}`)

    // Get all resumes for the user
    const resumes = await prisma.resume.findMany({
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
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log(`✅ Found ${resumes.length} resumes`)

    return NextResponse.json({
      success: true,
      data: resumes
    })

  } catch (error) {
    console.error("❌ GET /api/resumes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/resumes - Create a new resume
 */
export const POST = withCreditCheck('RESUME_BUILDER')(async (req, context) => {
  try {
    // Get user from middleware context  
    const user = req.user
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log(`📝 Creating new resume for user ${user.id}`)

    // Parse and validate request body
    const body = await req.json()
    const validatedData = createResumeSchema.parse(body)

    // Verify template exists and is active
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

    // Create resume
    const newResume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        templateId: validatedData.templateId!,
        personalInfo: validatedData.personalInfo,
        summary: validatedData.summary || "",
        experience: validatedData.experience,
        education: validatedData.education,
        skills: validatedData.skills,
        projects: validatedData.projects,
        certifications: validatedData.certifications,
        isPublic: validatedData.isPublic
      },
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

    console.log(`✅ Resume created successfully: ${newResume.id}`)

    return NextResponse.json({
      resume: newResume,
      message: "Resume created successfully"
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

    console.error("❌ POST /api/resumes error:", error)
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    )
  }
})