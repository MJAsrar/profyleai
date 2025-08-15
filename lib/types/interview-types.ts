/**
 * Interview-related type definitions
 */

export interface InterviewSummary {
  sessionId: string
  overallScore: number
  confidenceScore: number
  engagementScore: number
  deliveryScore: number
  contentScore: number
  totalTime: number
  questionsAnswered: number
  strengths: string[]
  improvements: string[]
  feedback: string
  transcriptionData?: {
    segments: Array<{
      text: string
      timestamp: number
      speaker: 'user' | 'ai'
    }>
  }
  analyticsData?: {
    speakingTime: number
    pauseCount: number
    fillerWords: number
    avgResponseTime: number
  }
}

export interface InterviewQuestion {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  expectedDuration: number
}

export interface InterviewResponse {
  questionId: string
  response: string
  duration: number
  score: number
  feedback: string
}
