import { NextResponse } from 'next/server'
import { generatePracticeQuestions, InterviewJobData } from '@/lib/services/interview-service'
import { createInterviewPrep } from '@/lib/db/interview-prep'
import { withCreditCheck, CreditRequest } from '@/lib/middleware/credit-middleware'
import { rateLimit, rateLimitKey, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/interview/generate-questions
 *
 * Creating an interview prep is the billable unit for TEXT_INTERVIEW (5 credits).
 * Practising against that prep (evaluating answers, company research, coaching) is
 * included, so a user is not charged per answer. Credits are reserved before the
 * model runs and refunded automatically if generation fails.
 */
export const POST = withCreditCheck('TEXT_INTERVIEW')(async (request: CreditRequest) => {
  try {
    const user = request.user!

    const limit = rateLimit(rateLimitKey(request, 'generate-questions', user.id), 10, 60_000)
    if (!limit.ok) {
      return rateLimitResponse(limit) as NextResponse
    }

    const body = await request.json()
    const { companyName, jobTitle, jobDescription, industry, experienceLevel, questionCount } = body

    // Validate required fields
    if (!companyName || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Company name, job title, and job description are required' },
        { status: 400 }
      )
    }

    const jobData: InterviewJobData = {
      companyName,
      jobTitle,
      jobDescription: String(jobDescription).slice(0, 20_000),
      industry,
      experienceLevel
    }

    console.log('🎯 Generating interview questions for:', jobTitle, 'at', companyName)

    const result = await generatePracticeQuestions(jobData, questionCount || 10)

    if (!result.success) {
      console.error('❌ Failed to generate questions:', result.error)
      // Non-2xx → the middleware refunds the reserved credits.
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    console.log('✅ Successfully generated', result.data?.questions.length, 'questions')

    // Save to database
    const interviewPrep = await createInterviewPrep(
      user.id,
      jobData,
      result.data!.questions
    )

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        interviewPrepId: interviewPrep.id
      }
    })

  } catch (error) {
    console.error('❌ Error in generate-questions API:', error)
    // Throwing/500 → the middleware refunds the reserved credits.
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
})
