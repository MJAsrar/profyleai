import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { getUserInterviewPreps } from '@/lib/db/interview-prep'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    console.log('🎯 Fetching interview preps for user:', user.email)

    const interviewPreps = await getUserInterviewPreps(user.id)

    console.log('✅ Successfully fetched', interviewPreps.length, 'interview preps')

    return NextResponse.json({
      success: true,
      data: interviewPreps
    })

  } catch (error) {
    console.error('❌ Error in list interview preps API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}