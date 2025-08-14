import OpenAI from 'openai'
import { PracticeQuestion, InterviewJobData } from './interview-service'

// ===== VIDEO INTERVIEW TYPES =====

export interface VideoInterviewConfig {
  apiKey: string
  organization?: string
  models: {
    conversation: string
    transcription: string
    tts: string
  }
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
  metadata?: {
    audioUrl?: string
    confidence?: number
    duration?: number
  }
}

export interface InterviewContext {
  sessionId: string
  candidateProfile: {
    name: string
    experience: string
    skills: string[]
  }
  interviewProgress: {
    currentPhase: 'intro' | 'warmup' | 'main' | 'conclusion'
    questionsAsked: number
    timeElapsed: number
    candidateEngagement: number
    stressLevel: number
  }
  conversationState: {
    lastQuestionType: string
    followUpNeeded: boolean
    clarificationRequired: boolean
    topicsCovered: string[]
    recentResponses: string[]
  }
}

export interface AIResponse {
  text: string
  audioUrl?: string
  emotion: 'neutral' | 'encouraging' | 'probing' | 'sympathetic'
  followUpType: 'clarification' | 'deeper' | 'next_question' | 'encouragement'
  topic?: string
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

export interface VideoInterviewResponse {
  transcript: TranscriptionResult
  aiResponse: AIResponse
  audioResponse: ArrayBuffer
  context: InterviewContext
  analytics?: {
    responseTime: number
    confidenceLevel: number
    engagementScore: number
  }
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

export interface InterviewSummary {
  overallScore: number
  confidenceScore: number
  engagementScore: number
  deliveryScore: number
  contentScore: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  recommendations: string[]
  nextSteps: string[]
}

// ===== SYSTEM PROMPTS =====

const INTERVIEW_PROMPTS = {
  introduction: `
ROLE: Professional AI Video Interviewer
PHASE: Introduction & Welcome
PERSONALITY: Warm, professional, encouraging

You are conducting a video interview. Your goal is to welcome the candidate and create a comfortable atmosphere while maintaining professionalism.

GUIDELINES:
- Keep responses brief (15-25 words) and natural for video conversation
- Show genuine interest and enthusiasm
- Set a positive, encouraging tone
- Explain what to expect in the interview
- Ask if they're ready to begin

RESPONSE FORMAT:
Return a JSON object with:
{
  "text": "Your response text",
  "emotion": "encouraging",
  "followUpType": "next_question",
  "shouldTransition": false,
  "nextAction": "continue"
}
`,

  mainInterview: `
ROLE: Professional AI Video Interviewer  
PHASE: Main Interview
PERSONALITY: Attentive, analytical, responsive

You are conducting the main interview phase. Analyze candidate responses and provide appropriate follow-ups.

RESPONSE ANALYSIS:
1. Completeness - Does the response fully answer the question?
2. Relevance - Is the response relevant to the role and question?
3. STAR Framework - Does it follow Situation, Task, Action, Result structure?
4. Specificity - Are there concrete examples and details?

FOLLOW-UP TRIGGERS:
- Response lacks detail → Ask for specific examples
- Unclear explanation → Request clarification  
- Missing STAR elements → Guide toward complete framework
- Good response → Acknowledge and transition to next question
- Incomplete response → Encourage continuation

GUIDELINES:
- Keep responses conversational and brief (20-30 words)
- Be encouraging while probing for details
- Acknowledge good points before asking follow-ups
- Maintain natural interview flow

RESPONSE FORMAT:
{
  "text": "Your response",
  "emotion": "neutral|encouraging|probing",
  "followUpType": "clarification|deeper|next_question|encouragement",
  "topic": "main topic discussed",
  "shouldTransition": true/false,
  "nextAction": "continue|next_question|conclude"
}
`,

  conclusion: `
ROLE: Professional AI Video Interviewer
PHASE: Interview Conclusion
PERSONALITY: Appreciative, professional, forward-looking

You are wrapping up the interview professionally.

GUIDELINES:
- Thank the candidate for their time and responses
- Provide positive reinforcement
- Explain next steps in the process
- Ask if they have any questions
- End on an encouraging note

RESPONSE FORMAT:
{
  "text": "Your concluding response",
  "emotion": "encouraging",
  "followUpType": "next_question",
  "shouldTransition": true,
  "nextAction": "conclude"
}
`
}

// ===== MAIN SERVICE CLASS =====

export class VideoInterviewService {
  private openai: OpenAI
  private config: VideoInterviewConfig
  private conversationHistory: Map<string, ConversationTurn[]>
  private interviewContexts: Map<string, InterviewContext>

  constructor(config: VideoInterviewConfig) {
    this.config = config
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization
    })
    this.conversationHistory = new Map()
    this.interviewContexts = new Map()
  }

