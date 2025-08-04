import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { tailorResumeWithGemini, applyTailoredContent, type JobData } from "@/lib/services/gemini-service"
import { z } from "zod"

// Validation schema for the request
const tailoringRequestSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  companyName: z.string().min(1, "Company name is required"),
  baseResumeId: z.string().optional(), // Optional - if not provided, use most recent resume
})

/**
 * POST /api/resume-tailoring - Tailor resume for a specific job posting
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = tailoringRequestSchema.parse(body)

    const jobData: JobData = {
      jobTitle: validatedData.jobTitle,
      jobDescription: validatedData.jobDescription,
      companyName: validatedData.companyName,
    }

    console.log(`🎯 Starting resume tailoring for user ${user.id} - ${jobData.jobTitle} at ${jobData.companyName}`)
    
    // Determine which resume to use as base
    let currentResume;
    if (validatedData.baseResumeId) {
      console.log(`📄 Using specified base resume: ${validatedData.baseResumeId}`)
      
      // Get the specific resume requested
      currentResume = await prisma.resume.findFirst({
        where: {
          id: validatedData.baseResumeId,
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
          }
        }
      })
      
      if (!currentResume) {
        return NextResponse.json(
          { 
            error: "Selected resume not found or you don't have permission to access it.",
            code: "RESUME_NOT_FOUND"
          },
          { status: 404 }
        )
      }
    } else {
      console.log(`📄 Using most recent resume as base`)
      
      // Get user's most recent resume
      currentResume = await prisma.resume.findFirst({
        where: {
          userId: user.id
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
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
    }

    if (!currentResume) {
      return NextResponse.json(
        { 
          error: "No resume found. Please create a resume first.",
          code: "NO_RESUME"
        },
        { status: 404 }
      )
    }

    console.log(`📄 Found resume: ${currentResume.title} (ID: ${currentResume.id})`)

    // Convert Prisma's JsonValue types to proper TypeScript types for processing
    const resumeForTailoring = {
      ...currentResume,
      summary: currentResume.summary || "", // Convert null to empty string
      personalInfo: currentResume.personalInfo as any,
      experience: currentResume.experience as any,
      education: currentResume.education as any,
      skills: currentResume.skills as any,
      projects: currentResume.projects as any,
      certifications: currentResume.certifications as any
    }

    // Call Gemini API to tailor the resume
    const tailoringResult = await tailorResumeWithGemini(resumeForTailoring, jobData)

    if (!tailoringResult.success || !tailoringResult.data) {
      console.error('❌ Tailoring failed:', tailoringResult.error)
      return NextResponse.json(
        { 
          error: tailoringResult.error || "Failed to tailor resume",
          code: "TAILORING_FAILED"
        },
        { status: 500 }
      )
    }

    console.log(`✅ Tailoring successful with ${tailoringResult.data.matchScore}% match score`)

    // Apply tailored content to get the resume data
    const tailoredResumeData = applyTailoredContent(resumeForTailoring, tailoringResult.data, jobData)
    
    // Debug: Log what projects are being saved
    console.log('💾 About to save tailored projects:', {
      projectsCount: tailoredResumeData.projects.length,
      projects: tailoredResumeData.projects.map((p, i) => ({ 
        index: i + 1, 
        id: p.id, 
        name: p.name,
        description: p.description?.substring(0, 100) + '...' 
      }))
    })

    // Create a new TailoredResume record instead of updating the existing Resume
    const tailoredResume = await prisma.tailoredResume.create({
      data: {
        userId: user.id,
        baseResumeId: currentResume.id,
        templateId: currentResume.templateId,
        title: `${jobData.jobTitle} at ${jobData.companyName}`,
        
        // Job details
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        jobDescription: jobData.jobDescription,
        
        // Tailored resume content
        personalInfo: tailoredResumeData.personalInfo,
        summary: tailoredResumeData.summary,
        experience: tailoredResumeData.experience,
        education: tailoredResumeData.education,
        skills: tailoredResumeData.skills,
        projects: tailoredResumeData.projects,
        certifications: tailoredResumeData.certifications,
        
        // Enhanced tailoring metadata
        tailoringMetadata: {
          tailoredFor: {
            jobTitle: jobData.jobTitle,
            companyName: jobData.companyName,
            tailoredAt: new Date().toISOString()
          },
          matchScore: tailoringResult.data.matchScore,
          tailoringNotes: tailoringResult.data.tailoringNotes,
          atsBreakdown: tailoringResult.data.atsBreakdown,
          detailedChanges: tailoringResult.data.detailedChanges,
          keywordAnalysis: tailoringResult.data.keywordAnalysis
        },
        matchScore: tailoringResult.data.matchScore
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

    console.log(`💾 New tailored resume created successfully: ${tailoredResume.id}`)

    // Return the tailored resume with enhanced metadata
    return NextResponse.json({
      success: true,
      tailoredResume: tailoredResume,
      tailoring: {
        matchScore: tailoringResult.data.matchScore,
        tailoringNotes: tailoringResult.data.tailoringNotes,
        atsBreakdown: tailoringResult.data.atsBreakdown,
        detailedChanges: tailoringResult.data.detailedChanges,
        keywordAnalysis: tailoringResult.data.keywordAnalysis,
        jobData: jobData,
        tailoredAt: new Date().toISOString(),
        changesCount: [
          tailoringResult.data.experience.length,
          tailoringResult.data.skills.length,
          tailoringResult.data.projects?.length || 0,
          1 // summary
        ].reduce((a, b) => a + b, 0)
      },
      message: "Resume successfully tailored and saved as new version"
    })

  } catch (error) {
    console.error("❌ POST /api/resume-tailoring error:", error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { 
            error: "Resume not found",
            code: "RESUME_NOT_FOUND"
          },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/resume-tailoring - Get tailoring history and current status
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    // Get user's current resume with tailoring metadata
    const currentResume = await prisma.resume.findFirst({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        title: true,
        tailoringMetadata: true,
        originalContent: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!currentResume) {
      return NextResponse.json({
        hasTailoredResume: false,
        message: "No resume found"
      })
    }

    const hasTailoring = !!(currentResume.tailoringMetadata as any)?.tailoredFor
    
    return NextResponse.json({
      hasTailoredResume: hasTailoring,
      currentTailoring: hasTailoring ? (currentResume.tailoringMetadata as any)?.tailoredFor : null,
      matchScore: hasTailoring ? (currentResume.tailoringMetadata as any)?.matchScore : null,
      canRevert: !!currentResume.originalContent,
      lastUpdated: currentResume.updatedAt,
      tailoringHistory: (currentResume.tailoringMetadata as any)?.previousTailorings || []
    })

  } catch (error) {
    console.error("❌ GET /api/resume-tailoring error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tailoring status" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/resume-tailoring - Revert resume to original content
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    // Get user's current resume
    const currentResume = await prisma.resume.findFirst({
      where: {
        userId: user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!currentResume) {
      return NextResponse.json(
        { error: "No resume found" },
        { status: 404 }
      )
    }

    if (!currentResume.originalContent) {
      return NextResponse.json(
        { error: "No original content to revert to" },
        { status: 400 }
      )
    }

    console.log(`🔄 Reverting resume ${currentResume.id} to original content`)

    // Restore original content
    const originalContent = currentResume.originalContent as any
    const updatedResume = await prisma.resume.update({
      where: { id: currentResume.id },
      data: {
        summary: originalContent.summary,
        experience: originalContent.experience,
        skills: originalContent.skills,
        projects: originalContent.projects,
        originalContent: null, // Remove the backup since we've reverted
        tailoringMetadata: null, // Clear tailoring metadata
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
        }
      }
    })

    console.log(`✅ Resume reverted successfully: ${updatedResume.id}`)

    return NextResponse.json({
      success: true,
      resume: updatedResume,
      message: "Resume reverted to original content"
    })

  } catch (error) {
    console.error("❌ DELETE /api/resume-tailoring error:", error)
    return NextResponse.json(
      { error: "Failed to revert resume" },
      { status: 500 }
    )
  }
}