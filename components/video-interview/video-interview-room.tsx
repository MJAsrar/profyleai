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

  // Connect video streams to elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Handle AI speech audio
  useEffect(() => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl
      audioRef.current.play().catch(console.error)
    }
  }, [currentAudioUrl])

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
