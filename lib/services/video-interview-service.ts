'use client'

import OpenAI from 'openai'
import { PracticeQuestion } from './interview-service'

// ===== TYPES =====

export interface VideoInterviewConfig {
  apiKey: string
  organization?: string
  models: {
    conversation: string
    transcription: string
    tts: string
  }
}

export interface InterviewJobData {
  jobTitle: string
  companyName: string
  jobDescription: string
  industry: string
  experienceLevel: 'entry' | 'mid' | 'senior'
}

export interface VideoInterviewSession {
  sessionId: string
  userId: string
  jobData: InterviewJobData
  questions: PracticeQuestion[]
  currentQuestionIndex: number
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  aiPersonality: 'professional' | 'friendly' | 'challenging'
  startedAt?: Date
  completedAt?: Date
  recordingUrl?: string
  recordingStatus: 'none' | 'recording' | 'processing' | 'completed' | 'failed'
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  questionId?: string
}

export interface AIResponse {
  text: string
  emotion: 'professional' | 'encouraging' | 'challenging' | 'empathetic'
  followUpType: 'clarification' | 'deeper_dive' | 'next_question' | 'wrap_up'
  shouldTransition: boolean
  nextAction: 'continue' | 'next_question' | 'conclude'
}

export interface TranscriptionResult {
  text: string
  confidence: number
  words?: Array<{
    word: string
    start: number
    end: number
    confidence: number
  }>
}

export interface InterviewContext {
  sessionId: string
  currentPhase: 'intro' | 'warmup' | 'main' | 'conclusion'
  conversationHistory: ConversationTurn[]
  interviewProgress: {
    questionsAsked: number
    totalQuestions: number
    currentQuestionIndex: number
    timeElapsed: number
    candidateEngagement: number
    stressLevel: number
  }
}

export interface VideoInterviewResponse {
  transcript: TranscriptionResult
  aiResponse: AIResponse
  audioResponse: ArrayBuffer
  context: InterviewContext
  analytics: {
    responseTime: number
    confidenceLevel: number
    engagementScore: number
  }
}

export interface InterviewSummary {
  overallScore: number
  strengths: string[]
  areasForImprovement: string[]
  detailedFeedback: string
  recommendations: string[]
}

export interface VideoInterviewResult {
  success: boolean
  data?: {
    session: VideoInterviewSession
    handleAudioChunk: (chunk: Buffer) => Promise<VideoInterviewResponse>
    endInterview: () => Promise<InterviewSummary>
  }
  error?: string
}

// ===== PROMPTS =====

const INTERVIEW_PROMPTS = {
  introduction: `You are an experienced, professional AI interviewer conducting a job interview. Your role is to:

1. Create a welcoming, professional atmosphere
2. Ask thoughtful, relevant questions based on the job requirements
3. Listen actively and ask appropriate follow-up questions
4. Provide constructive feedback when appropriate
5. Guide the conversation naturally while staying focused on the role

Guidelines:
- Be professional but approachable
- Ask one question at a time
- Allow the candidate to fully answer before responding
- Provide brief acknowledgments to show you're listening
- Ask follow-up questions to dive deeper into interesting points
- Keep responses concise and natural

Remember: This is a real interview simulation. The candidate should feel like they're talking to a human interviewer.`,

  responseGeneration: `Based on the conversation history and the candidate's latest response, generate an appropriate interviewer response.

Consider:
1. Was the answer complete and satisfactory?
2. Should you ask a follow-up question for clarification or more detail?
3. Is it time to move to the next question?
4. How can you acknowledge their response professionally?

Response format should be natural, conversational, and professional. Keep responses brief (1-2 sentences typically) unless providing detailed feedback.`,

  conclusion: `The interview is concluding. Provide a professional closing that:
1. Thanks the candidate for their time
2. Briefly summarizes the conversation positively
3. Explains next steps (even though this is practice)
4. Ends on an encouraging note`
}

// ===== SERVICE CLASS =====

export class VideoInterviewService {
  private openai: OpenAI
  private config: VideoInterviewConfig
  private interviewContexts: Map<string, InterviewContext> = new Map()
  private conversationHistory: Map<string, ConversationTurn[]> = new Map()

