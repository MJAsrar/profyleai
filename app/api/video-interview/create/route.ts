import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitKey, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema
const createVideoInterviewSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  companyName: z.string().min(1, 'Company name is required'),
  jobDescription: z.string().optional(),
  interviewPrepId: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    category: z.enum(['job-specific', 'field-related', 'behavioral']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    starFramework: z.object({
      situation: z.string(),
      task: z.string(),
      action: z.string(),
      result: z.string()
    }),
    tips: z.array(z.string()),
    keywords: z.array(z.string())
  })),
  aiPersonality: z.enum(['professional', 'friendly', 'challenging']).default('professional'),
  type: z.enum(['practice', 'mock', 'assessment']).default('practice')
})

/**
 * POST /api/video-interview/create
 *
 * Creates the interview record only. Credits are NOT charged here — they are charged
 * when the realtime session token is issued (see [sessionId]/token), so a session the
 * user never actually starts is never billed.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    // Creating records is free now, so bound it to stop record spam.
    const limit = rateLimit(rateLimitKey(request, 'vi-create', user.id), 20, 60_000)
    if (!limit.ok) {
      return rateLimitResponse(limit) as NextResponse
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = createVideoInterviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const {
      jobTitle,
      companyName,
      jobDescription,
      interviewPrepId,
      questions,
      aiPersonality,
      type
    } = validationResult.data

    // Generate unique session ID
    const sessionId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create title
    const title = `Video Interview - ${jobTitle} at ${companyName}`

    console.log('🎥 Creating video interview session:', sessionId)

    // Create video interview record
    const videoInterview = await prisma.videoInterview.create({
      data: {
        sessionId,
        title,
        status: 'scheduled',
        type,
        userId: user.id,
        interviewPrepId: interviewPrepId || null,
        jobTitle,
        companyName,
        jobDescription: jobDescription || null,
        questions: questions,
        currentQuestionIndex: 0,
        aiPersonality,
        recordingStatus: 'none'
      }
    })

    console.log('✅ Video interview created successfully:', videoInterview.id)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: videoInterview.sessionId,
        interviewId: videoInterview.id,
        title: videoInterview.title,
        status: videoInterview.status,
        questions: questions,
        aiPersonality: videoInterview.aiPersonality,
        createdAt: videoInterview.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Error creating video interview:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create video interview session'
      },
      { status: 500 }
    )
  }
}
