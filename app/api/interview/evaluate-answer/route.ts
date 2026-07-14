import { NextRequest, NextResponse } from 'next/server'
import { evaluateAnswer, PracticeQuestion, InterviewJobData } from '@/lib/services/interview-service'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { rateLimit, rateLimitKey, rateLimitResponse } from '@/lib/rate-limit'

// Bound the text sent to the model so one request cannot drive unbounded spend.
const MAX_ANSWER_CHARS = 10_000

export async function POST(request: NextRequest) {
  try {
    // Require authentication: this endpoint spends the operator's Gemini quota.
    // It was previously public — an open AI proxy.
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const limit = rateLimit(rateLimitKey(request, 'evaluate-answer', user.id), 30, 60_000)
    if (!limit.ok) {
      return rateLimitResponse(limit)
    }

    const body = await request.json()
    const { question, jobContext } = body
    const answer = typeof body.answer === 'string' ? body.answer.slice(0, MAX_ANSWER_CHARS) : body.answer

    // Validate required fields
    if (!question || !answer || !jobContext) {
      return NextResponse.json(
        { success: false, error: 'Question, answer, and job context are required' },
        { status: 400 }
      )
    }

    // Validate question structure
    if (!question.id || !question.question || !question.category) {
      return NextResponse.json(
        { success: false, error: 'Invalid question structure' },
        { status: 400 }
      )
    }

    // Validate job context
    if (!jobContext.companyName || !jobContext.jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Job context must include company name and job title' },
        { status: 400 }
      )
    }

    console.log('🎯 Evaluating answer for question:', question.question.substring(0, 50) + '...')

    const result = await evaluateAnswer(
      question as PracticeQuestion,
      answer,
      jobContext as InterviewJobData
    )

    if (!result.success) {
      console.error('❌ Failed to evaluate answer:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    console.log('✅ Successfully evaluated answer with score:', result.data?.score)

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Error in evaluate-answer API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}