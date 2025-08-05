import { NextRequest, NextResponse } from 'next/server'
import { 
  createMockInterviewSession, 
  generateMockInterviewSummary,
  PracticeQuestion,
  MockInterviewSession 
} from '@/lib/services/interview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, questions, session } = body

    if (action === 'create') {
      // Create a new mock interview session
      if (!questions || !Array.isArray(questions)) {
        return NextResponse.json(
          { success: false, error: 'Questions array is required to create a session' },
          { status: 400 }
        )
      }

      const mockSession = createMockInterviewSession(questions as PracticeQuestion[])
      
      console.log('✅ Created new mock interview session:', mockSession.sessionId)

      return NextResponse.json({
        success: true,
        data: { session: mockSession }
      })

    } else if (action === 'complete') {
      // Complete a mock interview session and generate summary
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session data is required to complete interview' },
          { status: 400 }
        )
      }

      const completedSession: MockInterviewSession = {
        ...session,
        status: 'completed',
        completedAt: new Date().toISOString()
      }

      const summary = generateMockInterviewSummary(completedSession)
      
      console.log('✅ Completed mock interview session with score:', summary.overallScore)

      return NextResponse.json({
        success: true,
        data: { 
          session: completedSession,
          summary 
        }
      })

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "create" or "complete"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error in mock-interview API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}