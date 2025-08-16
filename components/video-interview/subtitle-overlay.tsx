'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SubtitleData {
  text: string
  timestamp: number
  isComplete: boolean
  speaker: 'agent' | 'user'
}

interface SubtitleOverlayProps {
  currentSubtitle: SubtitleData | null
  isVisible: boolean
  position?: 'bottom' | 'top' | 'center'
  className?: string
}

export function SubtitleOverlay({ 
  currentSubtitle, 
  isVisible = true, 
  position = 'bottom',
  className = '' 
}: SubtitleOverlayProps) {
  const [displayText, setDisplayText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousTextRef = useRef('')

  // Handle subtitle text updates
  useEffect(() => {
    if (!currentSubtitle || !isVisible) {
      // Fade out current subtitle
      setIsAnimating(false)
      
      // Clear text after fade animation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setDisplayText('')
      }, 300) // Match CSS transition duration
      
      return
    }

    const newText = currentSubtitle.text

    // Only update if text has changed
    if (newText !== previousTextRef.current) {
      previousTextRef.current = newText
      setDisplayText(newText)
      setIsAnimating(true)

      // Auto-hide subtitle after 3 seconds if complete
      if (currentSubtitle.isComplete) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
          setTimeout(() => setDisplayText(''), 300)
        }, 3000)
      }
    }
  }, [currentSubtitle, isVisible])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Don't render if no text
  if (!displayText) {
    return null
  }

  // Position classes
  const positionClasses = {
    bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
    top: 'top-4 left-1/2 transform -translate-x-1/2',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }

  // Speaker-specific styling
  const speakerClasses = {
    agent: 'bg-blue-900/90 border-blue-500/50',
    user: 'bg-green-900/90 border-green-500/50'
  }

  return (
    <div
      className={`
        absolute z-40 max-w-4xl px-6 py-3 
        rounded-xl backdrop-blur-md border
        text-white text-center shadow-2xl
        transition-all duration-300 ease-in-out
        ${positionClasses[position]}
        ${currentSubtitle ? speakerClasses[currentSubtitle.speaker] : speakerClasses.agent}
        ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${className}
      `}
      style={{
        maxWidth: '80vw',
        fontSize: 'clamp(14px, 1.5vw, 18px)',
        lineHeight: '1.4'
      }}
    >
      {/* Speaker indicator */}
      <div className="flex items-center justify-center mb-1">
        <div className={`
          w-2 h-2 rounded-full mr-2 animate-pulse
          ${currentSubtitle?.speaker === 'agent' ? 'bg-blue-400' : 'bg-green-400'}
        `} />
        <span className="text-xs opacity-75 font-medium">
          {currentSubtitle?.speaker === 'agent' ? 'Sarah' : 'You'}
        </span>
      </div>

      {/* Subtitle text */}
      <div className="font-medium leading-relaxed">
        {displayText}
      </div>

      {/* Typing indicator for incomplete text */}
      {currentSubtitle && !currentSubtitle.isComplete && (
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for managing subtitle state
export function useSubtitles() {
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleData | null>(null)
  const [subtitleHistory, setSubtitleHistory] = useState<SubtitleData[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  const addAgentSubtitle = useCallback((text: string, timestamp: number, isComplete: boolean = true) => {
    const subtitle: SubtitleData = {
      text,
      timestamp,
      isComplete,
      speaker: 'agent'
    }
    
    setCurrentSubtitle(subtitle)
    
    if (isComplete) {
      setSubtitleHistory(prev => [...prev, subtitle].slice(-50)) // Keep last 50 subtitles
    }
  }, [])

  const addUserSubtitle = useCallback((text: string, timestamp: number) => {
    const subtitle: SubtitleData = {
      text,
      timestamp,
      isComplete: true,
      speaker: 'user'
    }
    
    setCurrentSubtitle(subtitle)
    setSubtitleHistory(prev => [...prev, subtitle].slice(-50))
  }, [])

  const clearCurrentSubtitle = useCallback(() => {
    setCurrentSubtitle(null)
  }, [])

  const toggleSubtitles = useCallback(() => {
    setIsEnabled(!isEnabled)
  }, [isEnabled])

  return {
    currentSubtitle,
    subtitleHistory,
    isEnabled,
    addAgentSubtitle,
    addUserSubtitle,
    clearCurrentSubtitle,
    toggleSubtitles,
    setIsEnabled
  }
}
