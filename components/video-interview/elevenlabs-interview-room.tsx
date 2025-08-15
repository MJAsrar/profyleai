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
  MessageSquare,
  Volume2,
  Loader2,
  AlertCircle,
  Send
} from 'lucide-react'
import { useElevenLabsInterviewStore, elevenLabsInterviewSelectors } from '@/lib/stores/elevenlabs-interview-store'
import { PracticeQuestion } from '@/lib/services/interview-service'

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
    cleanup
  } = useElevenLabsInterviewStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [textMessage, setTextMessage] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const isMountedRef = useRef(true)

  // Initialize interview on component mount
  useEffect(() => {
    const initialize = async () => {
      if (!isMountedRef.current) return
      
      try {
        console.log('🎥 Initializing ElevenLabs interview room...')
        setIsInitializing(true)

        // Get user media for video display (audio handled by ElevenLabs)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 320, ideal: 640, max: 1280 },
            height: { min: 240, ideal: 480, max: 720 },
            frameRate: { min: 15, ideal: 24, max: 30 }
          },
          audio: false // Audio handled by ElevenLabs service
        })

        setLocalStream(stream)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
              <p className="text-gray-600">{jobTitle} at {companyName}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Session Duration */}
              <div className="text-sm text-gray-600">
                Duration: {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusDisplay.color}`} />
                <span className="text-sm font-medium">{statusDisplay.text}</span>
              </div>
              
              {/* End Interview Button */}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleEndInterview}
                disabled={connectionStatus === 'ended'}
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {lastError && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {lastError}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                  {/* Local Video */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Local Video Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-white text-sm font-medium">You</p>
                    </div>
                  </div>

                  {/* AI Avatar/Status Overlay */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        {isAgentSpeaking ? (
                          <Volume2 className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                          <Mic className="w-5 h-5 text-white" />
                        )}
                        <div>
                          <h3 className="text-white font-semibold">AI Interviewer</h3>
                          <p className="text-blue-200 text-sm">
                            {isAgentSpeaking ? 'Speaking...' : 
                             connectionStatus === 'connected' ? 'Ready to listen' :
                             'Connecting...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Speaking Indicators */}
                  {isUserSpeaking && (
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-green-500/90 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          <span className="text-white text-sm font-medium">You're speaking</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Conversation History */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Conversation
                  </h3>
                  <Badge variant="outline">
                    {conversationHistory.length} messages
                  </Badge>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {conversationHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Conversation will appear here...
                    </p>
                  ) : (
                    conversationHistory.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded-lg text-sm ${
                          message.role === 'agent' 
                            ? 'bg-blue-50 border-l-2 border-blue-500' 
                            : 'bg-green-50 border-l-2 border-green-500'
                        }`}
                      >
                        <div className="font-medium text-xs mb-1">
                          {message.role === 'agent' ? '🤖 AI' : '👤 You'}
                          <span className="text-gray-500 ml-2">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Text Input (Optional) */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Text Input</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTextInput(!showTextInput)}
                  >
                    {showTextInput ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showTextInput && (
                  <div className="space-y-2">
                    <textarea
                      value={textMessage}
                      onChange={(e) => setTextMessage(e.target.value)}
                      placeholder="Type a message (optional)..."
                      className="w-full p-2 border rounded-lg resize-none"
                      rows={3}
                      disabled={connectionStatus !== 'connected'}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!textMessage.trim() || connectionStatus !== 'connected'}
                      size="sm"
                      className="w-full"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Progress */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Interview Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions Available:</span>
                    <span>{questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Messages Exchanged:</span>
                    <span>{conversationHistory.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
