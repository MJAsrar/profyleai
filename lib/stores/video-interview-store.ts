'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { 
  VideoInterviewSession, 
  ConversationTurn, 
  InterviewContext, 
  AIResponse,
  TranscriptionResult,
  AudioAnalytics
} from '@/lib/services/video-interview-service'
import { WebRTCService, ConnectionState } from '@/lib/services/webrtc-service'
import { PracticeQuestion } from '@/lib/services/interview-service'

// ===== STORE TYPES =====

export interface VideoInterviewState {
  // Session data
  session: VideoInterviewSession | null
  isSessionActive: boolean
  
  // Connection state
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'closed'
  webrtcService: WebRTCService | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  
  // Media state
  isRecording: boolean
  isMuted: boolean
  isVideoDisabled: boolean
  recordingDuration: number
  
  // Conversation state
  conversationHistory: ConversationTurn[]
  currentTranscript: string
  isAISpeaking: boolean
  isProcessingResponse: boolean
  
  // Interview progress
  currentQuestionIndex: number
  currentQuestion: PracticeQuestion | null
  interviewPhase: 'intro' | 'warmup' | 'main' | 'conclusion'
  questionsAsked: number
  timeElapsed: number
  
  // Real-time analytics
  audioAnalytics: AudioAnalytics | null
  candidateEngagement: number
  stressLevel: number
  confidenceLevel: number
  
  // UI state
  showTranscript: boolean
  showAnalytics: boolean
  isFullscreen: boolean
  
  // Error handling
  errors: string[]
  lastError: string | null
  
  // Audio chunk handling
  audioChunkHandler: ((chunk: Blob) => void) | null
  
  // Voice Activity Detection
  isUserSpeaking: boolean
  userSpeechStartTime: number
  lastUserResponse: string
  waitingForUserResponse: boolean
  turnInProgress: boolean
}

export interface VideoInterviewActions {
  // Session management
  initializeSession: (session: VideoInterviewSession) => void
  startSession: () => Promise<void>
  endSession: () => Promise<void>
  pauseSession: () => void
  resumeSession: () => void
  
  // WebRTC management
  initializeWebRTC: () => Promise<void>
  connectPeer: () => Promise<void>
  disconnectPeer: () => void
  
  // Media controls
  toggleMute: () => void
  toggleVideo: () => void
  startRecording: () => void
  stopRecording: () => void
  switchCamera: (deviceId: string) => Promise<void>
  switchMicrophone: (deviceId: string) => Promise<void>
  
  // Conversation management
  addConversationTurn: (turn: ConversationTurn) => void
  updateCurrentTranscript: (transcript: string) => void
  setAISpeaking: (speaking: boolean) => void
  setProcessingResponse: (processing: boolean) => void
  
  // Interview progression
  moveToNextQuestion: () => void
  setCurrentQuestion: (question: PracticeQuestion) => void
  updateInterviewPhase: (phase: VideoInterviewState['interviewPhase']) => void
  
  // Analytics updates
  updateAudioAnalytics: (analytics: AudioAnalytics) => void
  updateEngagementMetrics: (engagement: number, stress: number, confidence: number) => void
  
  // UI controls
  toggleTranscript: () => void
  toggleAnalytics: () => void
  toggleFullscreen: () => void
  
  // Error handling
  addError: (error: string) => void
  clearErrors: () => void
  clearLastError: () => void
  
  // Audio chunk handling
  setAudioChunkHandler: (handler: ((chunk: Blob) => void) | null) => void
  
  // Voice Activity Detection
  onVoiceActivityStart: () => void
  onVoiceActivityEnd: () => void
  onTurnComplete: (audioData: Blob) => void
  setWaitingForUser: (waiting: boolean) => void
  
  // Cleanup
  cleanup: () => void
}

export type VideoInterviewStore = VideoInterviewState & VideoInterviewActions

// ===== INITIAL STATE =====