  /**
   * Initialize a new video interview session
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
      recordingStatus: 'none'
    }

    // Initialize conversation history
    this.conversationHistory.set(sessionId, [])

    // Initialize interview context
    const context: InterviewContext = {
      sessionId,
      candidateProfile: {
        name: 'Candidate', // TODO: Get from user profile
        experience: 'Not specified',
        skills: []
      },
      interviewProgress: {
        currentPhase: 'intro',
        questionsAsked: 0,
        timeElapsed: 0,
        candidateEngagement: 0.8,
        stressLevel: 0.3
      },
      conversationState: {
        lastQuestionType: '',
        followUpNeeded: false,
        clarificationRequired: false,
        topicsCovered: [],
        recentResponses: []
      }
    }
    this.interviewContexts.set(sessionId, context)

    return session
  }

  /**
   * Start the interview session
   */
  async startInterview(sessionId: string): Promise<AIResponse> {
    const context = this.interviewContexts.get(sessionId)
    if (!context) {
      throw new Error('Interview session not found')
    }

    // Generate welcome message
    const welcomeResponse = await this.generateWelcomeMessage(context)
    
    // Update context
    context.interviewProgress.currentPhase = 'intro'
    this.interviewContexts.set(sessionId, context)

    return welcomeResponse
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
   * Generate AI interviewer response using GPT-4
   */
  async generateInterviewResponse(
    sessionId: string,
    transcript: string,
    currentQuestion: PracticeQuestion
  ): Promise<AIResponse> {
    try {
      const context = this.interviewContexts.get(sessionId)
      if (!context) {
        throw new Error('Interview context not found')
      }

      const conversationHistory = this.conversationHistory.get(sessionId) || []
      const prompt = this.getPromptForPhase(context.interviewProgress.currentPhase)

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `${prompt}

CURRENT CONTEXT:
- Question: "${currentQuestion.question}"
- Question Category: ${currentQuestion.category}
- Question Difficulty: ${currentQuestion.difficulty}
- Interview Phase: ${context.interviewProgress.currentPhase}
- Questions Asked: ${context.interviewProgress.questionsAsked}
- Candidate Engagement: ${context.interviewProgress.candidateEngagement}
- Recent Topics: ${context.conversationState.topicsCovered.slice(-3).join(', ')}

CANDIDATE RESPONSE TO ANALYZE:
"${transcript}"

Analyze the response and provide an appropriate interviewer reaction.`
        },
        ...conversationHistory.slice(-6).map(turn => ({
          role: turn.role as 'user' | 'assistant',
          content: turn.content
        })),
        {
          role: 'user',
          content: transcript
        }
      ]

      const response = await this.openai.chat.completions.create({
        model: this.config.models.conversation,
        messages,
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}') as AIResponse

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: transcript, timestamp: new Date() },
        { role: 'assistant', content: aiResponse.text, timestamp: new Date() }
      )
      this.conversationHistory.set(sessionId, conversationHistory)

      // Update context based on response
      this.updateInterviewContext(sessionId, transcript, aiResponse)

