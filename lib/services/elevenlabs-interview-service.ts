'use client'

import { Conversation } from '@elevenlabs/client'
import { PracticeQuestion } from './interview-service'

// ===== TYPES =====

export interface ElevenLabsConfig {
  apiKey: string
  agentId: string
}

export interface InterviewSession {
  sessionId: string
  conversationId: string
  agentId: string
  status: 'connecting' | 'connected' | 'speaking' | 'listening' | 'ended'
}

export interface ConversationEvent {
  type: 'agent_response' | 'user_input' | 'interruption' | 'conversation_end'
  timestamp: Date
  content?: string
  audio?: ArrayBuffer
}

export interface ElevenLabsCallbacks {
  onConnectionStateChange: (status: InterviewSession['status']) => void
  onAgentSpeaking: (audio: ArrayBuffer, text: string) => void
  onUserSpeaking: () => void
  onConversationEnd: (summary: any) => void
  onError: (error: Error) => void
}

// ===== ELEVENLABS INTERVIEW SERVICE =====

export class ElevenLabsInterviewService {
  private config: ElevenLabsConfig
  private callbacks: ElevenLabsCallbacks
  private conversation: Conversation | null = null
  private session: InterviewSession | null = null
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null

  constructor(config: ElevenLabsConfig, callbacks: ElevenLabsCallbacks) {
    this.config = config
    this.callbacks = callbacks
  }

