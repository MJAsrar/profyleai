import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { generateCoverLetterWithGemini, type CoverLetterJobData, type CoverLetterPersonalInfo, type CoverLetterTone } from "@/lib/services/gemini-service"
import { withCreditCheck } from "@/lib/middleware/credit-middleware"
import { z } from "zod"

// Validation schema for the request
const coverLetterRequestSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  hiringManager: z.string().optional(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  personalInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  tone: z.enum(['professional', 'enthusiastic', 'creative', 'formal', 'conversational', 'confident', 'warm', 'analytical'])
})

/**
 * POST /api/cover-letter-generation - Generate a cover letter using AI
 */
export const POST = withCreditCheck('COVER_LETTER')(async (req, context) => {
  try {
    // Get user from middleware context
    const user = req.user
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = coverLetterRequestSchema.parse(body)

    const jobData: CoverLetterJobData = {
      jobTitle: validatedData.jobTitle,
      companyName: validatedData.companyName,
      hiringManager: validatedData.hiringManager || null,
      jobDescription: validatedData.jobDescription,
    }

    console.log(`💌 Starting cover letter generation for user ${user.id} - ${jobData.jobTitle} at ${jobData.companyName}`)

    // Call Gemini API to generate the cover letter
    const generationResult = await generateCoverLetterWithGemini(
      jobData,
      validatedData.personalInfo,
      validatedData.tone as CoverLetterTone
    )

    if (!generationResult.success || !generationResult.data) {
      console.error('❌ Cover letter generation failed:', generationResult.error)
      return NextResponse.json(
        { 
          error: generationResult.error || "Failed to generate cover letter",
          code: "GENERATION_FAILED"
        },
        { status: 500 }
      )
    }

    console.log(`✅ Cover letter generation successful with ${generationResult.data.matchScore}% match score`)

    return NextResponse.json({
      success: true,
      data: generationResult.data
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.errors,
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      )
    }

    console.error("❌ POST /api/cover-letter-generation error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error. Please try again.",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
})