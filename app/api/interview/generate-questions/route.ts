import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generatePracticeQuestions, InterviewJobData } from '@/lib/services/interview-service'
import { createInterviewPrep } from '@/lib/db/interview-prep'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
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

    // Save to database
    const interviewPrep = await createInterviewPrep(
      session.user.email, // Using email as userId for now
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
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}