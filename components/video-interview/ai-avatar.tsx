'use client'

import { useState, useEffect } from 'react'

interface AiAvatarProps {
  isActive: boolean
  isSpeaking: boolean
  name?: string
  className?: string
}

export function AiAvatar({ isActive, isSpeaking, name = "Sarah", className = "" }: AiAvatarProps) {
  const [mouthFrame, setMouthFrame] = useState(0)

  // Animate mouth when speaking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthFrame(prev => (prev + 1) % 4) // 4 mouth animation frames
      }, 150) // Change frame every 150ms for natural speech animation
    } else {
      setMouthFrame(0) // Closed mouth when not speaking
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSpeaking])

  // Get mouth shape based on animation frame
  const getMouthPath = () => {
    switch (mouthFrame) {
      case 0: return "M35 45 Q40 45 45 45" // Closed
      case 1: return "M35 45 Q40 47 45 45" // Slightly open
      case 2: return "M35 45 Q40 50 45 45" // More open
      case 3: return "M35 45 Q40 48 45 45" // Medium open
      default: return "M35 45 Q40 45 45 45"
    }
  }

  // Get eye animation based on speaking state
  const getEyeAnimation = () => {
    if (isSpeaking) {
      return "animate-pulse"
    }
    return isActive ? "animate-none" : "animate-pulse opacity-70"
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Avatar Container */}
      <div className={`relative w-20 h-20 rounded-full transition-all duration-300 ${
        isActive 
          ? isSpeaking 
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 scale-110' 
            : 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50'
          : 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-md'
      }`}>
        
        {/* Avatar SVG */}
        <svg 
          viewBox="0 0 80 80" 
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          {/* Face Circle */}
          <circle 
            cx="40" 
            cy="40" 
            r="35" 
            fill="#FEF3C7" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2"
          />
          
          {/* Eyes */}
          <circle 
            cx="32" 
            cy="35" 
            r="3" 
            fill="#1F2937"
            className={getEyeAnimation()}
          />
          <circle 
            cx="48" 
            cy="35" 
            r="3" 
            fill="#1F2937"
            className={getEyeAnimation()}
          />
          
          {/* Eye highlights */}
          <circle cx="33" cy="34" r="1" fill="white" opacity="0.8" />
          <circle cx="49" cy="34" r="1" fill="white" opacity="0.8" />
          
          {/* Nose */}
          <path 
            d="M40 38 Q38 42 40 44 Q42 42 40 38" 
            fill="#F59E0B" 
            opacity="0.3"
          />
          
          {/* Mouth - Animated */}
          <path 
            d={getMouthPath()}
            stroke="#1F2937" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
            className="transition-all duration-150"
          />
          
          {/* Hair */}
          <path 
            d="M15 25 Q25 10 40 12 Q55 10 65 25 Q60 20 40 18 Q20 20 15 25" 
            fill="#8B5A2B"
          />
          
          {/* Speaking indicator - Sound waves */}
          {isSpeaking && (
            <g className="animate-pulse">
              <path 
                d="M65 35 Q68 35 68 40 Q68 45 65 45" 
                stroke="rgba(255,255,255,0.8)" 
                strokeWidth="2" 
                fill="none"
                className="animate-bounce"
              />
              <path 
                d="M70 30 Q75 30 75 40 Q75 50 70 50" 
                stroke="rgba(255,255,255,0.6)" 
                strokeWidth="2" 
                fill="none"
                className="animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <path 
                d="M75 25 Q82 25 82 40 Q82 55 75 55" 
                stroke="rgba(255,255,255,0.4)" 
                strokeWidth="2" 
                fill="none"
                className="animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </g>
          )}
        </svg>

        {/* Status indicator dot */}
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
          isActive 
            ? isSpeaking 
              ? 'bg-blue-500 animate-pulse' 
              : 'bg-green-500'
            : 'bg-gray-500'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Name and Status */}
      <div className="mt-3 text-center">
        <h3 className="text-white font-semibold text-sm drop-shadow-md">{name}</h3>
        <p className="text-white/90 text-xs drop-shadow-sm">
          {isSpeaking ? 'Speaking...' : isActive ? 'Listening' : 'Connecting...'}
        </p>
      </div>
    </div>
  )
}
