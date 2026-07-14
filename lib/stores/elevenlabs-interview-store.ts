'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { ElevenLabsInterviewService, InterviewSession, createElevenLabsInterviewService } from '@/lib/services/elevenlabs-interview-service'
import { PracticeQuestion } from '@/lib/services/interview-service'

// ===== STORE TYPES =====

export interface ElevenLabsInterviewState {
  // Session data
  sessionId: string | null
  conversationId: string | null
  agentId: string | null
  
  // Connection state
  connectionStatus: InterviewSession['status'] | 'disconnected'
  interviewService: ElevenLabsInterviewService | null
  
  // Interview data
  jobTitle: string
  companyName: string
  jobDescription: string
  resumeData: any
  questions: PracticeQuestion[]
  
  // Conversation state
  conversationHistory: Array<{
    role: 'agent' | 'user'
    content: string
    timestamp: Date
  }>
  
  // Media state
  isAgentSpeaking: boolean
  isUserSpeaking: boolean
  currentAudioUrl: string | null
  currentAudioElement: HTMLAudioElement | null
  
  // Transcript callbacks (for subtitle integration)
  onAgentTranscript: ((transcript: string, timestamp: number, isComplete: boolean) => void) | null
  onUserTranscript: ((transcript: string, timestamp: number) => void) | null
  
  // Analytics
  sessionStartTime: Date | null
  sessionEndTime: Date | null
  totalDuration: number
  
  // Error handling
  lastError: string | null
  errors: string[]
}

export interface ElevenLabsInterviewActions {
  // Session management
  initializeInterview: (
    sessionId: string,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    resumeData: any,
    questions: PracticeQuestion[]
  ) => Promise<void>
  
  endInterview: () => void
  
  // Message handling
  sendMessage: (message: string) => void
  
  // State management
  setConnectionStatus: (status: InterviewSession['status'] | 'disconnected') => void
  setAgentSpeaking: (speaking: boolean) => void
  setUserSpeaking: (speaking: boolean) => void
  addToConversationHistory: (role: 'agent' | 'user', content: string) => void
  
  // Audio management
  setCurrentAudioUrl: (url: string | null) => void
  
  // Error handling
  addError: (error: string) => void
  clearErrors: () => void
  
  // Subtitle integration
  setTranscriptCallbacks: (
    onAgentTranscript: (transcript: string, timestamp: number, isComplete: boolean) => void,
    onUserTranscript: (transcript: string, timestamp: number) => void
  ) => void
  
  // Cleanup
  cleanup: () => void
}

export type ElevenLabsInterviewStore = ElevenLabsInterviewState & ElevenLabsInterviewActions

// ===== INITIAL STATE =====

const initialState: ElevenLabsInterviewState = {
  // Session data
  sessionId: null,
  conversationId: null,
  agentId: null,
  
  // Connection state
  connectionStatus: 'disconnected',
  interviewService: null,
  
  // Interview data
  jobTitle: '',
  companyName: '',
  jobDescription: '',
  resumeData: null,
  questions: [],
  
  // Conversation state
  conversationHistory: [],
  
  // Media state
  isAgentSpeaking: false,
  isUserSpeaking: false,
  currentAudioUrl: null,
  currentAudioElement: null,
  
  // Transcript callbacks
  onAgentTranscript: null,
  onUserTranscript: null,
  
  // Analytics
  sessionStartTime: null,
  sessionEndTime: null,
  totalDuration: 0,
  
  // Error handling
  lastError: null,
  errors: []
}

// ===== STORE IMPLEMENTATION =====

