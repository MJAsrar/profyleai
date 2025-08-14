import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { createVideoInterviewService } from '@/lib/services/video-interview-service'

interface RouteParams {
  params: {
    sessionId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { sessionId } = params

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

    if (videoInterview.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Interview session is not active' },
        { status: 400 }
      )
    }

    // Get audio data from request
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    console.log('🎤 Processing audio chunk:', audioBuffer.length, 'bytes')

    // Create video interview service
    const videoInterviewService = createVideoInterviewService()

    // Transcribe audio
    const transcriptionResult = await videoInterviewService.transcribeAudioChunk(audioBuffer)

    console.log('✅ Transcription completed:', transcriptionResult.text)

    // Store transcription in session data
    const existingTranscription = videoInterview.transcriptionData as any || { turns: [] }
    existingTranscription.turns.push({
      timestamp: new Date().toISOString(),
      text: transcriptionResult.text,
      confidence: transcriptionResult.confidence,
      words: transcriptionResult.words
    })

    // Update interview with transcription
    await prisma.videoInterview.update({
      where: { id: videoInterview.id },
      data: {
        transcriptionData: existingTranscription,
        lastActivity: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        transcript: transcriptionResult.text,
        confidence: transcriptionResult.confidence,
        words: transcriptionResult.words,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error transcribing audio:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to transcribe audio'
      },
      { status: 500 }
    )
  }
}
