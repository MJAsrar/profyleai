"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import { useSubtitles, SubtitleOverlay } from "./subtitle-overlay"

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

  /**
   * The room's status, in words a person would use.
   *
   * The old version showed "AI Speaking..." in blue and "Listening..." in purple, which
   * told you the machine's state but not yours. What matters in a live interview is whose
   * turn it is.
   */
  const status: { label: string; live: boolean } = (() => {
    switch (connectionStatus) {
      case "connecting":
        return { label: "Connecting…", live: false }
      case "speaking":
        return { label: "Sarah is speaking", live: true }
      case "listening":
        return { label: "Your turn — go ahead", live: true }
      case "connected":
        return { label: "Connected", live: true }
      case "ended":
        return { label: "Interview ended", live: false }
      default:
        return { label: "Disconnected", live: false }
    }
  })()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16211b] px-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-paper/15" />
          <h2 className="mt-6 font-display text-[24px] text-paper">Setting up the room</h2>
          <p className="mt-2 text-[14px] text-paper/70">
            Sarah is reading your résumé and the posting. A few seconds.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#16211b] text-paper">
      {/* ---- Top bar ---- */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/10 px-6 py-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">
            Live interview
          </p>
          <h1 className="truncate text-[16px] font-bold text-paper">
            {jobTitle} <span className="font-normal text-paper/60">· {companyName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                status.live ? "bg-[#7fb98f]" : "bg-paper/35",
                connectionStatus === "connecting" && "animate-pulse"
              )}
            />
            <span aria-live="polite" className="text-[13px] text-paper/80">
              {status.label}
            </span>
          </div>

          <span className="font-mono text-[13px] tabular-nums text-paper/70">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* ---- Stage ---- */}
      <main className="flex flex-1 flex-col gap-[18px] overflow-hidden p-[26px]">
        <div className="grid flex-1 gap-[18px] lg:grid-cols-[1fr_300px]">
          {/* Sarah */}
          <div
            className="flex flex-col items-center justify-center gap-[22px] rounded-[16px] border border-white/[.06]"
            style={{
              background: "radial-gradient(circle at 50% 42%,#24382c,#16211b)",
            }}
          >
            <AiAvatar
              isActive={connectionStatus !== "ended" && connectionStatus !== "disconnected"}
              isSpeaking={isAgentSpeaking}
            />

            <div className="text-center">
              <p className="text-[16px] font-bold text-[#f4efe6]">Sarah</p>
              <p
                aria-live="polite"
                className="mt-[3px] font-mono text-[11px] tracking-[0.06em] text-[#8fc7a3]"
              >
                {isAgentSpeaking
                  ? "SPEAKING"
                  : isUserSpeaking
                    ? "LISTENING"
                    : status.label.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Your camera — small, and there so you can see yourself. */}
          <div
            className="relative flex items-end overflow-hidden rounded-[16px] border border-white/[.06] p-[14px]"
            style={{ background: "#1b271f" }}
          >
            <span className="absolute left-[14px] top-[14px] font-mono text-[10px] tracking-[0.12em] text-[#8fc7a3]">
              YOUR CAMERA
            </span>

            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                localStream && isVideoEnabled ? "opacity-100" : "opacity-0"
              )}
              style={{ transform: "scaleX(-1)" }}
              onCanPlay={() => localVideoRef.current?.play().catch(() => {})}
            />

            {(!localStream || !isVideoEnabled) && (
              <span className="relative font-mono text-[10px] uppercase tracking-[0.1em] text-paper/40">
                Camera off
              </span>
            )}
          </div>
        </div>

        {/* Live caption. The overlay existed in the codebase but was never mounted, so deaf
            and hard-of-hearing users got audio-only questions. */}
        <div className="rounded-[14px] border border-white/[.06] bg-black/25 px-5 py-4">
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.12em] text-[#8fc7a3]">
            SARAH · LIVE CAPTION
          </p>

          {subtitlesEnabled ? (
            <p className="text-[15px] leading-[1.5] text-[#f4efe6]">
              {currentSubtitle?.text ?? "…"}
            </p>
          ) : (
            <p className="text-[15px] leading-[1.5] text-paper/40">Captions are off.</p>
          )}
        </div>

        {streamError && (
          <p className="rounded-[10px] bg-black/30 px-3 py-2 text-[12px] leading-relaxed text-paper/80">
            {streamError}
          </p>
        )}
      </main>

      {/* ---- Transcript ---- */}
      {conversationHistory.length > 0 && (
        <section className="max-h-[220px] overflow-y-auto border-t border-paper/10 px-6 py-4">
          <ul className="mx-auto max-w-[760px] space-y-3">
            {conversationHistory.map((message, i) => (
              <li key={i}>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/40">
                  {message.role === "agent" ? "Sarah" : "You"}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[14px] leading-relaxed",
                    message.role === "agent" ? "text-paper" : "text-paper/70"
                  )}
                >
                  {message.content}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- Controls ---- */}
      <footer className="border-t border-paper/10 px-6 py-4">
        {showTextInput && (
          <div className="mx-auto mb-3 flex max-w-[760px] gap-2">
            <input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type instead of speaking…"
              aria-label="Type your answer"
              className="h-11 flex-1 rounded-input border border-paper/20 bg-paper/5 px-3.5 text-[15px] text-paper placeholder:text-paper/40 focus-visible:border-paper/50 focus-visible:outline-none"
            />
            <Button variant="onDark" onClick={handleSendMessage} disabled={!textMessage.trim()}>
              Send
            </Button>
          </div>
        )}

        <div className="mx-auto flex max-w-[760px] flex-wrap items-center justify-center gap-3">
          <RoomToggle
            on={isMicEnabled}
            onClick={toggleMic}
            glyph="🎤"
            onLabel="Mute microphone"
            offLabel="Unmute microphone"
          />
          <RoomToggle
            on={isVideoEnabled}
            onClick={toggleVideo}
            glyph="📷"
            onLabel="Turn camera off"
            offLabel="Turn camera on"
          />
          <RoomToggle
            on={subtitlesEnabled}
            onClick={toggleSubtitles}
            glyph="CC"
            onLabel="Hide captions"
            offLabel="Show captions"
          />
          <RoomToggle
            on={showTextInput}
            onClick={() => setShowTextInput(!showTextInput)}
            glyph="⌨"
            onLabel="Hide the typing box"
            offLabel="Type instead of speaking"
          />

          <Button variant="destructive" className="ml-2" onClick={handleEndInterview}>
            End interview
          </Button>
        </div>

        {lastError && (
          <div className="mx-auto mt-3 flex max-w-[760px] items-center justify-between gap-3 rounded-[10px] bg-danger/20 px-3.5 py-2.5">
            <p className="text-[13px] text-paper">{lastError}</p>
            <button
              type="button"
              onClick={clearErrors}
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-paper/60 hover:text-paper"
            >
              Dismiss
            </button>
          </div>
        )}
      </footer>

      <audio ref={audioRef} style={{ display: "none" }} />

      {/* ---- Leaving mid-interview ---- */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave the interview?</DialogTitle>
            <DialogDescription>
              The session ends here and the credit is spent. You&apos;ll still get the
              feedback for what you answered so far.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={handleExitCancel}>
              Stay in the interview
            </Button>
            <Button variant="destructive" onClick={handleExitConfirm}>
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * A round control in the live room.
 *
 * The glyph alone can't say whether the mic is live, so the state is carried by
 * aria-pressed and a real accessible name that changes with it — not by colour alone.
 */
function RoomToggle({
  on,
  onClick,
  glyph,
  onLabel,
  offLabel,
}: {
  on: boolean
  onClick: () => void
  glyph: string
  onLabel: string
  offLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? onLabel : offLabel}
      title={on ? onLabel : offLabel}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full text-[18px] transition-colors",
        on
          ? "bg-[#2e6a4a] text-[#f4efe6] hover:bg-[#357a56]"
          : "bg-white/10 text-[#cddccf] hover:bg-white/20"
      )}
    >
      <span aria-hidden="true" className={glyph === "CC" ? "font-mono text-[13px]" : ""}>
        {glyph}
      </span>
    </button>
  )
}