  /**
   * Initialize the interview session with job context and resume data
   */
  async initializeInterview(
    sessionId: string,
    jobTitle: string,
    companyName: string,
    questions: PracticeQuestion[],
    jobDescription?: string,
    resumeData?: any
  ): Promise<void> {
    try {
      console.log('🎤 Initializing ElevenLabs interview session with SDK...')

      // Create session
      this.session = {
        sessionId,
        conversationId: `conv_${Date.now()}`,
        agentId: this.config.agentId,
        status: 'connecting'
      }

      // Prepare dynamic variables for the conversation
      const dynamicVariables = this.prepareDynamicVariables(
        jobTitle,
        companyName,
        jobDescription,
        questions,
        resumeData
      )

      console.log('📋 Dynamic variables prepared:', dynamicVariables)

      // Initialize audio context
      this.audioContext = new AudioContext()

      // Get user media
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        },
        video: false
      })

      console.log('✅ Media stream acquired')
      
      // Start conversation with ElevenLabs SDK
      await this.startConversationWithSDK(dynamicVariables)

    } catch (error) {
      console.error('❌ Failed to initialize interview:', error)
      this.callbacks.onError(error as Error)
      throw error
    }
  }

  /**
   * Start conversation using ElevenLabs SDK
   */
  private async startConversationWithSDK(dynamicVariables: Record<string, any>): Promise<void> {
    try {
      console.log('🚀 Starting conversation with ElevenLabs SDK...')

      // Request microphone access (already done, but SDK might need it)
      await navigator.mediaDevices.getUserMedia({ audio: true })

            // Start conversation with dynamic variables
      this.conversation = await Conversation.startSession({
        agentId: this.config.agentId,
        connectionType: 'websocket',
        
        // Pass all our context as dynamic variables
        dynamicVariables: dynamicVariables
      })

      console.log('✅ ElevenLabs conversation started with dynamic variables')
      
      // Set up event listeners if available
      this.setupConversationEventListeners()

      console.log('✅ ElevenLabs conversation started successfully')
      
    } catch (error) {
      console.error('❌ Failed to start conversation with SDK:', error)
      throw error
    }
  }

  /**
   * Setup conversation event listeners
   */
  private setupConversationEventListeners(): void {
    if (!this.conversation) return

    try {
      // Update session status
      this.session!.status = 'connected'
      this.callbacks.onConnectionStateChange('connected')

      console.log('🔗 Event listeners setup complete')
      
    } catch (error) {
      console.error('❌ Failed to setup event listeners:', error)
    }
  }

  /**
   * Prepare dynamic variables from job and resume data
   */
  private prepareDynamicVariables(
    jobTitle: string, 
    companyName: string, 
    jobDescription: string | undefined,
    questions: PracticeQuestion[],
    resumeData?: any
  ): Record<string, any> {
    return {
      // Job information
      job_title: jobTitle,
      company_name: companyName,
      job_description: jobDescription?.substring(0, 500) || 'No job description provided',
      
      // Candidate information
      candidate_name: resumeData?.personalInfo?.fullName || 'there',
      experience_summary: this.buildExperienceSummary(resumeData),
      key_skills: this.buildSkillsSummary(resumeData),
      recent_role: this.buildRecentRole(resumeData),
      notable_projects: this.buildProjectsSummary(resumeData),
      
      // Interview questions
      interview_questions: this.buildQuestionsList(questions),
      
      // Additional context
      total_experience_years: resumeData?.experience?.length || 0,
      candidate_summary: resumeData?.summary?.substring(0, 200) || 'No summary provided'
    }
  }

  /**
   * Build experience summary for variables
   */
  private buildExperienceSummary(resumeData: any): string {
    if (!resumeData?.experience) return 'No experience data provided'
    
    const count = resumeData.experience.length
    const recent = resumeData.experience[0]
    return `${count} previous positions. Most recent: ${recent?.jobTitle || 'N/A'} at ${recent?.company || 'N/A'}`
  }

  /**
   * Build skills summary for variables
   */
  private buildSkillsSummary(resumeData: any): string {
    if (!resumeData?.skills) return 'No skills data provided'
    
    return resumeData.skills
      .slice(0, 3) // First 3 skill categories
      .map((skillGroup: any) => skillGroup.category)
      .join(', ')
  }

  /**
   * Build recent role summary for variables
   */
  private buildRecentRole(resumeData: any): string {
    const recent = resumeData?.experience?.[0]
    if (!recent) return 'No recent role data'
    
    return `${recent.jobTitle} at ${recent.company} (${recent.startDate || 'Unknown'} - ${recent.endDate || 'Present'})`
  }

  /**
   * Build projects summary for variables
   */
  private buildProjectsSummary(resumeData: any): string {
    if (!resumeData?.projects) return 'No projects listed'
    
    return resumeData.projects
      .slice(0, 2) // First 2 projects
      .map((project: any) => `${project.name}: ${project.description?.substring(0, 100) || 'No description'}`)
      .join('; ')
  }

  /**
   * Build questions list for variables
   */
  private buildQuestionsList(questions: any[]): string {
    return questions
      .slice(0, 6) // First 6 questions
      .map((q: any, i: number) => `${i + 1}. ${q.question}`)
      .join('\n')
  }

  /**
   * Send a text message to the agent (if supported by SDK)
   */
  sendMessage(message: string): void {
    if (this.conversation) {
      try {
        // Check if the SDK has a method to send text messages
        // This might need to be implemented based on SDK documentation
        console.log('💬 Sending message via SDK:', message)
        // this.conversation.sendMessage?.(message) // Uncomment if SDK supports this
      } catch (error) {
        console.error('❌ Failed to send message:', error)
      }
    } else {
      console.error('❌ Conversation not initialized')
      this.callbacks.onError(new Error('Cannot send message: conversation not initialized'))
    }
  }

  /**
   * End the interview session
   */
  endInterview(): void {
    try {
      // End conversation via SDK
      if (this.conversation) {
        this.conversation.endSession()
        this.conversation = null
      }

      // Stop media stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }

      // Close audio context
      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }

      console.log('🏁 Interview session ended')
      
    } catch (error) {
      console.error('❌ Error ending interview:', error)
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): InterviewSession['status'] | null {
    return this.session?.status || null
  }
}

// ===== FACTORY FUNCTION =====

export function createElevenLabsInterviewService(
  apiKey: string,
  agentId: string,
  callbacks: ElevenLabsCallbacks
): ElevenLabsInterviewService {
  const config: ElevenLabsConfig = {
    apiKey,
    agentId
  }
  
  return new ElevenLabsInterviewService(config, callbacks)
}

//git asd