  constructor(config: VideoInterviewConfig) {
    this.config = config
    console.log('🔧 Initializing VideoInterviewService with config:', {
      hasApiKey: !!config.apiKey,
      organization: config.organization,
      models: config.models
    })
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization
    })
  }

  /**
   * Initialize a new interview session
   */
  async initializeSession(
    sessionId: string,
    userId: string,
    jobData: InterviewJobData,
    questions: PracticeQuestion[],
    aiPersonality: 'professional' | 'friendly' | 'challenging' = 'professional'
  ): Promise<VideoInterviewSession> {
    const session: VideoInterviewSession = {
      sessionId,
      userId,
      jobData,
      questions,
      currentQuestionIndex: 0,
      status: 'scheduled',
      aiPersonality,
      recordingStatus: 'none',
      startedAt: new Date()
    }

    // Initialize context
    const context: InterviewContext = {
      sessionId,
      currentPhase: 'intro',
      conversationHistory: [],
      interviewProgress: {
        questionsAsked: 0,
        totalQuestions: questions.length,
        currentQuestionIndex: 0,
        timeElapsed: 0,
        candidateEngagement: 0.8,
        stressLevel: 0.3
      }
    }

    this.interviewContexts.set(sessionId, context)
    this.conversationHistory.set(sessionId, [])

    console.log(`✅ Interview session initialized: ${sessionId}`)
    return session
  }

  /**
   * Start the interview and generate welcome message
   */
  async startInterview(sessionId: string): Promise<AIResponse> {
    const context = this.interviewContexts.get(sessionId)
    if (!context) {
      throw new Error('Interview session not found')
    }

    return this.generateWelcomeMessage(context)
  }

  /**
   * Transcribe audio chunk using OpenAI Whisper
   */
  async transcribeAudioChunk(audioChunk: Buffer): Promise<TranscriptionResult> {
    try {
      // Create a temporary file-like object for the API
      const file = new File([audioChunk], 'audio.wav', { type: 'audio/wav' })
      
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: this.config.models.transcription,
        language: 'en',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      })

      return {
        text: response.text,
        confidence: 0.9, // Whisper doesn't provide confidence, using default
        words: response.words?.map(word => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: 0.9 // Default confidence
        }))
      }
    } catch (error) {
      console.error('Transcription error:', error)
      throw new Error('Failed to transcribe audio')
    }
  }

  /**
   * Generate AI response to candidate's answer
   */
  async generateInterviewResponse(
    sessionId: string,
    transcript: string,
    currentQuestion: PracticeQuestion
  ): Promise<AIResponse> {
    const context = this.interviewContexts.get(sessionId)
    const history = this.conversationHistory.get(sessionId)
    
    if (!context || !history) {
      throw new Error('Interview session not found')
    }

    // Add user response to history
    history.push({
      role: 'user',
      content: transcript,
      timestamp: new Date(),
      questionId: currentQuestion.id
    })

    // Build conversation context
    const conversationContext = history
      .slice(-6) // Last 6 turns for context
      .map(turn => `${turn.role}: ${turn.content}`)
      .join('\n')

    const prompt = `${INTERVIEW_PROMPTS.responseGeneration}

Current Question: ${currentQuestion.question}
Question Category: ${currentQuestion.category}
Job Role: ${context.sessionId}

Recent Conversation:
${conversationContext}

Candidate's Latest Response: ${transcript}

Generate a professional interviewer response. Consider whether to:
1. Acknowledge the answer and ask a follow-up
2. Move to the next question
3. Ask for clarification or more detail

Respond as JSON with this format:
{
  "text": "Your response here",
  "emotion": "professional|encouraging|challenging|empathetic",
  "followUpType": "clarification|deeper_dive|next_question|wrap_up",
  "shouldTransition": false,
  "nextAction": "continue|next_question|conclude"
}`

    try {
      console.log('🤖 Calling OpenAI with prompt:', prompt.substring(0, 200) + '...')
      const response = await this.openai.chat.completions.create({
        model: this.config.models.conversation,
        messages: [
          { role: 'system', content: INTERVIEW_PROMPTS.introduction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })

      console.log('✅ OpenAI response received:', response.choices[0].message.content?.substring(0, 200) + '...')
      
      const aiResponse = JSON.parse(response.choices[0].message.content || '{}') as AIResponse

      // Add AI response to history
      history.push({
        role: 'assistant',
        content: aiResponse.text,
        timestamp: new Date(),
        questionId: currentQuestion.id
      })

      return aiResponse
    } catch (error) {
      console.error('❌ AI response generation error:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack)
      }
      throw new Error('Failed to generate AI response: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'): Promise<ArrayBuffer> {
    try {
      console.log('🔊 Generating speech for text:', text.substring(0, 100) + '...')
      const response = await this.openai.audio.speech.create({
        model: this.config.models.tts,
        voice: voice,
        input: text,
        speed: 1.0,
        response_format: 'mp3'
      })

      const audioBuffer = await response.arrayBuffer()
      console.log('✅ Speech generated successfully, size:', audioBuffer.byteLength, 'bytes')
      return audioBuffer
    } catch (error) {
      console.error('❌ TTS generation error:', error)
      if (error instanceof Error) {
        console.error('TTS error details:', error.message, error.stack)
      }
      throw new Error('Failed to generate speech: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Generate welcome message for interview start
   */
  private async generateWelcomeMessage(context: InterviewContext): Promise<AIResponse> {
    return {
      text: "Hello! I'm excited to speak with you today about this opportunity. I've reviewed the role requirements and I'm looking forward to learning more about your experience and background. Shall we begin?",
      emotion: 'professional',
      followUpType: 'next_question',
      shouldTransition: false,
      nextAction: 'continue'
    }
  }

  /**
   * Generate interview summary and feedback
   */
  async generateInterviewSummary(sessionId: string): Promise<InterviewSummary> {
    const history = this.conversationHistory.get(sessionId)
    if (!history) {
      throw new Error('Interview session not found')
    }

    // For now, return a basic summary
    // In production, this would use AI to analyze the full conversation
    return {
      overallScore: 75,
      strengths: ['Clear communication', 'Relevant experience'],
      areasForImprovement: ['Could provide more specific examples'],
      detailedFeedback: 'Overall strong performance with good technical knowledge.',
      recommendations: ['Practice behavioral questions', 'Prepare more detailed examples']
    }
  }

  /**
   * Clean up session data
   */
  cleanupSession(sessionId: string): void {
    this.interviewContexts.delete(sessionId)
    this.conversationHistory.delete(sessionId)
    console.log(`🧹 Cleaned up interview session: ${sessionId}`)
  }

  /**
   * Get session context (for debugging/monitoring)
   */
  getSessionContext(sessionId: string): InterviewContext | undefined {
    return this.interviewContexts.get(sessionId)
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Create video interview service instance
 */
export function createVideoInterviewService(): VideoInterviewService {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  const config: VideoInterviewConfig = {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    models: {
      conversation: 'gpt-4-turbo-preview',
      transcription: 'whisper-1',
      tts: 'tts-1-hd'
    }
  }

  return new VideoInterviewService(config)
}

/**
 * Conduct a complete video interview session
 */
export async function conductVideoInterview(
  sessionId: string,
  userId: string,
  jobData: InterviewJobData,
  questions: PracticeQuestion[]
): Promise<VideoInterviewResult> {
  try {
    const service = createVideoInterviewService()
    const session = await service.initializeSession(sessionId, userId, jobData, questions)

    return {
      success: true,
      data: {
        session,
        handleAudioChunk: async (chunk: Buffer) => {
          const transcript = await service.transcribeAudioChunk(chunk)
          const currentQuestion = questions[session.currentQuestionIndex]
          const aiResponse = await service.generateInterviewResponse(sessionId, transcript.text, currentQuestion)
          const audioResponse = await service.generateSpeech(aiResponse.text)
          
          return {
            transcript,
            aiResponse,
            audioResponse,
            context: service.getSessionContext(sessionId)!,
            analytics: {
              responseTime: Date.now(),
              confidenceLevel: transcript.confidence,
              engagementScore: 0.8
            }
          }
        },
        endInterview: async () => {
          const summary = await service.generateInterviewSummary(sessionId)
          service.cleanupSession(sessionId)
          return summary
        }
      }
    }
  } catch (error) {
    console.error('Video interview error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
