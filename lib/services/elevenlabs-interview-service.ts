'use client'

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
  private websocket: WebSocket | null = null
  private session: InterviewSession | null = null
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private pendingContext: any = null

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
      console.log('🎤 Initializing ElevenLabs interview session...')

      // Create session
      this.session = {
        sessionId,
        conversationId: `conv_${Date.now()}`,
        agentId: this.config.agentId,
        status: 'connecting'
      }

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
      
      // Store job context first, before connecting
      await this.sendJobContext(jobTitle, companyName, jobDescription, questions, resumeData)
      
      // Connect to ElevenLabs WebSocket
      await this.connectWebSocket()

    } catch (error) {
      console.error('❌ Failed to initialize interview:', error)
      this.callbacks.onError(error as Error)
      throw error
    }
  }

  /**
   * Connect to ElevenLabs WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    try {
      // First, get the signed URL for the agent
      console.log('🔑 Getting signed WebSocket URL for agent:', this.config.agentId)
      
      const signedUrlResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${this.config.agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': this.config.apiKey,
          },
        }
      )
      
      if (!signedUrlResponse.ok) {
        const errorText = await signedUrlResponse.text()
        console.error('❌ Signed URL request failed:', signedUrlResponse.status, errorText)
        throw new Error(`Failed to get signed URL: ${signedUrlResponse.status} - ${errorText}`)
      }
      
      const signedUrlData = await signedUrlResponse.json()
      console.log('✅ Got signed URL response:', signedUrlData)
      const wsUrl = signedUrlData.signed_url
      
      if (!wsUrl) {
        throw new Error('No signed_url in response')
      }
      
      console.log('🔌 Connecting to ElevenLabs WebSocket with signed URL')
      
      return new Promise((resolve, reject) => {
        this.websocket = new WebSocket(wsUrl)

        this.websocket.onopen = () => {
          console.log('✅ Connected to ElevenLabs WebSocket (authenticated via signed URL)')
          
          this.session!.status = 'connected'
          this.callbacks.onConnectionStateChange('connected')
          this.startAudioStreaming()
          
          // Set conversation variables for context
          this.setConversationVariables()
          
          resolve()
        }

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event)
      }

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        this.callbacks.onError(new Error('WebSocket connection failed'))
        reject(error)
      }

      this.websocket.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        
        // Check if this was an unexpected closure
        if (event.code !== 1000) { // 1000 = normal closure
          console.error('❌ Unexpected WebSocket closure:', event.code, event.reason)
          this.callbacks.onError(new Error(`WebSocket closed unexpectedly: ${event.reason || event.code}`))
        }
        
        this.session!.status = 'ended'
        this.callbacks.onConnectionStateChange('ended')
      }
      })
    } catch (error) {
      console.error('❌ Failed to get signed WebSocket URL:', error)
      throw error
    }
  }

  /**
   * Handle WebSocket messages from ElevenLabs
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      console.log('📨 WebSocket message received:', data.type, data)
      
      switch (data.type) {
        case 'session_init_ack':
          console.log('🎤 Session initialization acknowledged')
          // Session is ready - no additional context messages needed
          break
          
        case 'conversation_initiation_metadata':
          console.log('🎤 Conversation initiated successfully')
          console.log('📊 Conversation metadata:', data.conversation_initiation_metadata_event)
          // Conversation is ready - agent will start based on system prompt and variables
          break
          
        case 'agent_response':
          console.log('🤖 Agent response:', data.agent_response)
          this.session!.status = 'speaking'
          this.callbacks.onConnectionStateChange('speaking')
          
          // Handle audio if present
          if (data.agent_response_audio_delta) {
            const audioBuffer = this.base64ToArrayBuffer(data.agent_response_audio_delta)
            this.callbacks.onAgentSpeaking(audioBuffer, data.agent_response)
          }
          break
          
        case 'user_transcript':
          console.log('👤 User said:', data.user_transcript)
          break
          
        case 'interruption':
          console.log('⚠️ Conversation interrupted')
          break
          
        case 'ping':
          // Respond to ping to keep connection alive
          if (this.websocket?.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'pong' }))
            console.log('🏓 Responded to ping')
          }
          break
          
        case 'conversation_end':
          console.log('🏁 Conversation ended by agent:', data)
          this.callbacks.onConversationEnd(data)
          break
          
        case 'error':
          console.error('❌ ElevenLabs error:', data)
          this.callbacks.onError(new Error(data.message || 'ElevenLabs API error'))
          break
          
        default:
          console.log('📨 Unknown message type:', data.type, data)
      }
    } catch (error) {
      console.error('❌ Error handling WebSocket message:', error, event.data)
    }
  }

  /**
   * Start streaming audio to ElevenLabs
   */
  private startAudioStreaming(): void {
    if (!this.mediaStream || !this.websocket) return

    try {
      // Create audio processor
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(this.mediaStream)
      
      // Create script processor for audio chunks
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      
      processor.onaudioprocess = (event) => {
        if (this.websocket?.readyState === WebSocket.OPEN) {
          const inputBuffer = event.inputBuffer.getChannelData(0)
          
          // Convert to 16-bit PCM
          const pcmData = new Int16Array(inputBuffer.length)
          for (let i = 0; i < inputBuffer.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputBuffer[i])) * 0x7FFF
          }
          
          // Send audio chunk to ElevenLabs
          const audioMessage = {
            user_audio_delta: this.arrayBufferToBase64(pcmData.buffer)
          }
          
          this.websocket.send(JSON.stringify(audioMessage))
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
      
      console.log('🎤 Audio streaming started')
      
    } catch (error) {
      console.error('❌ Failed to start audio streaming:', error)
      this.callbacks.onError(error as Error)
    }
  }

  /**
   * Store job and resume context for sending as variables
   */
  private async sendJobContext(
    jobTitle: string, 
    companyName: string, 
    jobDescription: string | undefined,
    questions: PracticeQuestion[],
    resumeData?: any
  ): Promise<void> {
    // Store context for sending as variables when WebSocket connects
    this.pendingContext = {
      jobTitle,
      companyName, 
      jobDescription,
      questions,
      resumeData
    }
    
    console.log('📋 Stored job and resume context for variable passing')
  }

  /**
   * Set conversation variables via ElevenLabs REST API
   */
  private async setConversationVariables(): Promise<void> {
    if (!this.pendingContext) {
      console.log('❌ No pending context to send as variables')
      return
    }
    
    const { jobTitle, companyName, jobDescription, questions, resumeData } = this.pendingContext
    
    // Prepare variables for ElevenLabs
    const variables = {
      job_title: jobTitle,
      company_name: companyName,
      job_description: jobDescription?.substring(0, 500) || 'No job description provided',
      candidate_name: resumeData?.personalInfo?.fullName || 'there',
      experience_summary: this.buildExperienceSummary(resumeData),
      key_skills: this.buildSkillsSummary(resumeData),
      recent_role: this.buildRecentRole(resumeData),
      notable_projects: this.buildProjectsSummary(resumeData),
      interview_questions: this.buildQuestionsList(questions)
    }

    try {
      // Try to set variables via REST API (if supported)
      console.log('📋 Attempting to set conversation variables via REST API...')
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/${this.session?.conversationId}/variables`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.config.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variables)
        }
      )
      
      if (response.ok) {
        console.log('✅ Successfully set conversation variables')
      } else {
        console.log('ℹ️ REST API variable setting not available, variables logged for manual configuration')
        console.log('📋 Context variables for manual setup:', variables)
      }
    } catch (error) {
      console.log('ℹ️ REST API variable setting not available, variables logged for manual configuration')
      console.log('📋 Context variables for manual setup:', variables)
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
   * Send a text message to the agent (converted to speech)
   */
  sendMessage(message: string): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      // For now, we'll log the message but not send it via WebSocket
      // since text messages use invalid message types
      // In a full implementation, you'd convert text to speech and send as audio
      console.log('💬 Text message (not sent via WebSocket):', message)
      console.log('ℹ️ To send text messages, implement text-to-speech conversion')
      
      // Alternative: You could implement text-to-speech here and send as audio
      // this.convertTextToSpeechAndSend(message)
    }
  }

  /**
   * End the interview session
   */
  endInterview(): void {
    try {
      // Close WebSocket
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
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

  // ===== UTILITY METHODS =====

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
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
