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
    setTranscriptCallbacks
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
          setStreamError(`Failed to access camera: ${videoError.message}`)
        }

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
  }, [addAgentSubtitle])

  const handleUserTranscript = useCallback((transcript: string, timestamp: number) => {
    console.log('📝 User transcript received:', transcript)
    addUserSubtitle(transcript, timestamp)
  }, [addUserSubtitle])

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

  // Calculate session duration
  const sessionDuration = sessionStartTime 
    ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AI Interview</h1>
                  <p className="text-sm text-gray-600">{jobTitle} at {companyName}</p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border">
                <div className={`w-2 h-2 rounded-full ${statusDisplay.color} animate-pulse`} />
                <span className="text-sm font-medium text-gray-700">{statusDisplay.text}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Session Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-mono text-gray-700">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* End Interview Button */}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleEndInterview}
                disabled={connectionStatus === 'ended'}
                className="shadow-sm"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pt-6">
        {/* Error Display */}
        {(lastError || streamError) && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {lastError || streamError}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={clearErrors}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          {/* Main Video Area */}
          <div className="xl:col-span-3">
            <Card className="h-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-0 h-full">
                <div className={`relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
                  {/* Video Stream */}
                  <div className="relative h-full">
                    {/* Always show video element, but conditionally style it */}
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      controls={false}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
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
                          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-10 h-10" />
                          </div>
                          <p className="text-lg font-medium">Camera Off</p>
                          <p className="text-sm text-gray-400">
                            {streamError ? 'Camera access denied' : 'Video disabled'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
                        {/* Video Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleVideo}
                          className={`w-12 h-12 rounded-full ${isVideoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white border-0`}
                        >
                          {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                        </Button>
                        
                        {/* Mic Toggle (Visual only) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMic}
                          className={`w-12 h-12 rounded-full ${isMicEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white border-0`}
                        >
                          {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>
                        
                        {/* Fullscreen Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleFullscreen}
                          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0"
                        >
                          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </Button>
                        
                        {/* Subtitles Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSubtitles}
                          className={`w-12 h-12 rounded-full ${subtitlesEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'} text-white border-0`}
                          title={subtitlesEnabled ? 'Hide Subtitles' : 'Show Subtitles'}
                        >
                          <MessageSquare className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* AI Avatar */}
                    <div className="absolute top-6 right-6">
                      <AiAvatar 
                        isActive={connectionStatus === 'connected' || connectionStatus === 'speaking'}
                        isSpeaking={isAgentSpeaking}
                        name="Sarah"
                      />
                    </div>

                    {/* User Speaking Indicator */}
                    {isUserSpeaking && (
                      <div className="absolute top-6 left-6">
                        <div className="px-4 py-3 bg-green-500/90 backdrop-blur-md rounded-2xl border border-green-400/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                              <Waves className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div className="text-white">
                              <p className="text-sm font-medium">You're speaking</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subtitle Overlay */}
                    <SubtitleOverlay
                      currentSubtitle={currentSubtitle}
                      isVisible={subtitlesEnabled}
                      position="bottom"
                    />

                    {/* Debug Info (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="absolute bottom-6 left-6">
                        <div className="px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs">
                          <div>Stream: {localStream ? '✅' : '❌'}</div>
                          <div>Video Enabled: {isVideoEnabled ? '✅' : '❌'}</div>
                          <div>Video Ref: {localVideoRef.current ? '✅' : '❌'}</div>
                          <div>Stream Error: {streamError || 'None'}</div>
                          <div>Subtitles: {subtitlesEnabled ? '✅' : '❌'}</div>
                          <div>Current Subtitle: {currentSubtitle ? '✅' : '❌'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-4 h-full overflow-y-auto">
            {/* Conversation History */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Conversation
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {conversationHistory.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        Conversation will appear here...
                      </p>
                    </div>
                  ) : (
                    conversationHistory.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-xl text-sm transition-all ${
                          message.role === 'agent' 
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500' 
                            : 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              message.role === 'agent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              {message.role === 'agent' ? 'AI' : 'You'}
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Interview Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    <div className="text-xs text-blue-700">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{conversationHistory.length}</div>
                    <div className="text-xs text-green-700">Messages</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-600 font-mono">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-purple-700">Duration</div>
                </div>
              </CardContent>
            </Card>

            {/* Text Input (Optional) */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Quick Message</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="h-7 text-xs"
                  >
                    {showTextInput ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              {showTextInput && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <textarea
                      value={textMessage}
                      onChange={(e) => setTextMessage(e.target.value)}
                      placeholder="Type a message (optional)..."
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      disabled={connectionStatus !== 'connected'}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!textMessage.trim() || connectionStatus !== 'connected'}
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
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
