import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getInterviewPrep, deleteInterviewPrep } from '@/lib/db/interview-prep'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    console.log('🎯 Fetching interview prep:', id)

    const interviewPrep = await getInterviewPrep(id, session.user.email)

    if (!interviewPrep) {
      return NextResponse.json(
        { success: false, error: 'Interview prep not found' },
        { status: 404 }
      )
    }

    console.log('✅ Successfully fetched interview prep')

    return NextResponse.json({
      success: true,
      data: interviewPrep
    })

  } catch (error) {
    console.error('❌ Error in get interview prep API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    console.log('🎯 Deleting interview prep:', id)

    await deleteInterviewPrep(id, session.user.email)

    console.log('✅ Successfully deleted interview prep')

    return NextResponse.json({
      success: true,
      message: 'Interview prep deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error in delete interview prep API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}