'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Phone,
  PhoneOff,
  Maximize2,
  Minimize2,
  MessageSquare,
  Activity,
  Volume2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useVideoInterviewStore, videoInterviewSelectors } from '@/lib/stores/video-interview-store'
import { PracticeQuestion } from '@/lib/services/interview-service'

interface VideoInterviewRoomProps {
  sessionId: string
  onInterviewComplete: () => void
  onInterviewEnd: () => void
}

export function VideoInterviewRoom({ 
  sessionId, 
  onInterviewComplete, 
  onInterviewEnd 
}: VideoInterviewRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const {
    // Session state
    session,
    isSessionActive,
    connectionStatus,
    
    // Media state
    localStream,
    remoteStream,
    isRecording,
    isMuted,
    isVideoDisabled,
    
    // Conversation state
    conversationHistory,
    currentTranscript,
    isAISpeaking,
    isProcessingResponse,
    
    // Interview progress
    currentQuestion,
    currentQuestionIndex,
    interviewPhase,
    questionsAsked,
    
    // Analytics
    audioAnalytics,
    candidateEngagement,
    stressLevel,
    confidenceLevel,
    
    // UI state
    showTranscript,
    showAnalytics,
    isFullscreen,
    
    // Errors
    lastError,
    
    // Actions
    toggleMute,
    toggleVideo,
    endSession,
    toggleTranscript,
    toggleAnalytics,
    toggleFullscreen,
    clearLastError,
    
    // Missing actions
    setProcessingResponse,
    setAISpeaking,
    updateCurrentTranscript,
    addConversationTurn,
    moveToNextQuestion
  } = useVideoInterviewStore()

  const [isEnding, setIsEnding] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const audioChunkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Initialize WebRTC connection on component mount
  useEffect(() => {
    let initializationAborted = false
    
    const initializeInterview = async () => {
      if (!session || initializationAborted) return
      
      try {
        console.log('🎥 Initializing video interview room...')
        
        // Import the store actions
        const { startSession } = useVideoInterviewStore.getState()
        
        // Check if already aborted before async operation
        if (initializationAborted) return
        
        // Start the interview session (this will initialize WebRTC if needed)
        await startSession()
        
        // Check if aborted after async operation
        if (initializationAborted || !isMountedRef.current) return
        
        // Set up audio chunk handling after session is started
        const { webrtcService } = useVideoInterviewStore.getState()
        if (webrtcService && !initializationAborted) {
          console.log('🎤 WebRTC service initialized, audio chunks will be handled by store callbacks')
        }
        
        // Start with AI welcome message
        if (!initializationAborted && isMountedRef.current) {
          initTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !initializationAborted) {
              startInterviewConversation()
            }
          }, 1000) // Give 1 second for everything to initialize
        }
        
        console.log('✅ Video interview room initialized')
      } catch (error) {
        if (initializationAborted) return // Don't process errors if aborted
        
        console.error('❌ Failed to initialize video interview:', error)
        
        // Add detailed error to store
        const { addError } = useVideoInterviewStore.getState()
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize interview'
        addError(`Initialization failed: ${errorMessage}`)
        
        // Set connection status to failed
        const { connectionStatus } = useVideoInterviewStore.getState()
        if (connectionStatus === 'connecting' && !initializationAborted) {
          // Force update connection status
          setTimeout(() => {
            const state = useVideoInterviewStore.getState()
            if (state.webrtcService && !initializationAborted) {
              state.webrtcService.cleanup()
            }
          }, 100)
        }
      } finally {
        if (isMountedRef.current && !initializationAborted) {
          setIsInitializing(false)
        }
      }
    }
    
    // Only initialize if we have a session and component is mounted
    if (session && isMountedRef.current) {
      initializeInterview()
    }
    
    // Cleanup function
    return () => {
      initializationAborted = true
    }
  }, [session?.sessionId]) // Only depend on sessionId to prevent unnecessary re-runs

  // Connect video streams to elements with error handling (prevent blinking)
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      // Only update if the stream actually changed
      if (localVideoRef.current.srcObject !== localStream) {
        try {
          console.log('🎥 Connecting local video stream')
          localVideoRef.current.srcObject = localStream
          
          // Ensure video plays
          const videoElement = localVideoRef.current
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch(console.error)
          }
          
        } catch (error) {
          console.error('❌ Failed to connect local video:', error)
        }
      }
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.onloadedmetadata = null
      }
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      // Only update if the stream actually changed
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        try {
          console.log('📹 Connecting remote video stream')
          remoteVideoRef.current.srcObject = remoteStream
          
          // Ensure video plays
          const videoElement = remoteVideoRef.current
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch(console.error)
          }
          
        } catch (error) {
          console.error('❌ Failed to connect remote video:', error)
        }
      }
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.onloadedmetadata = null
      }
    }
  }, [remoteStream])

  // Handle AI speech audio
  useEffect(() => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl
      audioRef.current.play().catch(console.error)
    }
  }, [currentAudioUrl])

  // Process audio chunks for transcription (debounced to prevent memory leaks)
  useEffect(() => {
    if (audioChunks.length === 0 || isProcessingAudio || !session || !isMountedRef.current) return
    
    // Clear any existing timeout
    if (audioChunkTimeoutRef.current) {
      clearTimeout(audioChunkTimeoutRef.current)
      audioChunkTimeoutRef.current = null
    }
    
    // Debounce processing to prevent excessive API calls
    audioChunkTimeoutRef.current = setTimeout(async () => {
      // Double-check if component is still mounted
      if (!isMountedRef.current || !session) return
      
      // Capture chunks at the time of timeout execution
      const chunksToProcess = [...audioChunks]
      if (chunksToProcess.length === 0) return
      
      const latestChunk = chunksToProcess[chunksToProcess.length - 1]
      
      // Clear chunks immediately to prevent reprocessing
      setAudioChunks([])
      setIsProcessingAudio(true)
      
      try {
        console.log('🎤 Processing audio chunk for transcription...')
        
        // Create form data for audio upload
        const formData = new FormData()
        formData.append('audio', latestChunk, 'audio.wav')
        
        // Send to transcription API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch(`/api/video-interview/${session.sessionId}/transcribe`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data.transcript && result.data.transcript.trim() && isMountedRef.current) {
          console.log('✅ Transcription received:', result.data.transcript)
          updateCurrentTranscript(result.data.transcript)
          
          // Generate AI response
          await generateAIResponse(result.data.transcript)
        }
        
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🎤 Audio processing aborted')
        } else {
          console.error('❌ Failed to process audio:', error)
        }
      } finally {
        if (isMountedRef.current) {
          setIsProcessingAudio(false)
          audioChunkTimeoutRef.current = null
        }
      }
    }, 1000) // Wait 1 second before processing to debounce
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      if (audioChunkTimeoutRef.current) {
        clearTimeout(audioChunkTimeoutRef.current)
        audioChunkTimeoutRef.current = null
      }
    }
  }, [audioChunks.length, session?.sessionId, isProcessingAudio]) // Stable dependencies

  // Generate AI response
  const generateAIResponse = async (transcript: string) => {
    if (!session || !currentQuestion) return
    
    try {
      console.log('🤖 Generating AI response...')
      if (!isMountedRef.current) return
      setProcessingResponse(true)
      
      const response = await fetch(`/api/video-interview/${session.sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          questionId: currentQuestion.id,
          responseStartTime: Date.now()
        })
      })
      
      const result = await response.json()
      
      if (result.success && isMountedRef.current) {
        console.log('✅ AI response generated:', result.data.aiResponse.text)
        
        // Convert base64 audio to URL
        if (result.data.audioBase64) {
          try {
            const audioBlob = new Blob(
              [Uint8Array.from(atob(result.data.audioBase64), c => c.charCodeAt(0))],
              { type: 'audio/mp3' }
            )
            const audioUrl = URL.createObjectURL(audioBlob)
            setCurrentAudioUrl(audioUrl)
            setAISpeaking(true)
            
            // Stop AI speaking when audio ends
            if (audioRef.current) {
              audioRef.current.onended = () => {
                setAISpeaking(false)
                URL.revokeObjectURL(audioUrl)
                setCurrentAudioUrl(null)
              }
            }
          } catch (audioError) {
            console.error('❌ Failed to play AI response audio:', audioError)
          }
        } else {
          console.warn('⚠️ No audio returned in AI response, continuing without speech')
        }
        
        // Add to conversation history
        addConversationTurn({
          role: 'user',
          content: transcript,
          timestamp: new Date()
        })
        addConversationTurn({
          role: 'assistant',
          content: result.data.aiResponse.text,
          timestamp: new Date()
        })
        
        // Move to next question if needed
        if (result.data.aiResponse.nextAction === 'next_question') {
          nextQuestionTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              moveToNextQuestion()
            }
          }, 2000) // Wait 2 seconds before next question
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to generate AI response:', error)
    } finally {
      if (isMountedRef.current) {
        setProcessingResponse(false)
      }
    }
  }

  // Start the interview conversation with AI welcome
  const startInterviewConversation = async () => {
    if (!session) return
    
    try {
      console.log('🤖 Starting interview conversation...')
      
      const jobTitle = session.jobData?.jobTitle || 'this position'
      const companyName = session.jobData?.companyName || 'the company'
      const firstQuestion = currentQuestion?.question || 'Tell me about yourself and why you\'re interested in this role.'
      
      const welcomeMessage = `Hello! I'm your AI interviewer today. I'm excited to learn more about you and your experience for the ${jobTitle} position at ${companyName}. Let's begin with our first question: ${firstQuestion}`
      
      console.log('🤖 Welcome message prepared:', welcomeMessage)
      
      // Generate welcome speech
      const response = await fetch(`/api/video-interview/${session.sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'START_INTERVIEW', // Clear signal for welcome message
          questionId: currentQuestion?.id || 'welcome',
          responseStartTime: Date.now()
        })
      })
      
      const result = await response.json()
      console.log('🤖 Welcome API response:', result)
      
      if (result.success) {
        // Add to conversation history first
        addConversationTurn({
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        })
        
        if (result.data.audioBase64) {
          console.log('🔊 Playing AI welcome message...')
          try {
            // Play AI welcome message
            const audioBlob = new Blob(
              [Uint8Array.from(atob(result.data.audioBase64), c => c.charCodeAt(0))],
              { type: 'audio/mp3' }
            )
            const audioUrl = URL.createObjectURL(audioBlob)
            setCurrentAudioUrl(audioUrl)
            setAISpeaking(true)
            
            if (audioRef.current) {
              audioRef.current.onended = () => {
                setAISpeaking(false)
                URL.revokeObjectURL(audioUrl)
                setCurrentAudioUrl(null)
                
                // Start recording after AI finishes speaking
                const { startRecording } = useVideoInterviewStore.getState()
                startRecording()
              }
            }
          } catch (audioError) {
            console.error('❌ Failed to play welcome audio:', audioError)
            // Start recording anyway if audio fails
            const { startRecording } = useVideoInterviewStore.getState()
            startRecording()
          }
        } else {
          console.warn('⚠️ No audio returned in welcome message, continuing without speech')
          // Start recording anyway
          const { startRecording } = useVideoInterviewStore.getState()
          startRecording()
        }
      } else {
        console.warn('⚠️ Welcome message API failed:', result)
        
        // Fallback: Add text to conversation history without audio
        addConversationTurn({
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        })
        
        // Start recording anyway
        const { startRecording } = useVideoInterviewStore.getState()
        startRecording()
      }
      
    } catch (error) {
      console.error('❌ Failed to start interview conversation:', error)
      // Fallback: start recording anyway
      const { startRecording } = useVideoInterviewStore.getState()
      startRecording()
    }
  }

  // Clean up audio URL and resources
  useEffect(() => {
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl)
      }
    }
  }, [currentAudioUrl])

  // Cleanup on component unmount
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true
    
    return () => {
      console.log('🧹 Cleaning up video interview room...')
      
      // Mark component as unmounted FIRST
      isMountedRef.current = false
      
      // Clear all timeouts
      const timeouts = [
        audioChunkTimeoutRef.current,
        initTimeoutRef.current,
        nextQuestionTimeoutRef.current
      ]
      
      timeouts.forEach(timeout => {
        if (timeout) {
          clearTimeout(timeout)
        }
      })
      
      // Reset timeout refs
      audioChunkTimeoutRef.current = null
      initTimeoutRef.current = null
      nextQuestionTimeoutRef.current = null
      
      // Clear audio chunks
      setAudioChunks([])
      
      // Revoke audio URLs
      if (currentAudioUrl) {
        try {
          URL.revokeObjectURL(currentAudioUrl)
        } catch (error) {
          console.warn('Failed to revoke audio URL:', error)
        }
      }
      
      // Cleanup WebRTC service
      try {
        const { webrtcService } = useVideoInterviewStore.getState()
        if (webrtcService) {
          webrtcService.cleanup()
        }
      } catch (error) {
        console.warn('Failed to cleanup WebRTC service:', error)
      }
    }
  }, []) // Empty dependency array - only run once on mount/unmount

  const handleEndInterview = async () => {
    setIsEnding(true)
    try {
      await endSession()
      onInterviewEnd()
    } catch (error) {
      console.error('Failed to end interview:', error)
    } finally {
      setIsEnding(false)
    }
  }

  const getProgressPercentage = () => {
    if (!session) return 0
    return (currentQuestionIndex / session.questions.length) * 100
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getEngagementColor = (level: number) => {
    if (level >= 0.8) return 'text-green-600'
    if (level >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Early return for invalid states
  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No interview session found. Please start a new interview.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check for WebRTC support before rendering
  if (typeof window !== 'undefined' && (!navigator?.mediaDevices?.getUserMedia)) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your browser doesn't support video interviews. Please use a modern browser like Chrome, Firefox, or Safari.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="font-medium">Initializing Interview</h3>
            <p className="text-sm text-muted-foreground">
              Setting up camera, microphone, and AI interviewer...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show connection error if initialization failed
  if (connectionStatus === 'failed' || connectionStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <div className="space-y-2">
            <h3 className="font-medium text-red-600">Connection Failed</h3>
            <p className="text-sm text-muted-foreground">
              Unable to access camera or microphone. Please check your browser permissions and try again.
            </p>
            {lastError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {lastError}
              </p>
            )}
          </div>
          <div className="space-x-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Retry
            </Button>
            <Button onClick={onInterviewEnd} variant="default">
              End Interview
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`video-interview-room ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
            
            <Badge variant={interviewPhase === 'main' ? 'default' : 'secondary'}>
              {interviewPhase === 'intro' ? 'Introduction' : 
               interviewPhase === 'warmup' ? 'Warm-up' :
               interviewPhase === 'main' ? 'Main Interview' : 'Conclusion'}
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTranscript}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Transcript
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnalytics}
            >
              <Activity className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <Alert className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {lastError}
            <Button variant="ghost" size="sm" onClick={clearLastError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Interviewer Video */}
            <Card className="relative">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg overflow-hidden aspect-video">
                  {/* AI Avatar Background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      {/* AI Avatar Circle */}
                      <div className={`relative mx-auto mb-4 ${isAISpeaking ? 'animate-pulse' : ''}`}>
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full flex items-center justify-center">
                            <svg 
                              className="w-12 h-12 text-white" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Audio Waves Animation */}
                        {isAISpeaking && (
                          <div className="absolute -inset-4 flex items-center justify-center">
                            <div className="flex space-x-1">
                              <div className="w-1 bg-blue-400 rounded-full animate-bounce" style={{ height: '20px', animationDelay: '0ms' }}></div>
                              <div className="w-1 bg-purple-400 rounded-full animate-bounce" style={{ height: '30px', animationDelay: '150ms' }}></div>
                              <div className="w-1 bg-indigo-400 rounded-full animate-bounce" style={{ height: '25px', animationDelay: '300ms' }}></div>
                              <div className="w-1 bg-blue-400 rounded-full animate-bounce" style={{ height: '20px', animationDelay: '450ms' }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* AI Name */}
                      <h3 className="text-xl font-semibold mb-2">AI Interviewer</h3>
                      <p className="text-blue-200 text-sm">
                        {isAISpeaking ? 'Speaking...' : 
                         isProcessingResponse ? 'Thinking...' : 
                         'Listening...'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hidden video element (kept for potential future use) */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="hidden w-full h-full object-cover"
                  />
                  
                  {/* AI Speaking Indicator */}
                  {isAISpeaking && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-500/90 backdrop-blur-sm">
                        <Volume2 className="h-3 w-3 mr-1" />
                        AI Speaking
                      </Badge>
                    </div>
                  )}
                  
                  {/* Processing Indicator */}
                  {isProcessingResponse && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-white text-center bg-black/50 rounded-lg p-6">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Processing your response...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Candidate Video (Picture-in-Picture) */}
            <div className="fixed bottom-20 right-4 w-48 h-36 z-10">
              <Card>
                <CardContent className="p-0">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ display: isVideoDisabled ? 'none' : 'block' }}
                    />
                    {isVideoDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CameraOff className="h-8 w-8 text-white" />
                      </div>
                    )}
                    
                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          REC
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* Current Question */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Current Question</h3>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion?.question || 'Loading...'}
                </p>
                {currentQuestion && (
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Real-time Analytics */}
            {showAnalytics && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Live Analytics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement</span>
                        <span className={getEngagementColor(candidateEngagement)}>
                          {Math.round(candidateEngagement * 100)}%
                        </span>
                      </div>
                      <Progress value={candidateEngagement * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Confidence</span>
                        <span className={getEngagementColor(confidenceLevel)}>
                          {Math.round(confidenceLevel * 100)}%
                        </span>
                      </div>
                      <Progress value={confidenceLevel * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stress Level</span>
                        <span className={stressLevel > 0.6 ? 'text-red-600' : 'text-green-600'}>
                          {Math.round(stressLevel * 100)}%
                        </span>
                      </div>
                      <Progress value={stressLevel * 100} className="h-2" />
                    </div>
                    
                    {audioAnalytics && (
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        <div>Volume: {Math.round(audioAnalytics.volume * 100)}%</div>
                        <div>Speaking: {audioAnalytics.isSpeaking ? 'Yes' : 'No'}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Transcript */}
            {showTranscript && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Live Transcript</h3>
                  <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                    {currentTranscript || 'Start speaking to see transcript...'}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Conversation History */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Conversation</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {conversationHistory.slice(-5).map((turn, index) => (
                    <div key={index} className="text-sm">
                      <div className={`font-medium ${
                        turn.role === 'user' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {turn.role === 'user' ? 'You:' : 'AI:'}
                      </div>
                      <div className="text-muted-foreground pl-2 border-l-2 border-muted">
                        {turn.content}
                      </div>
                    </div>
                  ))}
                  {conversationHistory.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Conversation will appear here...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleMute}
            className={isMuted ? 'bg-red-100 text-red-600' : ''}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={toggleVideo}
            className={isVideoDisabled ? 'bg-red-100 text-red-600' : ''}
          >
            {isVideoDisabled ? (
              <CameraOff className="h-5 w-5" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndInterview}
            disabled={isEnding}
          >
            {isEnding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PhoneOff className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            {isSessionActive ? 'Interview in progress' : 'Interview paused'} • 
            {questionsAsked} questions asked
          </p>
        </div>
      </div>

      {/* Hidden audio element for AI speech */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
