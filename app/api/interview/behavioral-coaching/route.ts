import { NextRequest, NextResponse } from 'next/server'
import { generateBehavioralCoaching } from '@/lib/services/interview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobTitle, experienceLevel } = body

    // Validate required fields
    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
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