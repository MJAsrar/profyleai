import { NextRequest, NextResponse } from 'next/server'
import { evaluateAnswer, PracticeQuestion, InterviewJobData } from '@/lib/services/interview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, jobContext } = body

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