import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateBehavioralCoaching } from '@/lib/services/interview-service'
import { updateInterviewPrepCoaching } from '@/lib/db/interview-prep'

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
    const { jobTitle, experienceLevel, interviewPrepId } = body

    // Validate required fields
    if (!jobTitle || !interviewPrepId) {
      return NextResponse.json(
        { success: false, error: 'Job title and interview prep ID are required' },
        { status: 400 }
      )
    }

    console.log('🎯 Generating behavioral coaching for:', jobTitle, 'at level:', experienceLevel || 'mid')

    const result = await generateBehavioralCoaching(jobTitle, experienceLevel || 'mid')

    if (!result.success) {
      console.error('❌ Failed to generate behavioral coaching:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Save coaching to database
    await updateInterviewPrepCoaching(interviewPrepId, session.user.email, result.data!)

    console.log('✅ Successfully generated behavioral coaching content')

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Error in behavioral-coaching API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}