export const useElevenLabsInterviewStore = create<ElevenLabsInterviewStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ===== SESSION MANAGEMENT =====

      initializeInterview: async (
        sessionId: string,
        jobTitle: string,
        companyName: string,
        jobDescription: string,
        resumeData: any,
        questions: PracticeQuestion[]
      ) => {
        try {
          console.log('🚀 Initializing ElevenLabs interview...')

          // Only the public agent id is needed client-side. The secret API key is
          // never exposed to the browser (it was previously shipped in the bundle).
          const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

          if (!agentId) {
            throw new Error('ElevenLabs Agent ID not configured')
          }

          // Create service with callbacks
          const callbacks = {
            onConnectionStateChange: (status: InterviewSession['status']) => {
              get().setConnectionStatus(status)
            },
            
            onAgentSpeaking: (audio: ArrayBuffer, text: string) => {
              console.log('🤖 Agent speaking:', text)
              
              // Stop any currently playing audio first
              const currentState = get()
              if (currentState.currentAudioElement) {
                console.log('🔇 Stopping previous audio before playing new one')
                currentState.currentAudioElement.pause()
                currentState.currentAudioElement.src = ""
                if (currentState.currentAudioUrl) {
                  URL.revokeObjectURL(currentState.currentAudioUrl)
                }
              }
              
              // Send transcript to subtitle system
              const subtitleState = get()
              if (subtitleState.onAgentTranscript && text) {
                console.log('📝 Sending agent transcript to subtitles:', text)
                subtitleState.onAgentTranscript(text, Date.now(), true)
              }
              
              // Convert audio to playable URL
              const audioBlob = new Blob([audio], { type: 'audio/mpeg' })
              const audioUrl = URL.createObjectURL(audioBlob)
              
              // Create and track the audio element
              const audioElement = new Audio(audioUrl)
              
              // Store references for cleanup
              set((draft) => {
                draft.currentAudioUrl = audioUrl
                draft.isAgentSpeaking = true
              })
              
              // Store audio element outside of Immer draft to avoid type conflicts
              const storeState = get()
              storeState.currentAudioElement = audioElement
              
              get().addToConversationHistory('agent', text)
              
              audioElement.onended = () => {
                console.log('🤖 Agent finished speaking')
                set((draft) => {
                  draft.isAgentSpeaking = false
                  draft.currentAudioUrl = null
                })
                get().currentAudioElement = null
                URL.revokeObjectURL(audioUrl)
              }
              
              audioElement.onerror = (error) => {
                console.error('❌ Audio playback error:', error)
                set((draft) => {
                  draft.isAgentSpeaking = false
                  draft.currentAudioUrl = null
                })
                get().currentAudioElement = null
                URL.revokeObjectURL(audioUrl)
              }
              
              audioElement.play().catch((error) => {
                console.error('❌ Failed to play audio:', error)
                get().addError('Failed to play AI response audio')
                set((draft) => {
                  draft.isAgentSpeaking = false
                  draft.currentAudioUrl = null
                })
                get().currentAudioElement = null
                URL.revokeObjectURL(audioUrl)
              })
            },
            
            onUserSpeaking: () => {
              get().setUserSpeaking(true)
            },
            
            onConversationEnd: (summary: any) => {
              console.log('🏁 Conversation ended:', summary)
              set((draft) => {
                draft.sessionEndTime = new Date()
                draft.connectionStatus = 'ended'
                if (draft.sessionStartTime) {
                  draft.totalDuration = draft.sessionEndTime.getTime() - draft.sessionStartTime.getTime()
                }
              })
            },
            
            onError: (error: Error) => {
              console.error('❌ ElevenLabs error:', error)
              get().addError(error.message)
            },
            
            onAgentTranscript: (transcript: string, timestamp: number, isComplete: boolean) => {
              const state = get()
              if (state.onAgentTranscript) {
                state.onAgentTranscript(transcript, timestamp, isComplete)
              }
            },
            
            onUserTranscript: (transcript: string, timestamp: number) => {
              const state = get()
              if (state.onUserTranscript) {
                state.onUserTranscript(transcript, timestamp)
              }
            }
          }

          const service = createElevenLabsInterviewService(agentId, callbacks)

          // Update state
          set((draft) => {
            draft.sessionId = sessionId
            draft.jobTitle = jobTitle
            draft.companyName = companyName
            draft.jobDescription = jobDescription
            draft.resumeData = resumeData
            draft.questions = questions
            draft.interviewService = service
            draft.sessionStartTime = new Date()
            draft.agentId = agentId
          })

          // Initialize the service
          await service.initializeInterview(sessionId, jobTitle, companyName, questions, jobDescription, resumeData)

          console.log('✅ ElevenLabs interview initialized successfully')

        } catch (error) {
          console.error('❌ Failed to initialize interview:', error)
          get().addError(error instanceof Error ? error.message : 'Failed to initialize interview')
          throw error
        }
      },

      endInterview: () => {
        const { interviewService } = get()
        
        if (interviewService) {
          interviewService.endInterview()
        }

        set((draft) => {
          draft.sessionEndTime = new Date()
          draft.connectionStatus = 'ended'
          if (draft.sessionStartTime) {
            draft.totalDuration = draft.sessionEndTime.getTime() - draft.sessionStartTime.getTime()
          }
        })

        console.log('🏁 Interview ended')
      },

      // ===== MESSAGE HANDLING =====

      sendMessage: (message: string) => {
        const { interviewService } = get()
        
        if (interviewService) {
          interviewService.sendMessage(message)
          get().addToConversationHistory('user', message)
        } else {
          console.error('❌ Interview service not initialized')
          get().addError('Cannot send message: service not initialized')
        }
      },

      // ===== STATE MANAGEMENT =====

      setConnectionStatus: (status: InterviewSession['status'] | 'disconnected') => {
        set((draft) => {
          draft.connectionStatus = status
        })
      },

      setAgentSpeaking: (speaking: boolean) => {
        set((draft) => {
          draft.isAgentSpeaking = speaking
        })
      },

      setUserSpeaking: (speaking: boolean) => {
        set((draft) => {
          draft.isUserSpeaking = speaking
        })
      },

      addToConversationHistory: (role: 'agent' | 'user', content: string) => {
        set((draft) => {
          draft.conversationHistory.push({
            role,
            content,
            timestamp: new Date()
          })
        })
      },

      // ===== AUDIO MANAGEMENT =====

      setCurrentAudioUrl: (url: string | null) => {
        set((draft) => {
          // Clean up previous URL
          if (draft.currentAudioUrl && draft.currentAudioUrl !== url) {
            URL.revokeObjectURL(draft.currentAudioUrl)
          }
          draft.currentAudioUrl = url
        })
      },

      // ===== ERROR HANDLING =====

      addError: (error: string) => {
        set((draft) => {
          draft.errors.push(error)
          draft.lastError = error
        })
      },

      clearErrors: () => {
        set((draft) => {
          draft.errors = []
          draft.lastError = null
        })
      },

      // ===== SUBTITLE INTEGRATION =====

      setTranscriptCallbacks: (
        onAgentTranscript: (transcript: string, timestamp: number, isComplete: boolean) => void,
        onUserTranscript: (transcript: string, timestamp: number) => void
      ) => {
        set((draft) => {
          draft.onAgentTranscript = onAgentTranscript
          draft.onUserTranscript = onUserTranscript
        })
      },

      // ===== CLEANUP =====

      cleanup: () => {
        const { interviewService, currentAudioUrl, currentAudioElement } = get()
        
        console.log('🧹 Starting comprehensive interview cleanup...')
        
        // Stop the tracked audio element first
        if (currentAudioElement) {
          console.log('🔇 Stopping tracked audio element')
          currentAudioElement.pause()
          currentAudioElement.src = ""
          currentAudioElement.load()
        }
        
        // Stop all other audio elements that might be playing (fallback)
        const audioElements = document.querySelectorAll('audio')
        audioElements.forEach((audio) => {
          if (!audio.paused) {
            console.log('🔇 Stopping additional audio element from store cleanup')
            audio.pause()
            audio.src = ""
            audio.load()
          }
        })
        
        // End interview service
        if (interviewService) {
          interviewService.endInterview()
        }

        // Clean up audio URL
        if (currentAudioUrl) {
          URL.revokeObjectURL(currentAudioUrl)
        }

        // Reset state
        set((draft) => {
          Object.assign(draft, initialState)
        })
        
        console.log('✅ Interview cleanup completed')
      }
    }))
  )
)

// ===== SELECTORS =====

export const elevenLabsInterviewSelectors = {
  isConnected: (state: ElevenLabsInterviewStore) => state.connectionStatus === 'connected',
  isActive: (state: ElevenLabsInterviewStore) => 
    ['connected', 'speaking', 'listening'].includes(state.connectionStatus),
  hasErrors: (state: ElevenLabsInterviewStore) => state.errors.length > 0,
  conversationLength: (state: ElevenLabsInterviewStore) => state.conversationHistory.length,
  sessionDuration: (state: ElevenLabsInterviewStore) => {
    if (!state.sessionStartTime) return 0
    const endTime = state.sessionEndTime || new Date()
    return endTime.getTime() - state.sessionStartTime.getTime()
  }
}
