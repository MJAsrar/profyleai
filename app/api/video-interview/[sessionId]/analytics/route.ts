import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    sessionId: string
  }>
}

const analyticsSchema = z.object({
  type: z.enum(['audio', 'facial', 'posture', 'overall']),
  timestamp: z.number(),
  
  // Audio analytics
  volume: z.number().optional(),
  pitch: z.number().optional(),
  pace: z.number().optional(),
  pauseCount: z.number().int().optional(),
  fillerWords: z.number().int().optional(),
  
  // Facial analytics
  emotion: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  eyeContact: z.number().min(0).max(1).optional(),
  smileIntensity: z.number().min(0).max(1).optional(),
  
  // Posture analytics
  posture: z.string().optional(),
  gestureCount: z.number().int().optional(),
  movementLevel: z.number().min(0).max(1).optional(),
  
  // Engagement metrics
  attention: z.number().min(0).max(1).optional(),
  engagement: z.number().min(0).max(1).optional(),
  
  // Raw data
  rawData: z.any().optional()
})

// POST - Store analytics data
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = await params
    const body = await request.json()

    // Validate request body
    const validationResult = analyticsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid analytics data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    // Verify session exists and belongs to user
    const videoInterview = await prisma.videoInterview.findFirst({
      where: {
        sessionId,
        userId: user.id
      }
    })

    if (!videoInterview) {
      return NextResponse.json(
        { success: false, error: 'Video interview session not found' },
        { status: 404 }
      )
    }

    // Store analytics data
    const analytics = await prisma.videoInterviewAnalytics.create({
      data: {
        videoInterviewId: videoInterview.id,
        ...validationResult.data
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        analyticsId: analytics.id,
        timestamp: analytics.timestamp
      }
    })

  } catch (error) {
    console.error('❌ Error storing analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to store analytics data' },
      { status: 500 }
    )
  }
}

// GET - Retrieve analytics data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const fromTimestamp = searchParams.get('fromTimestamp')
    const toTimestamp = searchParams.get('toTimestamp')

    // Verify session exists and belongs to user
    const videoInterview = await prisma.videoInterview.findFirst({
      where: {
        sessionId,
        userId: user.id
      }
    })

    if (!videoInterview) {
      return NextResponse.json(
        { success: false, error: 'Video interview session not found' },
        { status: 404 }
      )
    }

    // Build query filters
    const where: any = {
      videoInterviewId: videoInterview.id
    }

    if (type) {
      where.type = type
    }

    if (fromTimestamp || toTimestamp) {
      where.timestamp = {}
      if (fromTimestamp) {
        where.timestamp.gte = parseInt(fromTimestamp)
      }
      if (toTimestamp) {
        where.timestamp.lte = parseInt(toTimestamp)
      }
    }

    // Retrieve analytics data
    const analytics = await prisma.videoInterviewAnalytics.findMany({
      where,
      orderBy: { timestamp: 'asc' }
    })

    // Calculate summary statistics
    const summary = {
      totalDataPoints: analytics.length,
      timeRange: {
        start: analytics.length > 0 ? Math.min(...analytics.map(a => a.timestamp)) : 0,
        end: analytics.length > 0 ? Math.max(...analytics.map(a => a.timestamp)) : 0
      },
      averages: {
        confidence: 0,
        engagement: 0,
        attention: 0,
        volume: 0
      }
    }

    // Calculate averages for available metrics
    if (analytics.length > 0) {
      const confidenceValues = analytics.filter(a => a.confidence !== null).map(a => a.confidence!)
      const engagementValues = analytics.filter(a => a.engagement !== null).map(a => a.engagement!)
      const attentionValues = analytics.filter(a => a.attention !== null).map(a => a.attention!)
      const volumeValues = analytics.filter(a => a.volume !== null).map(a => a.volume!)

      if (confidenceValues.length > 0) {
        summary.averages.confidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      }
      if (engagementValues.length > 0) {
        summary.averages.engagement = engagementValues.reduce((a, b) => a + b, 0) / engagementValues.length
      }
      if (attentionValues.length > 0) {
        summary.averages.attention = attentionValues.reduce((a, b) => a + b, 0) / attentionValues.length
      }
      if (volumeValues.length > 0) {
        summary.averages.volume = volumeValues.reduce((a, b) => a + b, 0) / volumeValues.length
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        summary
      }
    })

  } catch (error) {
    console.error('❌ Error retrieving analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics data' },
      { status: 500 }
    )
  }
}
