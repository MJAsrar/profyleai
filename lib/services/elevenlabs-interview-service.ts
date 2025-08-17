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
  onAgentTranscript?: (transcript: string, timestamp: number, isComplete: boolean) => void
  onUserTranscript?: (transcript: string, timestamp: number) => void
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
   * Setup conversation event listeners using official ElevenLabs SDK events
   */
  private setupConversationEventListeners(): void {
    if (!this.conversation) return

    try {
      // Update session status
      this.session!.status = 'connected'
      this.callbacks.onConnectionStateChange('connected')

      // Use official ElevenLabs SDK events for transcript handling
      this.setupSDKEventListeners()

      console.log('🔗 Event listeners setup complete with transcript handling')
      
    } catch (error) {
      console.error('❌ Failed to setup event listeners:', error)
    }
  }

  /**
   * Setup official ElevenLabs SDK event listeners for transcript handling
   */
  private setupSDKEventListeners(): void {
    if (!this.conversation) return

    try {
      console.log('📡 Setting up official ElevenLabs SDK event listeners...')

      // Cast conversation to any to access potential event methods
      const conversation = this.conversation as any

      // Listen for agent transcript events
      if (typeof conversation.on === 'function') {
        // Agent response (final transcript)
        conversation.on('agent_response', (event: any) => {
          console.log('🤖 Agent response event:', event)
          if (event?.text && this.callbacks.onAgentTranscript) {
            this.callbacks.onAgentTranscript(event.text, Date.now(), true)
          }
        })

        // Transcript events (general)
        conversation.on('transcript', (event: any) => {
          console.log('📝 Transcript event:', event)
          if (event?.text) {
            const isAgent = event.speaker === 'agent' || event.role === 'agent' || event.type === 'agent'
            if (isAgent && this.callbacks.onAgentTranscript) {
              const isComplete = event.isFinal !== false && event.is_final !== false
              this.callbacks.onAgentTranscript(event.text, Date.now(), isComplete)
            } else if (!isAgent && this.callbacks.onUserTranscript) {
              this.callbacks.onUserTranscript(event.text, Date.now())
            }
          }
        })

        // User transcript events
        conversation.on('user_transcript', (event: any) => {
          console.log('👤 User transcript event:', event)
          if (event?.text && this.callbacks.onUserTranscript) {
            this.callbacks.onUserTranscript(event.text, Date.now())
          }
        })

        // Tentative/partial agent responses
        conversation.on('internal_tentative_agent_response', (event: any) => {
          console.log('🤖 Tentative agent response:', event)
          if (event?.text && this.callbacks.onAgentTranscript) {
            const isComplete = event.isFinal === true || event.is_final === true
            this.callbacks.onAgentTranscript(event.text, Date.now(), isComplete)
          }
        })

        // Message events (catch-all)
        conversation.on('message', (event: any) => {
          console.log('📨 Message event:', event)
          this.parseSDKEvent(event, 'message')
        })

        // Error events
        conversation.on('error', (error: any) => {
          console.error('❌ SDK error event:', error)
          this.callbacks.onError(error)
        })

        console.log('✅ ElevenLabs SDK event listeners setup complete')
      } else {
        console.warn('⚠️ Conversation object does not support .on() method')
        console.log('🔍 Available methods:', Object.getOwnPropertyNames(this.conversation))
        
        // Fallback to alternative methods
        this.setupAlternativeTranscriptCapture()
      }

    } catch (error) {
      console.error('❌ Failed to setup SDK event listeners:', error)
      // Fallback to alternative methods
      this.setupAlternativeTranscriptCapture()
    }
  }



  /**
   * Alternative approach to capture transcripts when SDK events are not available
   */
  private setupAlternativeTranscriptCapture(): void {
    try {
      console.log('🔄 Setting up alternative transcript capture methods...')
      
      const conversation = this.conversation as any
      console.log('🔍 Conversation object methods:', Object.getOwnPropertyNames(conversation))
      console.log('🔍 Conversation prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(conversation)))
      
      // Try to find any event-like methods or properties
      const eventMethods = ['addEventListener', 'on', 'addListener', 'subscribe']
      const foundEventMethod = eventMethods.find(method => typeof conversation[method] === 'function')
      
      if (foundEventMethod) {
        console.log(`📡 Found event method: ${foundEventMethod}`)
        
        // Try common transcript event names
        const transcriptEvents = [
          'transcript', 'message', 'response', 'data',
          'agent_response', 'user_transcript', 'audio',
          'internal_tentative_agent_response'
        ]
        
        for (const eventName of transcriptEvents) {
          try {
            conversation[foundEventMethod](eventName, (event: any) => {
              console.log(`📡 Alternative event (${eventName}):`, event)
              this.parseSDKEvent(event, eventName)
            })
            console.log(`✅ Subscribed to ${eventName} via ${foundEventMethod}`)
          } catch (e) {
            // Event not supported, continue
          }
        }
      } else {
        console.log('⚠️ No event subscription methods found on conversation object')
        console.log('💡 Transcript capture will rely on existing callback system only')
      }
      
    } catch (error) {
      console.error('❌ Failed to setup alternative transcript capture:', error)
    }
  }

  /**
   * Parse events from SDK event system
   */
  private parseSDKEvent(event: any, eventType: string): void {
    try {
      if (!event || typeof event !== 'object') return
      
      // Look for transcript-like data in the event
      const possibleTextFields = ['text', 'content', 'transcript', 'message', 'data', 'response']
      
      for (const field of possibleTextFields) {
        if (event[field] && typeof event[field] === 'string') {
          console.log(`📝 Found transcript in ${eventType}.${field}:`, event[field])
          
          // Determine if this is likely an agent or user transcript
          const isAgent = eventType.includes('agent') || eventType.includes('response') || 
                          event.speaker === 'agent' || event.role === 'assistant'
          
          if (isAgent && this.callbacks.onAgentTranscript) {
            const isComplete = event.is_final !== false && event.complete !== false
            this.callbacks.onAgentTranscript(event[field], Date.now(), isComplete)
          } else if (!isAgent && this.callbacks.onUserTranscript) {
            this.callbacks.onUserTranscript(event[field], Date.now())
          }
          
          break // Only process the first text field found
        }
      }
    } catch (error) {
      console.error('❌ Error parsing SDK event:', error)
    }
  }

  /**
   * Prepare comprehensive dynamic variables from job and resume data
   * Handles all edge cases and missing data gracefully
   */
  private prepareDynamicVariables(
    jobTitle: string, 
    companyName: string, 
    jobDescription: string | undefined,
    questions: PracticeQuestion[],
    resumeData?: any
  ): Record<string, any> {
    try {
      // Safely extract personal information with multiple fallbacks
      const personalInfo = this.safeExtractPersonalInfo(resumeData)
      
      return {
        // Job information (always required)
        job_title: jobTitle || 'Position',
        company_name: companyName || 'Company',
        job_description: jobDescription || 'No specific job description provided',
        
        // Personal information with safe extraction
        candidate_name: personalInfo.name,
        candidate_email: personalInfo.email,
        candidate_phone: personalInfo.phone,
        candidate_location: personalInfo.location,
        candidate_linkedin: personalInfo.linkedin,
        candidate_portfolio: personalInfo.portfolio,
        
        // Professional summary with fallback
        candidate_summary: this.safeExtractSummary(resumeData),
        
        // Complete professional experience with error handling
        professional_experience: this.buildDetailedExperience(resumeData),
        total_experience_years: this.safeCalculateExperienceCount(resumeData),
        recent_role: this.buildRecentRole(resumeData),
        
        // Complete skills breakdown with error handling
        technical_skills: this.buildComprehensiveSkills(resumeData),
        skill_categories: this.buildSkillCategories(resumeData),
        
        // Education details with error handling
        education_background: this.buildEducationDetails(resumeData),
        
        // All projects with error handling
        projects_portfolio: this.buildAllProjects(resumeData),
        
        // Certifications with error handling
        certifications: this.buildCertifications(resumeData),
        
        // Interview questions with fallback
        interview_questions: this.buildQuestionsList(questions || []),
        
        // Additional context with safe calculations
        years_of_experience: this.calculateYearsOfExperience(resumeData),
        career_level: this.determineCareeerLevel(resumeData),
        industry_background: this.extractIndustryBackground(resumeData),
        
        // Data completeness indicators for the AI
        has_experience_data: this.hasExperienceData(resumeData),
        has_education_data: this.hasEducationData(resumeData),
        has_skills_data: this.hasSkillsData(resumeData),
        has_projects_data: this.hasProjectsData(resumeData),
        has_certifications_data: this.hasCertificationsData(resumeData),
        resume_completeness_level: this.calculateResumeCompleteness(resumeData)
      }
    } catch (error) {
      console.error('❌ Error preparing dynamic variables:', error)
      
      // Return minimal safe variables if everything fails
      return this.getMinimalSafeVariables(jobTitle, companyName, jobDescription, questions)
    }
  }

  /**
   * Build detailed professional experience with robust error handling
   */
  private buildDetailedExperience(resumeData: any): string {
    try {
      if (!resumeData?.experience || !Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
        return 'No professional experience information provided'
      }
      
      return resumeData.experience
        .filter((exp: any) => exp && (exp.jobTitle || exp.company)) // Only include valid entries
        .map((exp: any, index: number) => {
          try {
            const jobTitle = exp.jobTitle || exp.title || exp.position || 'Position'
            const company = exp.company || exp.employer || exp.organization || 'Company'
            
            const duration = exp.startDate && exp.endDate 
              ? `${exp.startDate} - ${exp.endDate}`
              : exp.startDate 
                ? `${exp.startDate} - Present`
                : exp.duration || 'Duration not specified'
                
            let expText = `${index + 1}. ${jobTitle} at ${company} (${duration})`
            
            if (exp.description || exp.summary) {
              expText += `\n   Description: ${exp.description || exp.summary}`
            }
            
            if (exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0) {
              const validAchievements = exp.achievements.filter((a: any) => a && typeof a === 'string')
              if (validAchievements.length > 0) {
                expText += `\n   Key Achievements: ${validAchievements.join('; ')}`
              }
            }
            
            if (exp.responsibilities && Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
              const validResponsibilities = exp.responsibilities.filter((r: any) => r && typeof r === 'string')
              if (validResponsibilities.length > 0) {
                expText += `\n   Key Responsibilities: ${validResponsibilities.slice(0, 3).join('; ')}`
              }
            }
            
            return expText
          } catch (expError) {
            console.warn('❌ Error processing experience entry:', expError)
            return `${index + 1}. Position at Company (Details unavailable)`
          }
        })
        .join('\n\n')
    } catch (error) {
      console.error('❌ Error building detailed experience:', error)
      return 'Professional experience information could not be processed'
    }
  }

  /**
   * Build comprehensive skills breakdown with error handling
   */
  private buildComprehensiveSkills(resumeData: any): string {
    try {
      if (!resumeData?.skills || !Array.isArray(resumeData.skills) || resumeData.skills.length === 0) {
        return 'No skills information provided'
      }
      
      return resumeData.skills
        .filter((skillGroup: any) => skillGroup && (skillGroup.category || skillGroup.skills))
        .map((skillGroup: any) => {
          try {
            const category = skillGroup.category || skillGroup.name || 'Uncategorized'
            
            let skills: string[] = []
            if (Array.isArray(skillGroup.skills)) {
              skills = skillGroup.skills.filter((skill: any) => skill && typeof skill === 'string')
            } else if (typeof skillGroup.skills === 'string') {
              skills = [skillGroup.skills]
            } else if (skillGroup.items && Array.isArray(skillGroup.items)) {
              skills = skillGroup.items.filter((skill: any) => skill && typeof skill === 'string')
            }
            
            const skillsText = skills.length > 0 ? skills.join(', ') : 'No specific skills listed'
            return `${category}: ${skillsText}`
          } catch (skillError) {
            console.warn('❌ Error processing skill group:', skillError)
            return 'Skill category: Details unavailable'
          }
        })
        .join('\n')
    } catch (error) {
      console.error('❌ Error building comprehensive skills:', error)
      return 'Skills information could not be processed'
    }
  }

  /**
   * Build skill categories summary
   */
  private buildSkillCategories(resumeData: any): string {
    if (!resumeData?.skills || resumeData.skills.length === 0) {
      return 'No skill categories available'
    }
    
    return resumeData.skills
      .map((skillGroup: any) => skillGroup.category || 'Uncategorized')
      .join(', ')
  }

  /**
   * Build education details
   */
  private buildEducationDetails(resumeData: any): string {
    if (!resumeData?.education || resumeData.education.length === 0) {
      return 'No education information provided'
    }
    
    return resumeData.education
      .map((edu: any, index: number) => {
        const degree = edu.degree || 'Degree'
        const institution = edu.institution || 'Institution'
        const graduationDate = edu.graduationDate || 'Date not specified'
        const gpa = edu.gpa ? ` (GPA: ${edu.gpa})` : ''
        
        let eduText = `${index + 1}. ${degree} from ${institution} (${graduationDate})${gpa}`
        
        if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
          eduText += `\n   Relevant Coursework: ${edu.relevantCoursework.join(', ')}`
        }
        
        return eduText
      })
      .join('\n\n')
  }

  /**
   * Build all projects with complete details
   */
  private buildAllProjects(resumeData: any): string {
    if (!resumeData?.projects || resumeData.projects.length === 0) {
      return 'No projects listed'
    }
    
    return resumeData.projects
      .map((project: any, index: number) => {
        const name = project.name || `Project ${index + 1}`
        const description = project.description || 'No description provided'
        const technologies = Array.isArray(project.technologies) 
          ? project.technologies.join(', ')
          : project.technologies || 'Technologies not specified'
        const url = project.url ? `\n   URL: ${project.url}` : ''
        const duration = project.duration ? `\n   Duration: ${project.duration}` : ''
        
        return `${index + 1}. ${name}\n   Description: ${description}\n   Technologies: ${technologies}${url}${duration}`
      })
      .join('\n\n')
  }

  /**
   * Build certifications and achievements
   */
  private buildCertifications(resumeData: any): string {
    if (!resumeData?.certifications || resumeData.certifications.length === 0) {
      return 'No certifications listed'
    }
    
    return resumeData.certifications
      .map((cert: any, index: number) => {
        const name = cert.name || `Certification ${index + 1}`
        const issuer = cert.issuer || 'Issuer not specified'
        const date = cert.date || 'Date not specified'
        const expiry = cert.expiryDate ? ` (Expires: ${cert.expiryDate})` : ''
        
        return `${index + 1}. ${name} from ${issuer} (${date})${expiry}`
      })
      .join('\n')
  }

  /**
   * Calculate years of experience
   */
  private calculateYearsOfExperience(resumeData: any): number {
    if (!resumeData?.experience || resumeData.experience.length === 0) {
      return 0
    }
    
    // Simple calculation based on number of positions
    // Could be enhanced to calculate actual years based on dates
    return resumeData.experience.length
  }

  /**
   * Determine career level
   */
  private determineCareeerLevel(resumeData: any): string {
    const experienceCount = resumeData?.experience?.length || 0
    const recentRole = resumeData?.experience?.[0]?.jobTitle?.toLowerCase() || ''
    
    if (recentRole.includes('senior') || recentRole.includes('lead') || recentRole.includes('principal')) {
      return 'Senior Level'
    } else if (recentRole.includes('junior') || experienceCount <= 2) {
      return 'Entry Level'
    } else if (experienceCount <= 5) {
      return 'Mid Level'
    } else {
      return 'Senior Level'
    }
  }

  /**
   * Extract industry background
   */
  private extractIndustryBackground(resumeData: any): string {
    if (!resumeData?.experience || resumeData.experience.length === 0) {
      return 'Industry background not available'
    }
    
    const companies = resumeData.experience
      .map((exp: any) => exp.company)
      .filter((company: any) => company)
      .slice(0, 3) // Last 3 companies
    
    return companies.length > 0 ? companies.join(', ') : 'Various companies'
  }

  /**
   * Build recent role summary for variables (kept for compatibility)
   */
  private buildRecentRole(resumeData: any): string {
    const recent = resumeData?.experience?.[0]
    if (!recent) return 'No recent role data'
    
    return `${recent.jobTitle} at ${recent.company} (${recent.startDate || 'Unknown'} - ${recent.endDate || 'Present'})`
  }

  /**
   * Build questions list for variables
   */
  private buildQuestionsList(questions: any[]): string {
    if (!Array.isArray(questions) || questions.length === 0) {
      return 'No specific questions prepared - will conduct general interview'
    }
    
    return questions
      .filter(q => q && q.question) // Filter out invalid questions
      .map((q: any, i: number) => `${i + 1}. ${q.question}`)
      .join('\n')
  }

  // ===== ENHANCED ERROR HANDLING METHODS =====

  /**
   * Safely extract personal information with multiple fallbacks
   */
  private safeExtractPersonalInfo(resumeData: any): {
    name: string, email: string, phone: string, location: string, linkedin: string, portfolio: string
  } {
    const personalInfo = resumeData?.personalInfo || {}
    
    return {
      name: personalInfo?.fullName || personalInfo?.name || personalInfo?.firstName 
        ? `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() 
        : 'there',
      email: personalInfo?.email || '',
      phone: personalInfo?.phone || personalInfo?.phoneNumber || '',
      location: personalInfo?.location || personalInfo?.address || personalInfo?.city 
        ? `${personalInfo.city || ''}, ${personalInfo.state || ''}`.trim().replace(/^,\s*/, '') 
        : '',
      linkedin: personalInfo?.linkedin || personalInfo?.linkedinUrl || '',
      portfolio: personalInfo?.portfolio || personalInfo?.website || personalInfo?.portfolioUrl || ''
    }
  }

  /**
   * Safely extract professional summary
   */
  private safeExtractSummary(resumeData: any): string {
    return resumeData?.summary || 
           resumeData?.professionalSummary || 
           resumeData?.objective || 
           'No professional summary provided'
  }

  /**
   * Safely calculate experience count
   */
  private safeCalculateExperienceCount(resumeData: any): number {
    try {
      if (!resumeData?.experience) return 0
      if (Array.isArray(resumeData.experience)) return resumeData.experience.length
      return 0
    } catch {
      return 0
    }
  }

  /**
   * Check if resume has experience data
   */
  private hasExperienceData(resumeData: any): boolean {
    return !!(resumeData?.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0)
  }

  /**
   * Check if resume has education data
   */
  private hasEducationData(resumeData: any): boolean {
    return !!(resumeData?.education && Array.isArray(resumeData.education) && resumeData.education.length > 0)
  }

  /**
   * Check if resume has skills data
   */
  private hasSkillsData(resumeData: any): boolean {
    return !!(resumeData?.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0)
  }

  /**
   * Check if resume has projects data
   */
  private hasProjectsData(resumeData: any): boolean {
    return !!(resumeData?.projects && Array.isArray(resumeData.projects) && resumeData.projects.length > 0)
  }

  /**
   * Check if resume has certifications data
   */
  private hasCertificationsData(resumeData: any): boolean {
    return !!(resumeData?.certifications && Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0)
  }

  /**
   * Calculate overall resume completeness level
   */
  private calculateResumeCompleteness(resumeData: any): string {
    if (!resumeData) return 'minimal'
    
    let score = 0
    const maxScore = 6
    
    // Basic info (1 point)
    if (resumeData.personalInfo?.fullName || resumeData.personalInfo?.name) score += 1
    
    // Professional summary (1 point)
    if (resumeData.summary || resumeData.professionalSummary) score += 1
    
    // Experience (1 point)
    if (this.hasExperienceData(resumeData)) score += 1
    
    // Skills (1 point)
    if (this.hasSkillsData(resumeData)) score += 1
    
    // Education (1 point)
    if (this.hasEducationData(resumeData)) score += 1
    
    // Projects or certifications (1 point)
    if (this.hasProjectsData(resumeData) || this.hasCertificationsData(resumeData)) score += 1
    
    if (score >= 5) return 'comprehensive'
    if (score >= 3) return 'moderate'
    if (score >= 1) return 'basic'
    return 'minimal'
  }

  /**
   * Get minimal safe variables when everything else fails
   */
  private getMinimalSafeVariables(
    jobTitle: string, 
    companyName: string, 
    jobDescription?: string, 
    questions?: any[]
  ): Record<string, any> {
    return {
      // Job information
      job_title: jobTitle || 'Position',
      company_name: companyName || 'Company',
      job_description: jobDescription || 'No job description provided',
      
      // Minimal candidate information
      candidate_name: 'there',
      candidate_email: '',
      candidate_phone: '',
      candidate_location: '',
      candidate_linkedin: '',
      candidate_portfolio: '',
      
      // Fallback content
      candidate_summary: 'No resume information available',
      professional_experience: 'No professional experience information provided',
      technical_skills: 'No skills information available',
      skill_categories: 'Skills information not available',
      education_background: 'No education information provided',
      projects_portfolio: 'No projects information available',
      certifications: 'No certifications listed',
      recent_role: 'No recent role information available',
      
      // Safe defaults
      total_experience_years: 0,
      years_of_experience: 0,
      career_level: 'Entry Level',
      industry_background: 'Background information not available',
      
      // Questions (even if minimal)
      interview_questions: Array.isArray(questions) && questions.length > 0 
        ? questions.map((q: any, i: number) => `${i + 1}. ${q?.question || 'General interview question'}`).join('\n')
        : 'Will conduct general interview questions based on the role',
      
      // Data availability flags
      has_experience_data: false,
      has_education_data: false,
      has_skills_data: false,
      has_projects_data: false,
      has_certifications_data: false,
      resume_completeness_level: 'minimal'
    }
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
      // Clean up any event listeners if needed
      console.log('🧹 Cleaning up transcript event listeners')

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