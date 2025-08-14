import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query filters
    const where: any = {
      userId: user.id
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // Get video interviews with counts
    const [videoInterviews, totalCount] = await Promise.all([
      prisma.videoInterview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          sessionId: true,
          title: true,
          status: true,
          type: true,
          jobTitle: true,
          companyName: true,
          aiPersonality: true,
          recordingStatus: true,
          recordingDuration: true,
          scheduledAt: true,
          startedAt: true,
          completedAt: true,
          totalTime: true,
          overallScore: true,
          confidenceScore: true,
          engagementScore: true,
          deliveryScore: true,
          contentScore: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              responses: true,
              analytics: true
            }
          }
        }
      }),
      prisma.videoInterview.count({ where })
    ])

    // Calculate summary statistics
    const summary = {
      total: totalCount,
      byStatus: await prisma.videoInterview.groupBy({
        by: ['status'],
        where: { userId: user.id },
        _count: { _all: true }
      }),
      byType: await prisma.videoInterview.groupBy({
        by: ['type'],
        where: { userId: user.id },
        _count: { _all: true }
      }),
      averageScores: {
        overall: 0,
        confidence: 0,
        engagement: 0,
        delivery: 0,
        content: 0
      }
    }

    // Calculate average scores from completed interviews
    const completedInterviews = await prisma.videoInterview.findMany({
      where: {
        userId: user.id,
        status: 'completed',
        overallScore: { not: null }
      },
      select: {
        overallScore: true,
        confidenceScore: true,
        engagementScore: true,
        deliveryScore: true,
        contentScore: true
      }
    })

    if (completedInterviews.length > 0) {
      const totals = completedInterviews.reduce(
        (acc, interview) => ({
          overall: acc.overall + (interview.overallScore || 0),
          confidence: acc.confidence + (interview.confidenceScore || 0),
          engagement: acc.engagement + (interview.engagementScore || 0),
          delivery: acc.delivery + (interview.deliveryScore || 0),
          content: acc.content + (interview.contentScore || 0)
        }),
        { overall: 0, confidence: 0, engagement: 0, delivery: 0, content: 0 }
      )

      summary.averageScores = {
        overall: Math.round(totals.overall / completedInterviews.length),
        confidence: Math.round(totals.confidence / completedInterviews.length),
        engagement: Math.round(totals.engagement / completedInterviews.length),
        delivery: Math.round(totals.delivery / completedInterviews.length),
        content: Math.round(totals.content / completedInterviews.length)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        videoInterviews,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        summary
      }
    })

  } catch (error) {
    console.error('❌ Error listing video interviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve video interviews' },
      { status: 500 }
    )
  }
}
