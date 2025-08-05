import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getUserInterviewPreps } from '@/lib/db/interview-prep'

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

    console.log('🎯 Fetching interview preps for user:', session.user.email)

    const interviewPreps = await getUserInterviewPreps(session.user.email)

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