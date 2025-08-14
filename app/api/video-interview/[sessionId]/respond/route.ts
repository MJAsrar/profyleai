import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { createVideoInterviewService } from '@/lib/services/video-interview-service'
import { PracticeQuestion } from '@/lib/services/interview-service'
import { z } from 'zod'

interface RouteParams {
  params: {
    sessionId: string
  }
}

const respondSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required'),
  questionId: z.string().min(1, 'Question ID is required'),
  responseStartTime: z.number().optional(),
  responseEndTime: z.number().optional()
})

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = params
    const body = await request.json()

    // Validate request body
    const validationResult = respondSchema.safeParse(body)
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

    const { transcript, questionId, responseStartTime, responseEndTime } = validationResult.data

    // Get video interview session
    const videoInterview = await prisma.videoInterview.findFirst({
      where: {
        sessionId,
        userId: user.id
      }
    })

    if (!videoInterview) {
      return NextResponse.json(
        { success: false, error: 'Video interview session not found' },
        { status: 404 }
      )
    }

    if (videoInterview.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Interview session is not active' },
        { status: 400 }
      )
    }

    // Get current question
    const questions = videoInterview.questions as PracticeQuestion[]
    const currentQuestion = questions.find(q => q.id === questionId)
    
    if (!currentQuestion) {
      return NextResponse.json(
        { success: false, error: 'Question not found in session' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating AI response for question:', currentQuestion.question)

    // Create video interview service
    const videoInterviewService = createVideoInterviewService()

    // Generate AI response
    const aiResponse = await videoInterviewService.generateInterviewResponse(
      sessionId,
      transcript,
      currentQuestion
    )

    // Generate speech audio
    const audioBuffer = await videoInterviewService.generateSpeech(aiResponse.text)

    // Convert audio buffer to base64 for JSON response
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    console.log('✅ AI response generated:', aiResponse.text)

    // Store the response in database
    const videoResponse = await prisma.videoInterviewResponse.create({
      data: {
        videoInterviewId: videoInterview.id,
        questionId: questionId,
        questionText: currentQuestion.question,
        questionOrder: videoInterview.currentQuestionIndex,
        responseText: transcript,
        questionStartTime: responseStartTime || 0,
        responseStartTime: responseStartTime,
        responseEndTime: responseEndTime,
        thinkingTime: responseStartTime ? responseStartTime - (responseStartTime || 0) : null,
        responseTime: responseEndTime && responseStartTime ? responseEndTime - responseStartTime : null
      }
    })

    // Update interview progress
    let shouldMoveToNext = aiResponse.nextAction === 'next_question'
    let newQuestionIndex = videoInterview.currentQuestionIndex

    if (shouldMoveToNext && newQuestionIndex < questions.length - 1) {
      newQuestionIndex += 1
    } else if (aiResponse.nextAction === 'conclude') {
      // Mark as completed if concluding
      await prisma.videoInterview.update({
        where: { id: videoInterview.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          lastActivity: new Date()
        }
      })
    }

    // Update current question index if needed
    if (newQuestionIndex !== videoInterview.currentQuestionIndex) {
      await prisma.videoInterview.update({
        where: { id: videoInterview.id },
        data: {
          currentQuestionIndex: newQuestionIndex,
          lastActivity: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        aiResponse: {
          text: aiResponse.text,
          emotion: aiResponse.emotion,
          followUpType: aiResponse.followUpType,
          shouldTransition: aiResponse.shouldTransition,
          nextAction: aiResponse.nextAction
        },
        audioBase64: audioBase64,
        responseId: videoResponse.id,
        nextQuestionIndex: newQuestionIndex,
        nextQuestion: newQuestionIndex < questions.length ? questions[newQuestionIndex] : null,
        isComplete: aiResponse.nextAction === 'conclude' || newQuestionIndex >= questions.length - 1
      }
    })

  } catch (error) {
    console.error('❌ Error generating AI response:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate AI response'
      },
      { status: 500 }
    )
  }
}
