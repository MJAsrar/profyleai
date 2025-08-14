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
    clearLastError
  } = useVideoInterviewStore()

  const [isEnding, setIsEnding] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)

  // Initialize WebRTC connection on component mount
  useEffect(() => {
    const initializeInterview = async () => {
      if (!session) return
      
      try {
        console.log('🎥 Initializing video interview room...')
        
        // Import the store actions
        const { initializeWebRTC, startSession } = useVideoInterviewStore.getState()
        
        // Initialize WebRTC with audio chunk callback
        await initializeWebRTC()
        
        // Set up audio chunk handling
        const { webrtcService } = useVideoInterviewStore.getState()
        if (webrtcService) {
          // Override the audio chunk callback to capture audio for transcription
          const originalCallback = webrtcService.callbacks?.onAudioChunk
          if (webrtcService.callbacks) {
            webrtcService.callbacks.onAudioChunk = (chunk: Blob) => {
              console.log('🎤 Received audio chunk:', chunk.size, 'bytes')
              setAudioChunks(prev => [...prev.slice(-2), chunk]) // Keep only last 3 chunks
              if (originalCallback) originalCallback(chunk)
            }
          }
        }
        
        // Start the interview session
        await startSession()
        
        // Start with AI welcome message
        setTimeout(() => {
          startInterviewConversation()
        }, 2000) // Give 2 seconds for everything to initialize
        
        console.log('✅ Video interview room initialized')
      } catch (error) {
        console.error('❌ Failed to initialize video interview:', error)
        
        // Add detailed error to store
        const { addError } = useVideoInterviewStore.getState()
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize interview'
        addError(`Initialization failed: ${errorMessage}`)
        
        // Set connection status to failed
        const { connectionStatus } = useVideoInterviewStore.getState()
        if (connectionStatus === 'connecting') {
          // Force update connection status
          setTimeout(() => {
            const state = useVideoInterviewStore.getState()
            if (state.webrtcService) {
              state.webrtcService.cleanup()
            }
          }, 100)
        }
      } finally {
        setIsInitializing(false)
      }
    }
    
    initializeInterview()
  }, [session])

  // Connect video streams to elements with error handling
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      try {
        console.log('🎥 Connecting local video stream')
        localVideoRef.current.srcObject = localStream
        
        // Ensure video plays
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current?.play().catch(console.error)
        }
        
        // Handle stream ending
        localStream.addEventListener('inactive', () => {
          console.warn('⚠️ Local stream became inactive')
        })
        
      } catch (error) {
        console.error('❌ Failed to connect local video:', error)
      }
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      try {
        console.log('📹 Connecting remote video stream')
        remoteVideoRef.current.srcObject = remoteStream
        
        // Ensure video plays
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current?.play().catch(console.error)
        }
        
      } catch (error) {
        console.error('❌ Failed to connect remote video:', error)
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

  // Process audio chunks for transcription
  useEffect(() => {
    const processAudioChunk = async (chunk: Blob) => {
      if (!session || isProcessingAudio) return
      
      setIsProcessingAudio(true)
      
      try {
        console.log('🎤 Processing audio chunk for transcription...')
        
        // Create form data for audio upload
        const formData = new FormData()
        formData.append('audio', chunk, 'audio.wav')
        
        // Send to transcription API
        const response = await fetch(`/api/video-interview/${session.sessionId}/transcribe`, {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (result.success && result.data.transcript) {
          console.log('✅ Transcription received:', result.data.transcript)
          updateCurrentTranscript(result.data.transcript)
          
          // Generate AI response
          await generateAIResponse(result.data.transcript)
        }
        
      } catch (error) {
        console.error('❌ Failed to process audio:', error)
      } finally {
        setIsProcessingAudio(false)
      }
    }

    // Process latest audio chunk
    if (audioChunks.length > 0) {
      const latestChunk = audioChunks[audioChunks.length - 1]
      processAudioChunk(latestChunk)
    }
  }, [audioChunks, session, isProcessingAudio])

  // Generate AI response
  const generateAIResponse = async (transcript: string) => {
    if (!session || !currentQuestion) return
    
    try {
      console.log('🤖 Generating AI response...')
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
      
      if (result.success) {
        console.log('✅ AI response generated:', result.data.aiResponse.text)
        
        // Convert base64 audio to URL
        if (result.data.audioBase64) {
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
          setTimeout(() => {
            moveToNextQuestion()
          }, 2000) // Wait 2 seconds before next question
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to generate AI response:', error)
    } finally {
      setProcessingResponse(false)
    }
  }

  // Start the interview conversation with AI welcome
  const startInterviewConversation = async () => {
    if (!session) return
    
    try {
      console.log('🤖 Starting interview conversation...')
      
      const welcomeMessage = `Hello! I'm your AI interviewer today. I'm excited to learn more about you and your experience for the ${session.jobData.jobTitle} position at ${session.jobData.companyName}. Let's begin with our first question: ${currentQuestion?.question}`
      
      // Generate welcome speech
      const response = await fetch(`/api/video-interview/${session.sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'START_INTERVIEW',
          questionId: currentQuestion?.id || 'welcome',
          responseStartTime: Date.now()
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.data.audioBase64) {
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
        
        // Add to conversation history
        addConversationTurn({
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        })
      }
      
    } catch (error) {
      console.error('❌ Failed to start interview conversation:', error)
      // Fallback: start recording anyway
      const { startRecording } = useVideoInterviewStore.getState()
      startRecording()
    }
  }

  // Clean up audio URL
  useEffect(() => {
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl)
      }
    }
  }, [currentAudioUrl])

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
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* AI Speaking Indicator */}
                  {isAISpeaking && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-500">
                        <Volume2 className="h-3 w-3 mr-1" />
                        AI Speaking
                      </Badge>
                    </div>
                  )}
                  
                  {/* Processing Indicator */}
                  {isProcessingResponse && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Processing your response...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Candidate Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-48 h-36">
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
