import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    sessionId: string
  }
}

// GET - Retrieve video interview session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = params

    const videoInterview = await prisma.videoInterview.findFirst({
      where: {
        sessionId,
        userId: user.id
      },
      include: {
        responses: {
          orderBy: { questionOrder: 'asc' }
        },
        analytics: {
          orderBy: { timestamp: 'asc' }
        }
      }
    })

    if (!videoInterview) {
      return NextResponse.json(
        { success: false, error: 'Video interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        session: videoInterview,
        responses: videoInterview.responses,
        analytics: videoInterview.analytics
      }
    })

  } catch (error) {
    console.error('❌ Error retrieving video interview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve video interview session' },
      { status: 500 }
    )
  }
}

// PATCH - Update video interview session
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = params
    const body = await request.json()

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

    // Update allowed fields
    const updateData: any = {}
    
    if (body.status) updateData.status = body.status
    if (body.currentQuestionIndex !== undefined) updateData.currentQuestionIndex = body.currentQuestionIndex
    if (body.startedAt) updateData.startedAt = new Date(body.startedAt)
    if (body.completedAt) updateData.completedAt = new Date(body.completedAt)
    if (body.totalTime !== undefined) updateData.totalTime = body.totalTime
    if (body.recordingUrl) updateData.recordingUrl = body.recordingUrl
    if (body.recordingStatus) updateData.recordingStatus = body.recordingStatus
    if (body.recordingDuration !== undefined) updateData.recordingDuration = body.recordingDuration
    if (body.connectionStatus) updateData.connectionStatus = body.connectionStatus
    if (body.lastActivity) updateData.lastActivity = new Date(body.lastActivity)
    
    // Scores
    if (body.overallScore !== undefined) updateData.overallScore = body.overallScore
    if (body.confidenceScore !== undefined) updateData.confidenceScore = body.confidenceScore
    if (body.engagementScore !== undefined) updateData.engagementScore = body.engagementScore
    if (body.deliveryScore !== undefined) updateData.deliveryScore = body.deliveryScore
    if (body.contentScore !== undefined) updateData.contentScore = body.contentScore
    
    // Analysis data
    if (body.transcriptionData) updateData.transcriptionData = body.transcriptionData
    if (body.analyticsData) updateData.analyticsData = body.analyticsData
    if (body.feedback) updateData.feedback = body.feedback

    const updatedInterview = await prisma.videoInterview.update({
      where: { id: videoInterview.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedInterview
    })

  } catch (error) {
    console.error('❌ Error updating video interview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update video interview session' },
      { status: 500 }
    )
  }
}

// DELETE - Delete video interview session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = params

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

    // Delete the interview and all related data (cascade will handle responses and analytics)
    await prisma.videoInterview.delete({
      where: { id: videoInterview.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Video interview session deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting video interview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete video interview session' },
      { status: 500 }
    )
  }
}
