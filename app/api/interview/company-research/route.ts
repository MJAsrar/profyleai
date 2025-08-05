import { NextRequest, NextResponse } from 'next/server'
import { conductCompanyResearch } from '@/lib/services/interview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, jobTitle, industry } = body

    // Validate required fields
    if (!companyName || !jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Company name and job title are required' },
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