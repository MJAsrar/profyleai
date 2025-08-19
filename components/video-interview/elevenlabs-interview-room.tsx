'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Phone,
  PhoneOff,
  MessageSquare,
  Volume2,
  Loader2,
  AlertCircle,
  Send,
  Settings,
  Monitor,
  User,
  Clock,
  Zap,
  Waves,
  CheckCircle2,
  Circle,
  Maximize,
  Minimize
} from 'lucide-react'
import { useElevenLabsInterviewStore, elevenLabsInterviewSelectors } from '@/lib/stores/elevenlabs-interview-store'
import { PracticeQuestion } from '@/lib/services/interview-service'
import { AiAvatar } from './ai-avatar'
import { SubtitleOverlay, useSubtitles } from './subtitle-overlay'

interface ElevenLabsInterviewRoomProps {
  sessionId: string
  jobTitle: string
  companyName: string
  jobDescription: string
  resumeData: any
  questions: PracticeQuestion[]
  onInterviewComplete: () => void
  onInterviewEnd: () => void
}

export function ElevenLabsInterviewRoom({ 
  sessionId, 
  jobTitle,
  companyName,
  jobDescription,
  resumeData,
  questions,
  onInterviewComplete, 
  onInterviewEnd 
}: ElevenLabsInterviewRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const {
    // Connection state
    connectionStatus,
    
    // Conversation state
    conversationHistory,
    isAgentSpeaking,
    isUserSpeaking,
    currentAudioUrl,
    
    // Analytics
    sessionStartTime,
    totalDuration,
    
    // Error handling
    lastError,
    errors,
    
    // Actions
    initializeInterview,
    endInterview,
    sendMessage,
    clearErrors,
    cleanup,
    setTranscriptCallbacks,
    addToConversationHistory
  } = useElevenLabsInterviewStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [textMessage, setTextMessage] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  
  // Subtitle management
  const {
    currentSubtitle,
    subtitleHistory,
    isEnabled: subtitlesEnabled,
    addAgentSubtitle,
    addUserSubtitle,
    toggleSubtitles
  } = useSubtitles()
  
  // Track agent messages for conversation history
  const [lastAgentMessage, setLastAgentMessage] = useState<string | null>(null)

  // Setup video stream with retry logic
  const setupVideoStream = async (stream: MediaStream): Promise<void> => {
    const maxRetries = 10
    let retryCount = 0
    
    const attemptVideoSetup = async (): Promise<boolean> => {
      // Try React ref first
      let videoElement = localVideoRef.current
      
      // Fallback to DOM query if ref not available
      if (!videoElement) {
        videoElement = document.querySelector('video') as HTMLVideoElement
        if (videoElement) {
          console.log(`📺 Found video element via DOM query on attempt ${retryCount + 1}`)
        }
      }
      
      if (!videoElement) {
        console.log(`📺 Video element not ready, attempt ${retryCount + 1}/${maxRetries}`)
        return false
      }
      
      if (!stream) {
        console.log('📺 Stream not available')
        return false
      }
      
      try {
        console.log('📺 Setting video srcObject...')
        videoElement.srcObject = stream
        
        // Ensure video properties are set
        videoElement.muted = true
        videoElement.playsInline = true
        videoElement.autoplay = true
        
        // Set up metadata loaded handler
        return new Promise<boolean>((resolve) => {
          const video = videoElement
          if (!video) {
            resolve(false)
            return
          }
          
          const handleLoadedMetadata = async () => {
            try {
              console.log('📺 Video metadata loaded, attempting to play...')
              await video.play()
              console.log('✅ Video is now playing')
              resolve(true)
            } catch (playError) {
              console.error('❌ Video play failed:', playError)
              resolve(false)
            }
          }
          
          const handleCanPlay = async () => {
            try {
              console.log('📺 Video can play, attempting to play...')
              await video.play()
              console.log('✅ Video is now playing')
              resolve(true)
            } catch (playError) {
              console.error('❌ Video play failed:', playError)
              resolve(false)
            }
          }
          
          // Try multiple event handlers
          video.onloadedmetadata = handleLoadedMetadata
          video.oncanplay = handleCanPlay
          
          // Fallback timeout
          setTimeout(() => {
            if (video.readyState >= 2) {
              video.play().then(() => {
                console.log('✅ Video force-play successful')
                resolve(true)
              }).catch(() => {
                console.log('❌ Video force-play failed')
                resolve(false)
              })
            } else {
              resolve(false)
            }
          }, 1000)
        })
      } catch (error) {
        console.error('❌ Error setting up video:', error)
        return false
      }
    }
    
    // Retry loop
    while (retryCount < maxRetries) {
      const success = await attemptVideoSetup()
      if (success) {
        console.log('✅ Video stream setup completed successfully')
        return
      }
      
      retryCount++
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200)) // Wait 200ms between retries
      }
    }
    
    console.error('❌ Failed to setup video after maximum retries')
  }

  // Initialize interview on component mount
  useEffect(() => {
    const initialize = async () => {
      if (!isMountedRef.current) return
      
      try {
        console.log('🎥 Initializing ElevenLabs interview room...')
        setIsInitializing(true)

        // Get user media for video display (audio handled by ElevenLabs)
        try {
          console.log('🎥 Requesting user media...')
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 320, ideal: 640, max: 1280 },
              height: { min: 240, ideal: 480, max: 720 },
              frameRate: { min: 15, ideal: 24, max: 30 }
            },
            audio: false // Audio handled by ElevenLabs service
          })

          console.log('📹 Got media stream:', stream)
          console.log('📹 Video tracks:', stream.getVideoTracks())
          
          setLocalStream(stream)
          setStreamError(null)

          console.log('✅ Video stream setup completed - will assign to video element when ready')
        } catch (videoError) {
          console.error('❌ Failed to get video stream:', videoError)
          setStreamError(`Failed to access camera: ${videoError instanceof Error ? videoError.message : String(videoError)}`)
        }//

        // Initialize ElevenLabs interview
        await initializeInterview(sessionId, jobTitle, companyName, jobDescription, resumeData, questions)

        console.log('✅ ElevenLabs interview room initialized')
        
      } catch (error) {
        console.error('❌ Failed to initialize interview room:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      
      cleanup()
    }
  }, [sessionId, jobTitle, companyName, jobDescription, resumeData, questions])

  // Handle video stream assignment when both stream and ref are available
  useEffect(() => {
    if (localStream && isVideoEnabled) {
      console.log('🔄 Stream and video enabled, attempting video setup...')
      
      // Try immediate assignment first
      if (localVideoRef.current) {
        console.log('📺 Video ref available immediately, setting up...')
        setupVideoStream(localStream)
      } else {
        // If ref not ready, try with increasing delays
        const attempts = [100, 300, 500, 1000, 2000]
        attempts.forEach((delay, index) => {
          setTimeout(() => {
            if (localVideoRef.current && !localVideoRef.current.srcObject) {
              console.log(`📺 Video ref available after ${delay}ms delay, setting up...`)
              setupVideoStream(localStream)
            }
          }, delay)
        })
      }
    }
  }, [localStream, isVideoEnabled])

  // Memoize transcript callback functions to prevent infinite re-renders
  const handleAgentTranscript = useCallback((transcript: string, timestamp: number, isComplete: boolean) => {
    console.log('📝 Agent transcript received:', transcript, 'Complete:', isComplete)
    addAgentSubtitle(transcript, timestamp, isComplete)
    
    // Track the full message for conversation history
    if (transcript.trim() && transcript !== lastAgentMessage) {
      setLastAgentMessage(transcript.trim())
      console.log('✅ Adding agent message to conversation:', transcript.trim())
      addToConversationHistory('agent', transcript.trim())
    }
  }, [addAgentSubtitle, addToConversationHistory, lastAgentMessage])

  const handleUserTranscript = useCallback((transcript: string, timestamp: number) => {
    console.log('📝 User transcript received:', transcript)
    addUserSubtitle(transcript, timestamp)
    
    // Add to conversation history (user transcripts are usually complete)
    if (transcript.trim()) {
      console.log('✅ Adding user message to conversation:', transcript.trim())
      addToConversationHistory('user', transcript.trim())
    }
  }, [addUserSubtitle, addToConversationHistory])

  // Setup subtitle callbacks - use refs to avoid stale closures
  const handleAgentTranscriptRef = useRef(handleAgentTranscript)
  const handleUserTranscriptRef = useRef(handleUserTranscript)
  
  // Update refs when callbacks change
  useEffect(() => {
    handleAgentTranscriptRef.current = handleAgentTranscript
    handleUserTranscriptRef.current = handleUserTranscript
  }, [handleAgentTranscript, handleUserTranscript])

  // Setup subtitle callbacks - only run once on mount and when sessionId changes
  useEffect(() => {
    const agentCallback = (transcript: string, timestamp: number, isComplete: boolean) => {
      handleAgentTranscriptRef.current(transcript, timestamp, isComplete)
    }
    
    const userCallback = (transcript: string, timestamp: number) => {
      handleUserTranscriptRef.current(transcript, timestamp)
    }
    
    setTranscriptCallbacks(agentCallback, userCallback)
  }, [sessionId, setTranscriptCallbacks]) // Only depend on sessionId and setTranscriptCallbacks

  // Handle audio playback
  useEffect(() => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl
      audioRef.current.play().catch(console.error)
    }
  }, [currentAudioUrl])

  // Handle interview end
  const handleEndInterview = () => {
    endInterview()
    onInterviewEnd()
  }

  // Send text message
  const handleSendMessage = () => {
    if (textMessage.trim()) {
      sendMessage(textMessage.trim())
      setTextMessage('')
    }
  }

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  // Toggle microphone (for display only - audio handled by ElevenLabs)
  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled)
  }

  // Toggle fullscreen video
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Calculate session duration with real-time updates
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  const sessionDuration = sessionStartTime 
    ? Math.floor((currentTime - sessionStartTime.getTime()) / 1000)
    : 0

  const minutes = Math.floor(sessionDuration / 60)
  const seconds = sessionDuration % 60

  // Get connection status display
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting': return { text: 'Connecting...', color: 'bg-yellow-500' }
      case 'connected': return { text: 'Connected', color: 'bg-green-500' }
      case 'speaking': return { text: 'AI Speaking...', color: 'bg-blue-500' }
      case 'listening': return { text: 'Listening...', color: 'bg-purple-500' }
      case 'ended': return { text: 'Interview Ended', color: 'bg-gray-500' }
      default: return { text: 'Disconnected', color: 'bg-red-500' }
    }
  }

  const statusDisplay = getConnectionStatusDisplay()

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Initializing interview room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base md:text-lg font-bold text-foreground">AI Interview</h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">{jobTitle} at {companyName}</p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
                <div className={`w-2 h-2 rounded-full ${statusDisplay.color} animate-pulse`} />
                <span className="text-sm font-medium text-foreground">{statusDisplay.text}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Session Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border/50">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono text-foreground">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* End Interview Button */}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleEndInterview}
                disabled={connectionStatus === 'ended'}
                className="shadow-sm text-xs md:text-sm px-2 md:px-3"
              >
                <PhoneOff className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">End Interview</span>
                <span className="sm:hidden">End</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Error Display */}
        {(lastError || streamError) && (
          <Alert className="mb-4 shadow-medium border-destructive/50 bg-destructive/5" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-foreground">
              {lastError || streamError}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 border-border/50 hover:bg-muted/50"
                onClick={clearErrors}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Video Call Layout */}
        <div className="h-[55vh] sm:h-[60vh] md:h-[50vh] lg:h-[55vh] mb-4 md:mb-6">
          <Card className="h-full card-elevated shadow-strong border-border/50">
            <CardContent className="p-0 h-full">
              <div className={`relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  {/* User Video Side */}
                  <div className="relative bg-gray-900 dark:bg-gray-950 md:border-r-2 border-b-2 md:border-b-0 border-gray-600/50 dark:border-gray-500/50">
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                      <div className="px-2 py-1 md:px-3 md:py-2 bg-black/70 backdrop-blur-sm rounded-lg border border-white/10">
                        <span className="text-white text-xs md:text-sm font-medium">You</span>
                      </div>
                    </div>
                    
                    {/* User Speaking Indicator */}
                    {isUserSpeaking && (
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                        <div className="px-2 py-1 md:px-3 md:py-2 bg-green-500/90 backdrop-blur-md rounded-lg border border-green-400/50">
                          <div className="flex items-center gap-1 md:gap-2">
                            <Waves className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse" />
                            <span className="text-white text-xs md:text-sm font-medium hidden sm:inline">Speaking</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* User Video */}
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      controls={false}
                      className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                        localStream && isVideoEnabled ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transform: 'scaleX(-1)', // Mirror the video like a selfie camera
                        backgroundColor: '#1f2937'
                      }}
                      onCanPlay={() => {
                        console.log('📺 Video can play event fired')
                        if (localVideoRef.current) {
                          localVideoRef.current.play().catch(console.error)
                        }
                      }}
                      onPlaying={() => console.log('📺 Video is playing')}
                      onError={(e) => console.error('📺 Video error:', e)}
                    />
                    
                    {/* Fallback when video is off or unavailable */}
                    {(!localStream || !isVideoEnabled) && (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                            <User className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <p className="text-base md:text-lg font-medium">Camera Off</p>
                          <p className="text-xs md:text-sm text-gray-400">
                            {streamError ? 'Camera access denied' : 'Video disabled'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* AI Avatar Side */}
                  <div className="relative bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,white_0%,transparent_50%)]"></div>
                    </div>
                    
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                      <div className="px-2 py-1 md:px-3 md:py-2 bg-black/70 backdrop-blur-sm rounded-lg border border-white/10">
                        <span className="text-white text-xs md:text-sm font-medium">Sarah (AI)</span>
                      </div>
                    </div>
                    
                    {/* AI Speaking Indicator */}
                    {isAgentSpeaking && (
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                        <div className="px-2 py-1 md:px-3 md:py-2 bg-blue-500/90 backdrop-blur-md rounded-lg border border-blue-400/50">
                          <div className="flex items-center gap-1 md:gap-2">
                            <Waves className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse" />
                            <span className="text-white text-xs md:text-sm font-medium hidden sm:inline">Speaking</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Large AI Avatar */}
                    <div className="flex items-center justify-center h-full">
                      <div className="scale-[2.5] sm:scale-[3] md:scale-[3.5] lg:scale-[4] z-10">
                        <AiAvatar 
                          isActive={connectionStatus === 'connected' || connectionStatus === 'speaking'}
                          isSpeaking={isAgentSpeaking}
                          name="Sarah"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
                    {/* Video Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleVideo}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${isVideoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white border-0`}
                    >
                      {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                    </Button>
                    
                    {/* Mic Toggle (Visual only) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMic}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${isMicEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white border-0`}
                    >
                      {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    
                    {/* Fullscreen Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Debug Info (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="absolute bottom-6 left-6">
                    <div className="px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs">
                      <div>Stream: {localStream ? '✅' : '❌'}</div>
                      <div>Video Enabled: {isVideoEnabled ? '✅' : '❌'}</div>
                      <div>Video Ref: {localVideoRef.current ? '✅' : '❌'}</div>
                      <div>Stream Error: {streamError || 'None'}</div>
                      <div>Agent Speaking: {isAgentSpeaking ? '✅' : '❌'}</div>
                      <div>Connection: {connectionStatus}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Conversation Panel */}
        <div className="h-[35vh] sm:h-[30vh] md:h-[40vh] lg:h-[35vh]">
          <Card className="h-full card-elevated shadow-strong border-border/50">
            <CardHeader className="pb-2 md:pb-3 border-b border-border/50 px-3 md:px-6 py-3 md:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
                <div className="flex items-center gap-3 md:gap-4">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg text-foreground">
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    Interview Conversation
                  </CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {conversationHistory.length} messages
                  </Badge>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Stats */}
                  <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="font-mono font-medium text-xs md:text-sm">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 hidden sm:flex">
                      <Zap className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">{questions.length} questions</span>
                    </div>
                  </div>
                  
                  {/* Text Input Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="flex items-center gap-1 md:gap-2 text-xs border-border/50 hover:bg-muted/50 px-2 md:px-3"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{showTextInput ? 'Hide Input' : 'Type Message'}</span>
                    <span className="sm:hidden">{showTextInput ? 'Hide' : 'Type'}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)]">
              <div className="grid grid-cols-1 h-full">
                {/* Conversation Messages */}
                <div className="overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 custom-scrollbar">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg font-medium">
                        Interview conversation will appear here
                      </p>
                      <p className="text-muted-foreground/70 text-sm mt-2">
                        Start speaking to begin your AI interview session
                      </p>
                    </div>
                  ) : (
                    conversationHistory.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex gap-4 ${
                          message.role === 'agent' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        {/* Avatar */}
                        {message.role === 'agent' && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-medium">
                              <span className="text-primary-foreground text-sm font-bold">AI</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Message Content */}
                        <div className={`max-w-xl md:max-w-2xl ${
                          message.role === 'agent' ? 'mr-auto' : 'ml-auto'
                        }`}>
                          <div className={`p-3 md:p-4 rounded-2xl shadow-soft border ${
                            message.role === 'agent' 
                              ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20' 
                              : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs md:text-sm font-semibold ${
                                message.role === 'agent' ? 'text-primary' : 'text-green-700 dark:text-green-300'
                              }`}>
                                <span className="hidden sm:inline">{message.role === 'agent' ? 'Sarah (AI Interviewer)' : 'You'}</span>
                                <span className="sm:hidden">{message.role === 'agent' ? 'AI' : 'You'}</span>
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed text-sm md:text-base">{message.content}</p>
                          </div>
                        </div>
                        
                        {/* User Avatar */}
                        {message.role === 'user' && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-medium">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {/* Text Input (Optional) */}
                {showTextInput && (
                  <div className="border-t border-border/50 p-4 bg-muted/30">
                    <div className="flex gap-3">
                      <textarea
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        placeholder="Type a message to the AI interviewer..."
                        className="flex-1 p-3 border border-border/50 rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 bg-background text-foreground"
                        rows={2}
                        disabled={connectionStatus !== 'connected'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!textMessage.trim() || connectionStatus !== 'connected'}
                        className="btn-gradient shadow-medium px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
