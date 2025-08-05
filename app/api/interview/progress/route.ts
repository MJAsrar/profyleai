import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserInterviewProgress } from '@/lib/db/interview-prep'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🎯 Fetching interview progress for user:', session.user.email)

    const progress = await getUserInterviewProgress(session.user.email)

    if (!progress) {
      // Return default progress if none exists
      const defaultProgress = {
        userId: session.user.email,
        sessionsCompleted: 0,
        totalQuestions: 0,
        averageScore: 0,
        confidenceScore: 0,
        improvementAreas: [],
        strengths: [],
        lastSessionDate: '',
        weeklyProgress: []
      }

      return NextResponse.json({
        success: true,
        data: defaultProgress
      })
    }

    console.log('✅ Successfully fetched progress data')

    return NextResponse.json({
      success: true,
      data: progress
    })

  } catch (error) {
    console.error('❌ Error in progress API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}