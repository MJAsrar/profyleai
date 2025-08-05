import { NextRequest, NextResponse } from 'next/server'
import { getInterviewProgress } from '@/lib/services/interview-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🎯 Fetching interview progress for user:', userId)

    const progress = getInterviewProgress(userId)

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