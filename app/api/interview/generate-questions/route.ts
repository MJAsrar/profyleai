import { NextRequest, NextResponse } from 'next/server'
import { generatePracticeQuestions, InterviewJobData } from '@/lib/services/interview-service'

export async function POST(request: NextRequest) {
  try {
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
      jobDescription,
      industry,
      experienceLevel
    }

    console.log('🎯 Generating interview questions for:', jobTitle, 'at', companyName)

    const result = await generatePracticeQuestions(jobData, questionCount || 10)

    if (!result.success) {
      console.error('❌ Failed to generate questions:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    console.log('✅ Successfully generated', result.data?.questions.length, 'questions')

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Error in generate-questions API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}