const initialState: VideoInterviewState = {
  // Session data
  session: null,
  isSessionActive: false,
  
  // Connection state
  connectionStatus: 'disconnected',
  webrtcService: null,
  localStream: null,
  remoteStream: null,
  
  // Media state
  isRecording: false,
  isMuted: false,
  isVideoDisabled: false,
  recordingDuration: 0,
  
  // Conversation state
  conversationHistory: [],
  currentTranscript: '',
  isAISpeaking: false,
  isProcessingResponse: false,
  
  // Interview progress
  currentQuestionIndex: 0,
  currentQuestion: null,
  interviewPhase: 'intro',
  questionsAsked: 0,
  timeElapsed: 0,
  
  // Real-time analytics
  audioAnalytics: null,
  candidateEngagement: 0.8,
  stressLevel: 0.3,
  confidenceLevel: 0.7,
  
  // UI state
  showTranscript: false,
  showAnalytics: false,
  isFullscreen: false,
  
  // Error handling
  errors: [],
  lastError: null,
  
  // Audio chunk handling
  audioChunkHandler: null,
  
  // Voice Activity Detection
  isUserSpeaking: false,
  userSpeechStartTime: 0,
  lastUserResponse: '',
  waitingForUserResponse: false,
  turnInProgress: false
}

// ===== STORE IMPLEMENTATION =====

