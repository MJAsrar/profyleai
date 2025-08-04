import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { optimizeContentWithGemini, type OptimizeContentRequest } from "@/lib/services/gemini-service"
import { z } from "zod"

// Validation schema for the request
const optimizeContentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  contentType: z.enum(['summary', 'experience', 'project', 'certification'], {
    errorMap: () => ({ message: "Content type must be one of: summary, experience, project, certification" })
  }),
  context: z.object({
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    position: z.string().optional(),
    projectName: z.string().optional(),
    certificationName: z.string().optional()
  }).optional()
})

/**
 * POST /api/optimize-content - Optimize individual content pieces using AI
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    // Parse and validate request body
    let requestBody: any
    try {
      requestBody = await req.json()
    } catch (error) {
      return NextResponse.json(
        { 
          error: "Invalid JSON in request body",
          code: "INVALID_JSON"
        },
        { status: 400 }
      )
    }

    // Validate request data
    const validationResult = optimizeContentSchema.safeParse(requestBody)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: errors,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    const optimizeRequest: OptimizeContentRequest = validationResult.data

    console.log(`📝 Optimizing ${optimizeRequest.contentType} content for user ${user.id}`)
    console.log(`📄 Content length: ${optimizeRequest.content.length} characters`)

    // Call Gemini API to optimize the content
    const optimizationResult = await optimizeContentWithGemini(optimizeRequest)

    if (!optimizationResult.success || !optimizationResult.data) {
      console.error('❌ Content optimization failed:', optimizationResult.error)
      return NextResponse.json(
        { 
          error: optimizationResult.error || "Failed to optimize content",
          code: "OPTIMIZATION_FAILED"
        },
        { status: 500 }
      )
    }

    console.log(`✅ Content optimization successful (${optimizationResult.data.wordCount} words)`)
    console.log(`📈 Improvements: ${optimizationResult.data.improvements.join(', ')}`)

    return NextResponse.json({
      success: true,
      data: optimizationResult.data
    })

  } catch (error) {
    console.error('❌ Error in optimize-content API:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('AUTH')) {
        return createAuthError()
      }
    }

    return NextResponse.json(
      { 
        error: "Internal server error. Please try again.",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}