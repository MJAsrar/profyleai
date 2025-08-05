import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { getUserInterviewProgress } from '@/lib/db/interview-prep'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    console.log('🎯 Fetching interview progress for user:', user.email)

    const progress = await getUserInterviewProgress(user.id)

    if (!progress) {
      // Return default progress if none exists
      const defaultProgress = {
        userId: user.id,
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