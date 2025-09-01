"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Loader2,
  AlertCircle,
  Send,
  Monitor,
  User,
  Clock,
  Zap,
  Maximize,
  Minimize,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useElevenLabsInterviewStore } from "@/lib/stores/elevenlabs-interview-store"
import type { PracticeQuestion } from "@/lib/services/interview-service"
import { AiAvatar } from "./ai-avatar"
import { useSubtitles } from "./subtitle-overlay"

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
  onInterviewEnd,
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
    addToConversationHistory,
  } = useElevenLabsInterviewStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [textMessage, setTextMessage] = useState("")
  const [showTextInput, setShowTextInput] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  
  // Navigation guard state
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const router = useRouter()

  // Subtitle management
  const {
    currentSubtitle,
    subtitleHistory,
    isEnabled: subtitlesEnabled,
    addAgentSubtitle,
    addUserSubtitle,
    toggleSubtitles,
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
        videoElement = document.querySelector("video") as HTMLVideoElement
        if (videoElement) {
          console.log(`📺 Found video element via DOM query on attempt ${retryCount + 1}`)
        }
      }

      if (!videoElement) {
        console.log(`📺 Video element not ready, attempt ${retryCount + 1}/${maxRetries}`)
        return false
      }

      if (!stream) {
        console.log("📺 Stream not available")
        return false
      }

      try {
        console.log("📺 Setting video srcObject...")
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
              console.log("📺 Video metadata loaded, attempting to play...")
              await video.play()
              console.log("✅ Video is now playing")
              resolve(true)
            } catch (playError) {
              console.error("❌ Video play failed:", playError)
              resolve(false)
            }
          }

          const handleCanPlay = async () => {
            try {
              console.log("📺 Video can play, attempting to play...")
              await video.play()
              console.log("✅ Video is now playing")
              resolve(true)
            } catch (playError) {
              console.error("❌ Video play failed:", playError)
              resolve(false)
            }
          }

          // Try multiple event handlers
          video.onloadedmetadata = handleLoadedMetadata
          video.oncanplay = handleCanPlay

          // Fallback timeout
          setTimeout(() => {
            if (video.readyState >= 2) {
              video
                .play()
                .then(() => {
                  console.log("✅ Video force-play successful")
                  resolve(true)
                })
                .catch(() => {
                  console.log("❌ Video force-play failed")
                  resolve(false)
                })
            } else {
              resolve(false)
            }
          }, 1000)
        })
      } catch (error) {
        console.error("❌ Error setting up video:", error)
        return false
      }
    }

    // Retry loop
    while (retryCount < maxRetries) {
      const success = await attemptVideoSetup()
      if (success) {
        console.log("✅ Video stream setup completed successfully")
        return
      }

      retryCount++
      if (retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 200)) // Wait 200ms between retries
      }
    }

    console.error("❌ Failed to setup video after maximum retries")
  }

  // Cleanup function to stop all media streams and audio
  const cleanupMediaStreams = useCallback(() => {
    console.log("🧹 Cleaning up media streams and audio...")
    
    // Use current localStream state directly instead of closure
    const currentLocalStream = localStream
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach((track) => {
        console.log(`🔇 Stopping ${track.kind} track:`, track.label)
        track.stop()
      })
      setLocalStream(null)
    }
    
    // Clear video element source
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    
    // Stop any playing audio from the audio ref
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.load() // Reset the audio element
    }
    
    // Stop all Audio elements that might be playing from ElevenLabs
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach((audio) => {
      if (!audio.paused) {
        console.log("🔇 Stopping audio element")
        audio.pause()
        audio.src = ""
        audio.load()
      }
    })
    
    // Additional cleanup for any other video elements that might have been created
    const videoElements = document.querySelectorAll('video')
    videoElements.forEach((video) => {
      if (video.srcObject instanceof MediaStream) {
        console.log("🔇 Cleaning up additional video element")
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        video.srcObject = null
      }
    })
    
    console.log("✅ Media streams and audio cleanup completed")
  }, []) // Remove localStream dependency to prevent effect re-runs

  // Initialize interview on component mount
  useEffect(() => {
    const initialize = async () => {
      if (!isMountedRef.current) return

      try {
        console.log("🎥 Initializing ElevenLabs interview room...")
        setIsInitializing(true)

        // Start both video stream and interview initialization in parallel for faster loading
        const initPromises = []

        // 1. Get user media for video display (audio handled by ElevenLabs)
        const videoPromise = (async () => {
          try {
            console.log("🎥 Requesting user media...")
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { min: 320, ideal: 640, max: 1280 },
                height: { min: 240, ideal: 480, max: 720 },
                frameRate: { min: 15, ideal: 24, max: 30 },
              },
              audio: false, // Audio handled by ElevenLabs service
            })

            console.log("📹 Got media stream:", stream)
            console.log("📹 Video tracks:", stream.getVideoTracks())

            if (isMountedRef.current) {
              setLocalStream(stream)
              setStreamError(null)
              console.log("✅ Video stream setup completed")
            } else {
              // Component was unmounted while we were getting the stream
              stream.getTracks().forEach((track) => track.stop())
            }
          } catch (videoError) {
            console.error("❌ Failed to get video stream:", videoError)
            setStreamError(
              `Failed to access camera: ${videoError instanceof Error ? videoError.message : String(videoError)}`,
            )
          }
        })()

        // 2. Initialize ElevenLabs interview in parallel
        const interviewPromise = (async () => {
          if (isMountedRef.current) {
            console.log("🤖 Starting ElevenLabs interview initialization...")
            await initializeInterview(sessionId, jobTitle, companyName, jobDescription, resumeData, questions)
            console.log("✅ ElevenLabs interview initialized")
          }
        })()

        // Wait for both to complete, but don't block on video if it fails
        initPromises.push(interviewPromise)
        try {
          await videoPromise
        } catch (videoError) {
          console.log("📹 Video initialization failed, continuing with interview...")
        }

        // Wait for interview initialization to complete
        await Promise.all(initPromises)

        console.log("✅ Interview room initialization completed")
      } catch (error) {
        console.error("❌ Failed to initialize interview room:", error)
      } finally {
        if (isMountedRef.current) {
          setIsInitializing(false)
        }
      }
    }

    initialize()

    // Cleanup on unmount
    return () => {
      console.log("🧹 Component unmounting - cleaning up resources...")
      isMountedRef.current = false
      
      // Inline cleanup to avoid dependency issues
      console.log("🧹 Cleaning up media streams and audio...")
      
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          console.log(`🔇 Stopping ${track.kind} track:`, track.label)
          track.stop()
        })
      }
      
      // Clear video element source
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      
      // Stop any playing audio from the audio ref
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.load()
      }
      
      // Stop all Audio elements that might be playing from ElevenLabs
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach((audio) => {
        if (!audio.paused) {
          console.log("🔇 Stopping audio element")
          audio.pause()
          audio.src = ""
          audio.load()
        }
      })
      
      // Additional cleanup for any other video elements
      const videoElements = document.querySelectorAll('video')
      videoElements.forEach((video) => {
        if (video.srcObject instanceof MediaStream) {
          console.log("🔇 Cleaning up additional video element")
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
          video.srcObject = null
        }
      })
      
      console.log("✅ Media streams and audio cleanup completed")
      
      // Call store cleanup
      cleanup()
    }
  }, [sessionId]) // Only depend on sessionId to prevent re-runs during initialization

  // Handle page navigation and browser close events
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("🧹 Page unloading - cleaning up media resources...")
      
      // Inline cleanup for beforeunload
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      cleanup()
      
      // Standard way to show confirmation dialog (optional)
      if (connectionStatus === "connected" || connectionStatus === "speaking" || connectionStatus === "listening") {
        event.preventDefault()
        event.returnValue = "Your interview session is still active. Are you sure you want to leave?"
        return "Your interview session is still active. Are you sure you want to leave?"
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("🔍 Page hidden - interview session may need attention")
      } else {
        console.log("🔍 Page visible - interview session resumed")
      }
    }

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup event listeners
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [connectionStatus])

  // Navigation guard - intercept route changes
  useEffect(() => {
    // Store interview state globally for navigation guard
    const windowObj = window as any
    windowObj.__resumeAid_interviewActive = true
    windowObj.__resumeAid_showExitDialog = () => {
      setShowExitDialog(true)
      return false
    }
    windowObj.__resumeAid_setPendingNavigation = setPendingNavigation
    
    // Store cleanup function globally for emergency access
    windowObj.__resumeAid_cleanupVideo = () => {
      // Inline cleanup to avoid dependency issues
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
    
    return () => {
      // Remove global references on unmount
      delete windowObj.__resumeAid_interviewActive
      delete windowObj.__resumeAid_showExitDialog
      delete windowObj.__resumeAid_setPendingNavigation
      delete windowObj.__resumeAid_cleanupVideo
    }
  }, [])

  // Handle video stream assignment when both stream and ref are available
  useEffect(() => {
    if (localStream && isVideoEnabled) {
      console.log("🔄 Stream and video enabled, attempting video setup...")

      // Try immediate assignment first
      if (localVideoRef.current) {
        console.log("📺 Video ref available immediately, setting up...")
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
  const handleAgentTranscript = useCallback(
    (transcript: string, timestamp: number, isComplete: boolean) => {
      console.log("📝 Agent transcript received:", transcript, "Complete:", isComplete)
      addAgentSubtitle(transcript, timestamp, isComplete)

      // Track the full message for conversation history
      if (transcript.trim() && transcript !== lastAgentMessage) {
        setLastAgentMessage(transcript.trim())
        console.log("✅ Adding agent message to conversation:", transcript.trim())
        addToConversationHistory("agent", transcript.trim())
      }
    },
    [addAgentSubtitle, addToConversationHistory, lastAgentMessage],
  )

  const handleUserTranscript = useCallback(
    (transcript: string, timestamp: number) => {
      console.log("📝 User transcript received:", transcript)
      addUserSubtitle(transcript, timestamp)

      // Add to conversation history (user transcripts are usually complete)
      if (transcript.trim()) {
        console.log("✅ Adding user message to conversation:", transcript.trim())
        addToConversationHistory("user", transcript.trim())
      }
    },
    [addUserSubtitle, addToConversationHistory],
  )

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

  // Complete shutdown function
  const performCompleteShutdown = useCallback(() => {
    const logMessage = "🔚 Performing complete interview shutdown..."
    console.log(logMessage)
    
    // Mark as no longer active
    ;(window as any).__resumeAid_interviewActive = false
    
    // Clean up media streams first (inline to avoid dependency issues)
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        console.log(`🔇 Stopping ${track.kind} track:`, track.label)
        track.stop()
      })
      setLocalStream(null)
    }
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.load()
    }
    
    // Stop all Audio elements that might be playing from ElevenLabs
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach((audio) => {
      if (!audio.paused) {
        console.log("🔇 Stopping audio element")
        audio.pause()
        audio.src = ""
        audio.load()
      }
    })
    
    // Clear video element source
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    
    // End the interview session in store
    endInterview()
    
    // Call store cleanup
    cleanup()
    
    console.log("✅ Complete interview shutdown completed")
  }, [localStream, endInterview, cleanup])

  // Handle interview end
  const handleEndInterview = () => {
    performCompleteShutdown()
    onInterviewEnd()
  }

  // Handle exit dialog confirmation
  const handleExitConfirm = () => {
    console.log("✅ User confirmed exit - shutting down interview...")
    performCompleteShutdown()
    setShowExitDialog(false)
    
    // Navigate to pending route or dashboard
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
    } else {
      router.push('/dashboard')
    }
  }

  // Handle exit dialog cancellation
  const handleExitCancel = () => {
    console.log("❌ User cancelled exit")
    setShowExitDialog(false)
    setPendingNavigation(null)
  }

  // Send text message
  const handleSendMessage = () => {
    if (textMessage.trim()) {
      sendMessage(textMessage.trim())
      setTextMessage("")
    }
  }

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoEnabled
        console.log(`📹 Video track ${track.enabled ? 'enabled' : 'disabled'}:`, track.label)
      })
      setIsVideoEnabled(!isVideoEnabled)
      
      // If disabling video, clear the video element source
      if (isVideoEnabled && localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
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

  const sessionDuration = sessionStartTime ? Math.floor((currentTime - sessionStartTime.getTime()) / 1000) : 0

  const minutes = Math.floor(sessionDuration / 60)
  const seconds = sessionDuration % 60

  // Get connection status display
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case "connecting":
        return { text: "Connecting...", color: "bg-amber-500", pulse: true }
      case "connected":
        return { text: "Connected", color: "bg-emerald-500", pulse: false }
      case "speaking":
        return { text: "AI Speaking...", color: "bg-blue-500", pulse: true }
      case "listening":
        return { text: "Listening...", color: "bg-purple-500", pulse: true }
      case "ended":
        return { text: "Interview Ended", color: "bg-gray-500", pulse: false }
      default:
        return { text: "Disconnected", color: "bg-red-500", pulse: false }
    }
  }

  const statusDisplay = getConnectionStatusDisplay()

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="text-center p-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-pulse opacity-20"></div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Preparing Your Interview</h2>
          <p className="text-muted-foreground">Setting up the AI interviewer and video connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40 shadow-sm">
        <div className="content-container py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-foreground">AI Interview Session</h1>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {jobTitle} • {companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${statusDisplay.color} ${statusDisplay.pulse ? "animate-pulse" : ""}`}
                />
                <span className="text-sm font-medium text-foreground">{statusDisplay.text}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-mono font-semibold text-foreground">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndInterview}
                disabled={connectionStatus === "ended"}
                className="shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container py-6">
        {(lastError || streamError) && (
          <Alert
            className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 shadow-md"
            variant="destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-foreground flex items-center justify-between">
              <span>{lastError || streamError}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 bg-transparent"
                onClick={clearErrors}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="h-[60vh] lg:h-[65vh] mb-6">
          <Card className="h-full shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-0 h-full">
              <div
                className={`relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  <div className="relative bg-slate-900 dark:bg-slate-950 lg:border-r-2 border-b-2 lg:border-b-0 border-slate-600/30">
                    {/* User label with improved styling */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="px-3 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                        <span className="text-white text-sm font-semibold">You</span>
                      </div>
                    </div>

                    {isUserSpeaking && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-2 bg-emerald-500/90 backdrop-blur-md rounded-lg border border-emerald-400/50 shadow-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                              <div
                                className="w-1 h-4 bg-white rounded-full animate-pulse"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-1 h-4 bg-white rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium hidden sm:inline">Speaking</span>
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
                       className={`w-full h-full object-contain object-center transition-all duration-500 ${
                         localStream && isVideoEnabled ? "opacity-100 scale-100" : "opacity-0 scale-105"
                       }`}
                       style={{
                         transform: "scaleX(-1)", // Mirror the video like a selfie camera
                         backgroundColor: "#1f2937",
                       }}
                      onCanPlay={() => {
                        console.log("📺 Video can play event fired")
                        if (localVideoRef.current) {
                          localVideoRef.current.play().catch(console.error)
                        }
                      }}
                      onPlaying={() => console.log("📺 Video is playing")}
                      onError={(e) => console.error("📺 Video error:", e)}
                    />

                                         {(!localStream || !isVideoEnabled) && (
                       <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                         <div className="text-center text-white p-4">
                           <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                             <User className="w-8 h-8" />
                           </div>
                           <p className="text-base font-semibold mb-1">Camera Off</p>
                           <p className="text-xs text-slate-300">
                             {streamError ? "Camera access denied" : "Video disabled"}
                           </p>
                         </div>
                       </div>
                     )}
                  </div>

                  <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center overflow-hidden">
                    {/* Enhanced background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.05)_60deg,transparent_120deg)]"></div>
                    </div>

                    {/* AI label with improved styling */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="px-3 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
                        <span className="text-white text-sm font-semibold">Sarah (AI)</span>
                      </div>
                    </div>

                    {isAgentSpeaking && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-2 bg-blue-500/90 backdrop-blur-md rounded-lg border border-blue-400/50 shadow-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                              <div
                                className="w-1 h-4 bg-white rounded-full animate-pulse"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-1 h-4 bg-white rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium hidden sm:inline">Speaking</span>
                          </div>
                        </div>
                      </div>
                    )}

                                         <div className="flex items-center justify-center h-full relative z-10 p-6">
                       <div className="scale-[1.8] sm:scale-[2] lg:scale-[2.2] xl:scale-[2.4] transform transition-transform duration-300">
                         <AiAvatar
                           isActive={connectionStatus === "connected" || connectionStatus === "speaking"}
                           isSpeaking={isAgentSpeaking}
                           name="Sarah"
                         />
                       </div>
                     </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-3 px-6 py-3 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                    {/* Video Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleVideo}
                      className={`w-12 h-12 rounded-full transition-all duration-200 ${
                        isVideoEnabled
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                      } border-0`}
                    >
                      {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                    </Button>

                    {/* Mic Toggle (Visual only) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMic}
                      className={`w-12 h-12 rounded-full transition-all duration-200 ${
                        isMicEnabled
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                      } border-0`}
                    >
                      {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>

                    {/* Fullscreen Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-200"
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Debug Info (only in development) */}
                {process.env.NODE_ENV === "development" && (
                  <div className="absolute bottom-6 left-6">
                    <div className="px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs">
                      <div>Stream: {localStream ? "✅" : "❌"}</div>
                      <div>Video Enabled: {isVideoEnabled ? "✅" : "❌"}</div>
                      <div>Video Ref: {localVideoRef.current ? "✅" : "❌"}</div>
                      <div>Stream Error: {streamError || "None"}</div>
                      <div>Agent Speaking: {isAgentSpeaking ? "✅" : "❌"}</div>
                      <div>Connection: {connectionStatus}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-[35vh] lg:h-[30vh]">
          <Card className="h-full shadow-xl border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-foreground">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    Interview Conversation
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  >
                    {conversationHistory.length} messages
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="font-mono font-semibold text-foreground">
                        {minutes}:{seconds.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hidden sm:flex">
                      <Zap className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-foreground">{questions.length} questions</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    <Send className="w-4 h-4" />
                    {showTextInput ? "Hide Input" : "Type Message"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-5rem)]">
              <div className="grid grid-cols-1 h-full">
                <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <MessageSquare className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Begin</h3>
                      <p className="text-muted-foreground text-lg">
                        Your conversation with the AI interviewer will appear here
                      </p>
                      <p className="text-muted-foreground/70 text-sm mt-2">
                        Start speaking to begin your interview session
                      </p>
                    </div>
                  ) : (
                    conversationHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 ${message.role === "agent" ? "justify-start" : "justify-end"}`}
                      >
                        {message.role === "agent" && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                              <span className="text-white text-sm font-bold">AI</span>
                            </div>
                          </div>
                        )}

                        <div className={`max-w-2xl ${message.role === "agent" ? "mr-auto" : "ml-auto"}`}>
                          <div
                            className={`p-4 rounded-2xl shadow-md border transition-all duration-200 hover:shadow-lg ${
                              message.role === "agent"
                                ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800"
                                : "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-sm font-semibold ${
                                  message.role === "agent"
                                    ? "text-blue-700 dark:text-blue-300"
                                    : "text-emerald-700 dark:text-emerald-300"
                                }`}
                              >
                                {message.role === "agent" ? "Sarah (AI Interviewer)" : "You"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-foreground leading-relaxed">{message.content}</p>
                          </div>
                        </div>

                        {message.role === "user" && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {showTextInput && (
                  <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-3">
                      <textarea
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        placeholder="Type a message to the AI interviewer..."
                        className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 bg-white dark:bg-slate-800 text-foreground transition-all duration-200"
                        rows={2}
                        disabled={connectionStatus !== "connected"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!textMessage.trim() || connectionStatus !== "connected"}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
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
        <audio ref={audioRef} style={{ display: "none" }} />

        {/* Exit Confirmation Dialog */}
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <DialogTitle>End Interview Session?</DialogTitle>
                  <DialogDescription className="mt-1">
                    Your interview session is currently active. Are you sure you want to end it?
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm text-foreground">This will:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    End your AI interview session
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Stop camera and microphone access
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Close the ElevenLabs connection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Your conversation history will be preserved
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleExitCancel}
                className="flex-1"
              >
                Continue Interview
              </Button>
              <Button
                variant="destructive"
                onClick={handleExitConfirm}
                className="flex-1"
              >
                End Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        /* Dark mode scrollbar */
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.1);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.3);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.5);
        }
      `}</style>
    </div>
  )
}
//