export const useVideoInterviewStore = create<VideoInterviewStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ===== SESSION MANAGEMENT =====

      initializeSession: (session: VideoInterviewSession) => {
        set((state) => {
          state.session = session
          state.currentQuestion = session.questions[0] || null
          state.currentQuestionIndex = 0
          state.questionsAsked = 0
          state.timeElapsed = 0
          state.interviewPhase = 'intro'
          state.conversationHistory = []
          state.errors = []
          state.lastError = null
        })
      },

      startSession: async () => {
        const state = get()
        if (!state.session) {
          throw new Error('No session initialized')
        }

        try {
          set((draft) => {
            draft.isSessionActive = true
            draft.session!.status = 'active'
            draft.session!.startedAt = new Date()
          })

          // Update database status to active
          try {
            const response = await fetch(`/api/video-interview/${state.session.sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'active',
                startedAt: new Date().toISOString()
              })
            })
            
            if (!response.ok) {
              console.warn('⚠️ Failed to update session status in database:', response.status)
            } else {
              console.log('✅ Session status updated to active in database')
            }
          } catch (dbError) {
            console.warn('⚠️ Database update failed:', dbError)
            // Don't throw - continue with session even if DB update fails
          }

          // Initialize WebRTC if not already done
          if (!state.webrtcService) {
            await get().initializeWebRTC()
          }

          // Start recording
          get().startRecording()

          console.log('✅ Video interview session started')
        } catch (error) {
          set((draft) => {
            draft.isSessionActive = false
            draft.lastError = error instanceof Error ? error.message : 'Failed to start session'
            draft.errors.push(draft.lastError)
          })
          throw error
        }
      },

      endSession: async () => {
        const state = get()
        
        try {
          set((draft) => {
            draft.isSessionActive = false
            if (draft.session) {
              draft.session.status = 'completed'
              draft.session.completedAt = new Date()
            }
          })

          // Stop recording
          get().stopRecording()

          // Disconnect peer
          get().disconnectPeer()

          console.log('✅ Video interview session ended')
        } catch (error) {
          get().addError(error instanceof Error ? error.message : 'Failed to end session')
        }
      },

      pauseSession: () => {
        set((draft) => {
          draft.isSessionActive = false
          if (draft.session) {
            draft.session.status = 'scheduled' // Using scheduled as paused
          }
        })
        get().stopRecording()
      },

      resumeSession: () => {
        set((draft) => {
          draft.isSessionActive = true
          if (draft.session) {
            draft.session.status = 'active'
          }
        })
        get().startRecording()
      },

      // ===== WEBRTC MANAGEMENT =====

      initializeWebRTC: async () => {
        try {
          console.log('🔄 Starting WebRTC initialization...')
          
          // Check if WebRTC is supported
          if (typeof window === 'undefined') {
            throw new Error('WebRTC initialization requires browser environment')
          }
          
          if (!navigator?.mediaDevices?.getUserMedia) {
            throw new Error('WebRTC is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.')
          }

          // Check for required permissions before initializing
          try {
            const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })
            if (permissions.state === 'denied') {
              throw new Error('Camera permission is required for video interviews. Please enable camera access and refresh the page.')
            }
          } catch (permError) {
            // Permission API might not be available, continue with initialization
            console.warn('Permission check not available:', permError)
          }

          const callbacks = {
            onConnectionStateChange: (status: ConnectionState['status']) => {
              console.log('🔄 Connection status changed:', status)
              set((draft) => {
                draft.connectionStatus = status
              })
            },
            onLocalStream: (stream: MediaStream) => {
              console.log('📹 Local stream received')
              set((draft) => {
                draft.localStream = stream
              })
            },
            onRemoteStream: (stream: MediaStream) => {
              console.log('📹 Remote stream received')
              set((draft) => {
                draft.remoteStream = stream
              })
            },
            onAudioChunk: (chunk: Blob) => {
              // Handle audio chunk for transcription
              console.log('🎤 Received audio chunk:', chunk.size, 'bytes')
              
              // Call the audio chunk handler if it exists
              const state = get()
              if (state.audioChunkHandler) {
                state.audioChunkHandler(chunk)
              }
            },
            onError: (error: Error) => {
              console.error('🚨 WebRTC error:', error)
              get().addError(error.message)
              
              // Set connection status to failed on error
              set((draft) => {
                draft.connectionStatus = 'failed'
                draft.lastError = error.message
              })
            },
            onAudioAnalytics: (analytics: AudioAnalytics) => {
              get().updateAudioAnalytics(analytics)
            },
            onVoiceActivityStart: () => {
              get().onVoiceActivityStart()
            },
            onVoiceActivityEnd: () => {
              get().onVoiceActivityEnd()
            },
            onTurnComplete: (audioData: Blob) => {
              get().onTurnComplete(audioData)
            }
          }

          // Set status to connecting
          set((draft) => {
            draft.connectionStatus = 'connecting'
            draft.lastError = null // Clear previous errors
          })

          const webrtcService = new WebRTCService({}, callbacks)
          
          // Initialize media with timeout and retry logic
          let initAttempt = 0
          const maxAttempts = 3
          const attemptDelay = 1000 // 1 second between attempts
          
          while (initAttempt < maxAttempts) {
            try {
              const initPromise = webrtcService.initializeMedia()
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('WebRTC initialization timeout (10 seconds)')), 10000)
              })
              
              await Promise.race([initPromise, timeoutPromise])
              break // Success, exit retry loop
              
            } catch (attemptError) {
              initAttempt++
              console.warn(`WebRTC initialization attempt ${initAttempt} failed:`, attemptError)
              
              if (initAttempt >= maxAttempts) {
                throw attemptError // Final attempt failed, throw error
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, attemptDelay))
            }
          }
          
          set((draft) => {
            draft.webrtcService = webrtcService
            draft.connectionStatus = 'connected'
            draft.lastError = null
          })

          console.log('✅ WebRTC initialized successfully')
        } catch (error) {
          console.error('❌ WebRTC initialization failed:', error)
          let errorMessage = 'Failed to initialize WebRTC'
          
          if (error instanceof Error) {
            if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
              errorMessage = 'Camera/microphone permission denied. Please allow access and refresh the page.'
            } else if (error.message.includes('NotFoundError')) {
              errorMessage = 'No camera or microphone found. Please connect a device and refresh.'
            } else if (error.message.includes('timeout')) {
              errorMessage = 'Connection timeout. Please check your internet connection and try again.'
            } else {
              errorMessage = error.message
            }
          }
          
          set((draft) => {
            draft.connectionStatus = 'failed'
            draft.lastError = errorMessage
          })
          
          get().addError(errorMessage)
          throw new Error(errorMessage)
        }
      },

      connectPeer: async () => {
        const { webrtcService } = get()
        if (!webrtcService) {
          throw new Error('WebRTC service not initialized')
        }

        try {
          await webrtcService.createConnection()
        } catch (error) {
          get().addError(error instanceof Error ? error.message : 'Failed to connect')
          throw error
        }
      },

      disconnectPeer: () => {
        const { webrtcService } = get()
        if (webrtcService) {
          webrtcService.cleanup()
        }
        
        set((draft) => {
          draft.connectionStatus = 'disconnected'
          draft.localStream = null
          draft.remoteStream = null
        })
      },

      // ===== MEDIA CONTROLS =====

      toggleMute: () => {
        const { webrtcService, isMuted } = get()
        if (webrtcService) {
          webrtcService.toggleAudio(!isMuted)
          set((draft) => {
            draft.isMuted = !isMuted
          })
        }
      },

      toggleVideo: () => {
        const { webrtcService, isVideoDisabled } = get()
        if (webrtcService) {
          webrtcService.toggleVideo(!isVideoDisabled)
          set((draft) => {
            draft.isVideoDisabled = !isVideoDisabled
          })
        }
      },

      startRecording: () => {
        const { webrtcService } = get()
        if (webrtcService) {
          webrtcService.startRecording()
          set((draft) => {
            draft.isRecording = true
          })
        }
      },

      stopRecording: () => {
        const { webrtcService } = get()
        if (webrtcService) {
          webrtcService.stopRecording()
          set((draft) => {
            draft.isRecording = false
          })
        }
      },

      switchCamera: async (deviceId: string) => {
        const { webrtcService } = get()
        if (webrtcService) {
          try {
            await webrtcService.switchCamera(deviceId)
          } catch (error) {
            get().addError(error instanceof Error ? error.message : 'Failed to switch camera')
          }
        }
      },

      switchMicrophone: async (deviceId: string) => {
        const { webrtcService } = get()
        if (webrtcService) {
          try {
            await webrtcService.switchMicrophone(deviceId)
          } catch (error) {
            get().addError(error instanceof Error ? error.message : 'Failed to switch microphone')
          }
        }
      },

      // ===== CONVERSATION MANAGEMENT =====

      addConversationTurn: (turn: ConversationTurn) => {
        set((draft) => {
          draft.conversationHistory.push(turn)
          // Keep only last 20 turns for performance
          if (draft.conversationHistory.length > 20) {
            draft.conversationHistory = draft.conversationHistory.slice(-20)
          }
        })
      },

      updateCurrentTranscript: (transcript: string) => {
        set((draft) => {
          draft.currentTranscript = transcript
        })
      },

      setAISpeaking: (speaking: boolean) => {
        set((draft) => {
          draft.isAISpeaking = speaking
        })
      },

      setProcessingResponse: (processing: boolean) => {
        set((draft) => {
          draft.isProcessingResponse = processing
        })
      },

      generateAIResponse: async (userTranscript: string) => {
        const state = get()
        
        if (!state.session || !state.currentQuestion) {
          console.error('No active session or current question for AI response')
          return
        }

        try {
          set((draft) => {
            draft.isProcessingResponse = true
          })

          // Call the respond API
          const response = await fetch(`/api/video-interview/${state.session.sessionId}/respond`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              questionId: state.currentQuestion.id,
              transcript: userTranscript
            })
          })

          if (!response.ok) {
            throw new Error(`AI response failed: ${response.status}`)
          }

          const result = await response.json()
          
          if (result.success && result.data) {
            console.log('✅ AI response received:', result.data.response)
            
            // Add AI response to conversation history
            get().addConversationTurn({
              role: 'assistant',
              content: result.data.response,
              timestamp: new Date(),
              questionId: state.currentQuestion.id
            })

            // Play AI speech if available
            if (result.data.audioBase64) {
              await get().playAIResponse(result.data.audioBase64, result.data.response)
            } else {
              // No audio, just wait a bit then set waiting for user
              setTimeout(() => {
                get().setWaitingForUser(true)
              }, 1000)
            }

            // Check if we should move to next question
            if (result.data.shouldTransition) {
              setTimeout(() => {
                get().moveToNextQuestion()
                get().setWaitingForUser(true)
              }, 2000)
            }
          }
        } catch (error) {
          console.error('❌ Failed to generate AI response:', error)
          get().addError(error instanceof Error ? error.message : 'Failed to generate AI response')
          // Set waiting for user so they can try again
          get().setWaitingForUser(true)
        } finally {
          set((draft) => {
            draft.isProcessingResponse = false
          })
        }
      },

      playAIResponse: async (audioBase64: string, text: string) => {
        try {
          set((draft) => {
            draft.isAISpeaking = true
          })

          // Convert base64 to audio blob
          const audioBytes = atob(audioBase64)
          const audioArray = new Uint8Array(audioBytes.length)
          for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i)
          }
          const audioBlob = new Blob([audioArray], { type: 'audio/mp3' })
          const audioUrl = URL.createObjectURL(audioBlob)

          // Create and play audio
          const audio = new Audio(audioUrl)
          
          return new Promise<void>((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl)
              set((draft) => {
                draft.isAISpeaking = false
                draft.waitingForUserResponse = true
              })
              console.log('🔊 AI finished speaking, waiting for user response')
              resolve()
            }
            
            audio.onerror = (error) => {
              console.error('Audio playback error:', error)
              URL.revokeObjectURL(audioUrl)
              set((draft) => {
                draft.isAISpeaking = false
                draft.waitingForUserResponse = true
              })
              resolve()
            }
            
            audio.play().catch((error) => {
              console.error('Failed to play AI response:', error)
              URL.revokeObjectURL(audioUrl)
              set((draft) => {
                draft.isAISpeaking = false
                draft.waitingForUserResponse = true
              })
              resolve()
            })
          })
        } catch (error) {
          console.error('❌ Failed to play AI response:', error)
          set((draft) => {
            draft.isAISpeaking = false
            draft.waitingForUserResponse = true
          })
        }
      },

      // ===== INTERVIEW PROGRESSION =====

      moveToNextQuestion: () => {
        const { session, currentQuestionIndex } = get()
        if (!session) return

        const nextIndex = currentQuestionIndex + 1
        if (nextIndex < session.questions.length) {
          set((draft) => {
            draft.currentQuestionIndex = nextIndex
            draft.currentQuestion = session.questions[nextIndex]
            draft.questionsAsked += 1
          })
        } else {
          // Interview complete
          set((draft) => {
            draft.interviewPhase = 'conclusion'
          })
        }
      },

      setCurrentQuestion: (question: PracticeQuestion) => {
        set((draft) => {
          draft.currentQuestion = question
        })
      },

      updateInterviewPhase: (phase: VideoInterviewState['interviewPhase']) => {
        set((draft) => {
          draft.interviewPhase = phase
        })
      },

      // ===== ANALYTICS UPDATES =====

      updateAudioAnalytics: (analytics: AudioAnalytics) => {
        set((draft) => {
          draft.audioAnalytics = analytics
          
          // Update engagement based on speaking activity
          if (analytics.isSpeaking) {
            draft.candidateEngagement = Math.min(1.0, draft.candidateEngagement + 0.01)
          } else if (analytics.silenceDuration > 5000) { // 5 seconds of silence
            draft.candidateEngagement = Math.max(0.0, draft.candidateEngagement - 0.02)
          }
        })
      },

      updateEngagementMetrics: (engagement: number, stress: number, confidence: number) => {
        set((draft) => {
          draft.candidateEngagement = Math.max(0, Math.min(1, engagement))
          draft.stressLevel = Math.max(0, Math.min(1, stress))
          draft.confidenceLevel = Math.max(0, Math.min(1, confidence))
        })
      },

      // ===== UI CONTROLS =====

      toggleTranscript: () => {
        set((draft) => {
          draft.showTranscript = !draft.showTranscript
        })
      },

      toggleAnalytics: () => {
        set((draft) => {
          draft.showAnalytics = !draft.showAnalytics
        })
      },

      toggleFullscreen: () => {
        set((draft) => {
          draft.isFullscreen = !draft.isFullscreen
        })
      },

      // ===== ERROR HANDLING =====

      addError: (error: string) => {
        set((draft) => {
          draft.errors.push(error)
          draft.lastError = error
          // Keep only last 10 errors
          if (draft.errors.length > 10) {
            draft.errors = draft.errors.slice(-10)
          }
        })
      },

      clearErrors: () => {
        set((draft) => {
          draft.errors = []
          draft.lastError = null
        })
      },

      clearLastError: () => {
        set((draft) => {
          draft.lastError = null
        })
      },

      // ===== AUDIO CHUNK HANDLING =====

      setAudioChunkHandler: (handler: ((chunk: Blob) => void) | null) => {
        set((draft) => {
          draft.audioChunkHandler = handler
        })
      },

      // ===== VOICE ACTIVITY DETECTION =====

      onVoiceActivityStart: () => {
        console.log('🎤 User started speaking')
        set((draft) => {
          draft.isUserSpeaking = true
          draft.userSpeechStartTime = Date.now()
          draft.turnInProgress = true
          draft.waitingForUserResponse = false
        })
      },

      onVoiceActivityEnd: () => {
        console.log('🎤 User stopped speaking')
        set((draft) => {
          draft.isUserSpeaking = false
        })
      },

      onTurnComplete: async (audioData: Blob) => {
        const state = get()
        console.log('🎤 User turn complete, processing response...')
        
        if (!state.session || !state.isSessionActive) {
          console.warn('No active session for turn completion')
          return
        }

        try {
          set((draft) => {
            draft.turnInProgress = false
            draft.isProcessingResponse = true
          })

          // Convert audio blob to form data for transcription
          const formData = new FormData()
          formData.append('audio', audioData, 'audio.wav')

          // Send to transcription API
          const response = await fetch(`/api/video-interview/${state.session.sessionId}/transcribe`, {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`)
          }

          const result = await response.json()
          
          if (result.success && result.data.transcript && result.data.transcript.trim()) {
            console.log('✅ User response transcribed:', result.data.transcript)
            
            // Update transcript
            get().updateCurrentTranscript(result.data.transcript)
            
            // Add user turn to conversation history
            get().addConversationTurn({
              role: 'user',
              content: result.data.transcript,
              timestamp: new Date(),
              questionId: state.currentQuestion?.id
            })

            // Generate AI response
            await get().generateAIResponse(result.data.transcript)
          } else {
            console.warn('No valid transcript received')
            set((draft) => {
              draft.waitingForUserResponse = true
            })
          }
        } catch (error) {
          console.error('❌ Failed to process user turn:', error)
          get().addError(error instanceof Error ? error.message : 'Failed to process response')
          set((draft) => {
            draft.waitingForUserResponse = true
          })
        } finally {
          set((draft) => {
            draft.isProcessingResponse = false
          })
        }
      },

      setWaitingForUser: (waiting: boolean) => {
        set((draft) => {
          draft.waitingForUserResponse = waiting
        })
      },

      // ===== CLEANUP =====

      cleanup: () => {
        const { webrtcService } = get()
        
        // Stop recording and disconnect
        get().stopRecording()
        get().disconnectPeer()
        
        // Clean up WebRTC service
        if (webrtcService) {
          webrtcService.cleanup()
        }

        // Reset state
        set((draft) => {
          Object.assign(draft, initialState)
        })
      }
    }))
  )
)