      return aiResponse
    } catch (error) {
      console.error('Interview response generation error:', error)
      throw new Error('Failed to generate interview response')
    }
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'): Promise<ArrayBuffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: this.config.models.tts,
        voice: voice,
        input: text,
        speed: 1.0,
        response_format: 'mp3'
      })

      return response.arrayBuffer()
    } catch (error) {
      console.error('TTS generation error:', error)
      throw new Error('Failed to generate speech')
    }
  }

  /**
   * Handle a complete interview turn (audio → transcript → AI response → speech)
   */
  async handleInterviewTurn(
    sessionId: string,
    audioChunk: Buffer
  ): Promise<VideoInterviewResponse> {
    const context = this.interviewContexts.get(sessionId)
    if (!context) {
      throw new Error('Interview session not found')
    }

    const session = await this.getSession(sessionId) // You'd implement this to fetch from DB
    const currentQuestion = session.questions[session.currentQuestionIndex]

    // 1. Transcribe audio
    const transcript = await this.transcribeAudioChunk(audioChunk)

    // 2. Generate AI response
    const aiResponse = await this.generateInterviewResponse(
      sessionId,
      transcript.text,
      currentQuestion
    )

    // 3. Convert response to speech
    const audioResponse = await this.generateSpeech(aiResponse.text)

    // 4. Calculate analytics
    const analytics = {
      responseTime: Date.now() - (context.interviewProgress.timeElapsed * 1000),
      confidenceLevel: transcript.confidence,
      engagementScore: context.interviewProgress.candidateEngagement
    }

    return {
      transcript,
      aiResponse,
      audioResponse,
      context,
      analytics
    }
  }

  /**
   * Generate welcome message for interview start
   */
  private async generateWelcomeMessage(context: InterviewContext): Promise<AIResponse> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: INTERVIEW_PROMPTS.introduction
      },
      {
        role: 'user',
        content: 'Please start the interview with a professional welcome message.'
      }
    ]

    const response = await this.openai.chat.completions.create({
      model: this.config.models.conversation,
      messages,
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' }
    })

    return JSON.parse(response.choices[0].message.content || '{}') as AIResponse
  }

  /**
   * Get appropriate prompt based on interview phase
   */
  private getPromptForPhase(phase: InterviewContext['interviewProgress']['currentPhase']): string {
    switch (phase) {
      case 'intro':
      case 'warmup':
        return INTERVIEW_PROMPTS.introduction
      case 'main':
        return INTERVIEW_PROMPTS.mainInterview
      case 'conclusion':
        return INTERVIEW_PROMPTS.conclusion
      default:
        return INTERVIEW_PROMPTS.mainInterview
    }
  }

  /**
   * Update interview context based on latest interaction
   */
  private updateInterviewContext(
    sessionId: string,
    transcript: string,
    aiResponse: AIResponse
  ): void {
    const context = this.interviewContexts.get(sessionId)
    if (!context) return

    // Update conversation state
    context.conversationState.lastQuestionType = aiResponse.followUpType
    context.conversationState.followUpNeeded = aiResponse.followUpType === 'clarification'
    context.conversationState.recentResponses.push(transcript)
    
    if (aiResponse.topic) {
      context.conversationState.topicsCovered.push(aiResponse.topic)
    }

    // Keep only recent responses
    if (context.conversationState.recentResponses.length > 5) {
      context.conversationState.recentResponses = context.conversationState.recentResponses.slice(-5)
    }

    // Update progress
    if (aiResponse.nextAction === 'next_question') {
      context.interviewProgress.questionsAsked += 1
    }

    // Update phase based on progress
    if (context.interviewProgress.questionsAsked === 0) {
      context.interviewProgress.currentPhase = 'intro'
    } else if (context.interviewProgress.questionsAsked <= 2) {
      context.interviewProgress.currentPhase = 'warmup'
    } else if (aiResponse.nextAction === 'conclude') {
      context.interviewProgress.currentPhase = 'conclusion'
    } else {
      context.interviewProgress.currentPhase = 'main'
    }

    // Estimate engagement and stress (basic heuristic)
    const responseLength = transcript.length
    const avgResponseLength = 150 // Estimated average
    
    if (responseLength < avgResponseLength * 0.5) {
      context.interviewProgress.candidateEngagement = Math.max(0.3, context.interviewProgress.candidateEngagement - 0.1)
      context.interviewProgress.stressLevel = Math.min(1.0, context.interviewProgress.stressLevel + 0.1)
    } else if (responseLength > avgResponseLength * 1.5) {
      context.interviewProgress.candidateEngagement = Math.min(1.0, context.interviewProgress.candidateEngagement + 0.1)
      context.interviewProgress.stressLevel = Math.max(0.0, context.interviewProgress.stressLevel - 0.05)
    }

    this.interviewContexts.set(sessionId, context)
  }

  /**
   * Generate comprehensive interview summary
   */
  async generateInterviewSummary(sessionId: string): Promise<InterviewSummary> {
    const context = this.interviewContexts.get(sessionId)
    const conversationHistory = this.conversationHistory.get(sessionId)
    
    if (!context || !conversationHistory) {
      throw new Error('Interview data not found')
    }

    // Extract candidate responses
    const candidateResponses = conversationHistory
      .filter(turn => turn.role === 'user')
      .map(turn => turn.content)
      .join('\n\n')

    const prompt = `
ROLE: Expert Interview Evaluator

TASK: Analyze this complete video interview and provide comprehensive feedback.

INTERVIEW DATA:
- Questions Asked: ${context.interviewProgress.questionsAsked}
- Topics Covered: ${context.conversationState.topicsCovered.join(', ')}
- Engagement Level: ${context.interviewProgress.candidateEngagement}
- Stress Level: ${context.interviewProgress.stressLevel}

CANDIDATE RESPONSES:
${candidateResponses}

EVALUATION CRITERIA:
1. Content Quality (0-100): Relevance, specificity, examples
2. Delivery (0-100): Clarity, confidence, pace  
3. Engagement (0-100): Enthusiasm, interaction, presence
4. Overall Confidence (0-100): Self-assurance, composure

Provide detailed feedback with specific strengths, areas for improvement, and actionable recommendations.

RESPONSE FORMAT:
{
  "overallScore": 85,
  "confidenceScore": 80,
  "engagementScore": 90,
  "deliveryScore": 75,
  "contentScore": 85,
  "strengths": ["Clear communication", "Good examples", "Professional demeanor"],
  "improvements": ["More specific metrics", "Stronger STAR structure"],
  "detailedFeedback": "Detailed paragraph of feedback...",
  "recommendations": ["Practice quantifying achievements", "Work on concise responses"],
  "nextSteps": ["Schedule follow-up interview", "Prepare technical questions"]
}
`

    const response = await this.openai.chat.completions.create({
      model: this.config.models.conversation,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    return JSON.parse(response.choices[0].message.content || '{}') as InterviewSummary
  }

  /**
   * Cleanup session data
   */
  cleanupSession(sessionId: string): void {
    this.conversationHistory.delete(sessionId)
    this.interviewContexts.delete(sessionId)
  }

  /**
   * Get current session (placeholder - implement with your DB)
   */
  private async getSession(sessionId: string): Promise<VideoInterviewSession> {
    // TODO: Implement database fetch
    throw new Error('getSession not implemented - connect to your database')
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
          return service.handleInterviewTurn(sessionId, chunk)
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
