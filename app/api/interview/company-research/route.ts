import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { conductCompanyResearch } from '@/lib/services/interview-service'
import { updateInterviewPrepResearch } from '@/lib/db/interview-prep'

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
    const { companyName, jobTitle, industry, interviewPrepId } = body

    // Validate required fields
    if (!companyName || !jobTitle || !interviewPrepId) {
      return NextResponse.json(
        { success: false, error: 'Company name, job title, and interview prep ID are required' },
        { status: 400 }
      )
    }

    console.log('🎯 Researching company:', companyName, 'for role:', jobTitle)

    const result = await conductCompanyResearch(companyName, jobTitle, industry)

    if (!result.success) {
      console.error('❌ Failed to conduct company research:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Save research to database
    await updateInterviewPrepResearch(interviewPrepId, session.user.email, result.data!)

    console.log('✅ Successfully researched company:', companyName)

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Error in company-research API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}