// ===== SELECTORS =====

export const videoInterviewSelectors = {
  isConnected: (state: VideoInterviewStore) => state.connectionStatus === 'connected',
  isActive: (state: VideoInterviewStore) => state.isSessionActive,
  hasErrors: (state: VideoInterviewStore) => state.errors.length > 0,
  currentProgress: (state: VideoInterviewStore) => {
    if (!state.session) return 0
    return (state.currentQuestionIndex / state.session.questions.length) * 100
  },
  canProceed: (state: VideoInterviewStore) => 
    state.connectionStatus === 'connected' && 
    !state.isProcessingResponse && 
    !state.isAISpeaking,
  timeRemaining: (state: VideoInterviewStore) => {
    if (!state.session) return 0
    const estimatedTotal = state.session.questions.length * 3 * 60 // 3 minutes per question
    return Math.max(0, estimatedTotal - state.timeElapsed)
  }
}

// ===== SUBSCRIPTION HELPERS =====

export const subscribeToConnectionStatus = (callback: (status: string) => void) => {
  return useVideoInterviewStore.subscribe(
    (state) => state.connectionStatus,
    callback
  )
}

export const subscribeToInterviewProgress = (callback: (progress: number) => void) => {
  return useVideoInterviewStore.subscribe(
    (state) => videoInterviewSelectors.currentProgress(state),
    callback
  )
}

export const subscribeToErrors = (callback: (errors: string[]) => void) => {
  return useVideoInterviewStore.subscribe(
    (state) => state.errors,
    callback
  )
}
