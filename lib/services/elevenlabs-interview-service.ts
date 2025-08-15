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
      
      // Connect to ElevenLabs WebSocket
      await this.connectWebSocket()
      
      // Send job context to agent after connection
      await this.sendJobContext(jobTitle, companyName, jobDescription, questions, resumeData)

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
          
          // Don't send context immediately - wait for conversation_initiation_metadata
          
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
          // Now we can send the context message
          this.sendInitialContext()
          break
          
        case 'conversation_initiation_metadata':
          console.log('🎤 Conversation initiated successfully')
          console.log('📊 Conversation metadata:', data.conversation_initiation_metadata_event)
          // Send contextual update with interview context first
          setTimeout(() => {
            this.sendContextualUpdate()
          }, 1000) // Wait 1 second
          // Then send user message to start the conversation
          setTimeout(() => {
            this.sendInitialUserMessage()
          }, 2000) // Wait 2 seconds
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
   * Send comprehensive job and resume context to the agent
   */
  private async sendJobContext(
    jobTitle: string, 
    companyName: string, 
    jobDescription: string | undefined,
    questions: PracticeQuestion[],
    resumeData?: any
  ): Promise<void> {
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Build comprehensive context message
    let contextMessage = `INTERVIEW_CONTEXT:

POSITION: ${jobTitle} at ${companyName}
${jobDescription ? `JOB DESCRIPTION: ${jobDescription.substring(0, 600)}` : ''}

`

    // Add candidate information if resume provided
    if (resumeData) {
      const candidateName = resumeData.personalInfo?.fullName || 'the candidate'
      const experienceCount = resumeData.experience?.length || 0
      const skillCategories = resumeData.skills?.map((s: any) => s.category).join(', ') || ''
      const recentExperience = resumeData.experience?.[0]
      
      contextMessage += `CANDIDATE: ${candidateName}

RESUME SUMMARY:
- Name: ${candidateName}
- Experience: ${experienceCount} previous positions
- Skills: ${skillCategories}
${resumeData.summary ? `- Summary: ${resumeData.summary.substring(0, 200)}` : ''}
${recentExperience ? `- Recent Role: ${recentExperience.jobTitle} at ${recentExperience.company}` : ''}

KEY PROJECTS:
${resumeData.projects?.slice(0, 2).map((p: any, i: number) => 
  `${i + 1}. ${p.name}: ${p.description?.substring(0, 100) || 'No description'}`
).join('\n') || 'No projects listed'}

`
    }

    contextMessage += `INTERVIEW QUESTIONS TO COVER:
${questions.slice(0, 6).map((q: PracticeQuestion, i: number) => `${i + 1}. ${q.question}`).join('\n')}

INSTRUCTIONS:
${resumeData ? 
  `1. Start with: "Hello ${resumeData.personalInfo?.fullName || 'there'}! I'm Sarah, your interviewer for the ${jobTitle} position at ${companyName}. I've had a chance to review your background and I'm excited to learn more about your experience."
2. Reference their specific experience naturally during the conversation
3. Ask targeted questions based on their resume and the job requirements
4. Keep responses conversational (1-3 sentences typically)
5. Show genuine interest in their background and projects` :
  `1. Start with: "Hello! I'm Sarah, your interviewer for the ${jobTitle} position at ${companyName}. I'm excited to learn more about your background and experience."
2. Ask engaging questions about their experience and skills
3. Keep responses conversational and natural`
}

Begin the interview now with your greeting.`

    // Store context for later sending after session_init_ack
    this.pendingContext = {
      jobTitle,
      companyName, 
      jobDescription,
      questions,
      resumeData
    }
  }

  /**
   * Send initial context after session is initialized
   */
  private sendInitialContext(): void {
    if (!this.pendingContext) return
    
    const { jobTitle, companyName, jobDescription, questions, resumeData } = this.pendingContext
    
    // Build comprehensive context message (same as before)
    let contextMessage = `INTERVIEW_CONTEXT:

POSITION: ${jobTitle} at ${companyName}
${jobDescription ? `JOB DESCRIPTION: ${jobDescription.substring(0, 600)}` : ''}

`

    // Add candidate information if resume provided
    if (resumeData) {
      const candidateName = resumeData.personalInfo?.fullName || 'the candidate'
      const experienceCount = resumeData.experience?.length || 0
      const skillCategories = resumeData.skills?.map((s: any) => s.category).join(', ') || ''
      const recentExperience = resumeData.experience?.[0]
      
      contextMessage += `CANDIDATE: ${candidateName}

RESUME SUMMARY:
- Name: ${candidateName}
- Experience: ${experienceCount} previous positions
- Skills: ${skillCategories}
${resumeData.summary ? `- Summary: ${resumeData.summary.substring(0, 200)}` : ''}
${recentExperience ? `- Recent Role: ${recentExperience.jobTitle} at ${recentExperience.company}` : ''}

KEY PROJECTS:
${resumeData.projects?.slice(0, 2).map((p: any, i: number) => 
  `${i + 1}. ${p.name}: ${p.description?.substring(0, 100) || 'No description'}`
).join('\n') || 'No projects listed'}

`
    }

    contextMessage += `INTERVIEW QUESTIONS TO COVER:
${questions.slice(0, 6).map((q: PracticeQuestion, i: number) => `${i + 1}. ${q.question}`).join('\n')}

INSTRUCTIONS:
${resumeData ? 
  `1. Start with: "Hello ${resumeData.personalInfo?.fullName || 'there'}! I'm Sarah, your interviewer for the ${jobTitle} position at ${companyName}. I've had a chance to review your background and I'm excited to learn more about your experience."
2. Reference their specific experience naturally during the conversation
3. Ask targeted questions based on their resume and the job requirements
4. Keep responses conversational (1-3 sentences typically)
5. Show genuine interest in their background and projects` :
  `1. Start with: "Hello! I'm Sarah, your interviewer for the ${jobTitle} position at ${companyName}. I'm excited to learn more about your background and experience."
2. Ask engaging questions about their experience and skills
3. Keep responses conversational and natural`
}

Begin the interview now with your greeting.`

    if (this.websocket?.readyState === WebSocket.OPEN) {
      const message = {
        type: "input_text",
        text: contextMessage
      }
      this.websocket.send(JSON.stringify(message))
      console.log('📋 Sent comprehensive job and resume context to agent')
    }
  }

  /**
   * Send contextual update with interview information
   */
  private sendContextualUpdate(): void {
    if (!this.pendingContext) {
      console.log('❌ No pending context to send')
      return
    }
    
    const { jobTitle, companyName, jobDescription, resumeData } = this.pendingContext
    
    // Send contextual information as background data
    let contextInfo = `Interview Context: ${jobTitle} position at ${companyName}.`
    
    if (resumeData) {
      const candidateName = resumeData.personalInfo?.fullName || 'Candidate'
      const experienceCount = resumeData.experience?.length || 0
      contextInfo += ` Candidate: ${candidateName}, ${experienceCount} previous positions.`
      
      if (resumeData.summary) {
        contextInfo += ` Summary: ${resumeData.summary.substring(0, 150)}.`
      }
    }

    if (this.websocket?.readyState === WebSocket.OPEN) {
      console.log('📋 Sending contextual update...')
      const message = {
        type: "contextual_update",
        text: contextInfo
      }
      this.websocket.send(JSON.stringify(message))
      console.log('📋 Sent contextual update:', contextInfo)
    } else {
      console.error('❌ WebSocket not ready to send contextual update')
    }
  }

  /**
   * Send initial user message to start the conversation
   */
  private sendInitialUserMessage(): void {
    if (!this.pendingContext) {
      console.log('❌ No pending context to send')
      return
    }
    
    const { resumeData } = this.pendingContext
    const candidateName = resumeData?.personalInfo?.fullName || 'there'
    
    // Simple user message to start the interview
    const userMessage = `Hello! I'm ready to start the interview.`

    if (this.websocket?.readyState === WebSocket.OPEN) {
      console.log('📋 Sending initial user message...')
      const message = {
        type: "user_message",
        text: userMessage
      }
      this.websocket.send(JSON.stringify(message))
      console.log('📋 Sent initial user message:', userMessage)
    } else {
      console.error('❌ WebSocket not ready to send user message')
    }
  }

  /**
   * Send a text message to the agent
   */
  sendMessage(message: string): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const textMessage = {
        type: "user_message",
        text: message
      }
      this.websocket.send(JSON.stringify(textMessage))
      console.log('💬 Sent message:', message)
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
