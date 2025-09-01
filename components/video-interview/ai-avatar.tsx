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
  const [blinkState, setBlinkState] = useState(false)
  const [headTilt, setHeadTilt] = useState(0)

  // Animate mouth when speaking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthFrame(prev => (prev + 1) % 6) // 6 mouth animation frames for more natural speech
      }, 120) // Faster frame changes for more natural speech animation
    } else {
      setMouthFrame(0) // Closed mouth when not speaking
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSpeaking])

  // Subtle head movement when speaking
  useEffect(() => {
    let tiltInterval: NodeJS.Timeout | null = null
    
    if (isSpeaking) {
      tiltInterval = setInterval(() => {
        setHeadTilt(prev => (prev === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0))
      }, 800) // Change head tilt every 800ms for natural movement
    } else {
      setHeadTilt(0)
    }

    return () => {
      if (tiltInterval) clearInterval(tiltInterval)
    }
  }, [isSpeaking])

  // Natural blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true)
      setTimeout(() => setBlinkState(false), 150) // Blink duration
    }, 3000 + Math.random() * 2000) // Random blink every 3-5 seconds

    return () => clearInterval(blinkInterval)
  }, [])

  // Get mouth shape based on animation frame - more realistic mouth movements
  const getMouthPath = () => {
    switch (mouthFrame) {
      case 0: return "M45 60 Q50 60 55 60" // Closed
      case 1: return "M45 60 Q50 62 55 60" // Slightly open
      case 2: return "M44 60 Q50 65 56 60" // Open
      case 3: return "M45 59 Q50 64 55 59" // Different shape
      case 4: return "M46 60 Q50 62 54 60" // Smaller opening
      case 5: return "M45 60 Q50 61 55 60" // Almost closed
      default: return "M45 60 Q50 60 55 60"
    }
  }

  // Get mouth fill for more realistic appearance
  const getMouthFill = () => {
    if (mouthFrame > 1) {
      return "#8B0000" // Dark red for open mouth
    }
    return "none"
  }

  // Get eye animation based on speaking state
  const getEyeAnimation = () => {
    if (isSpeaking) {
      return "animate-none" // No pulse when speaking, looks more natural
    }
    return isActive ? "animate-none" : "animate-pulse opacity-70"
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Avatar Container - Better sizing and responsive */}
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-300 ${
        isActive 
          ? isSpeaking 
            ? 'bg-gradient-to-br from-rose-400 via-pink-400 to-purple-500 shadow-lg shadow-rose-500/30 scale-105' 
            : 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 shadow-lg shadow-emerald-500/30 animate-pulse'
          : 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-md'
      } overflow-hidden`}>
        
        {/* Avatar SVG - More realistic female avatar */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full transition-transform duration-300"
          style={{ 
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))',
            transform: `rotate(${headTilt}deg)`
          }}
        >
          {/* Face Shape - More oval/feminine */}
          <ellipse 
            cx="50" 
            cy="52" 
            rx="38" 
            ry="42" 
            fill="#FBBF7A" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1"
          />
          
          {/* Face Shading/Contouring */}
          <ellipse 
            cx="50" 
            cy="52" 
            rx="35" 
            ry="39" 
            fill="url(#faceGradient)" 
            opacity="0.3"
          />
          
          {/* Gradient Definitions */}
          <defs>
            <radialGradient id="faceGradient" cx="0.3" cy="0.3">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#92400E" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="eyeGradient" cx="0.3" cy="0.3">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1E40AF" />
            </radialGradient>
            <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#6B3410" />
            </linearGradient>
            <linearGradient id="lipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          
          {/* Hair - More feminine style */}
          <path 
            d="M12 35 Q20 8 35 5 Q50 2 65 5 Q80 8 88 35 Q85 25 75 20 Q50 15 25 20 Q15 25 12 35" 
            fill="url(#hairGradient)"
          />
          
          {/* Hair strands for detail */}
          <path 
            d="M25 20 Q30 15 35 18 Q40 16 45 19" 
            stroke="#6B3410" 
            strokeWidth="1" 
            fill="none" 
            opacity="0.6"
          />
          <path 
            d="M55 19 Q60 16 65 18 Q70 15 75 20" 
            stroke="#6B3410" 
            strokeWidth="1" 
            fill="none" 
            opacity="0.6"
          />
          
          {/* Eyebrows - More defined and feminine */}
          <path 
            d="M28 30 Q33 28 38 30" 
            stroke="#8B4513" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M62 30 Q67 28 72 30" 
            stroke="#8B4513" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Eyes - Larger and more expressive */}
          <ellipse 
            cx="35" 
            cy="40" 
            rx="6" 
            ry="4" 
            fill="white"
          />
          <ellipse 
            cx="65" 
            cy="40" 
            rx="6" 
            ry="4" 
            fill="white"
          />
          
          {/* Iris */}
          <circle 
            cx="35" 
            cy="40" 
            r={blinkState ? "0.5" : "3.5"} 
            fill="url(#eyeGradient)"
            className={`transition-all duration-150 ${getEyeAnimation()}`}
          />
          <circle 
            cx="65" 
            cy="40" 
            r={blinkState ? "0.5" : "3.5"} 
            fill="url(#eyeGradient)"
            className={`transition-all duration-150 ${getEyeAnimation()}`}
          />
          
          {/* Pupils */}
          <circle cx="35" cy="40" r={blinkState ? "0" : "1.5"} fill="#1F2937" className="transition-all duration-150" />
          <circle cx="65" cy="40" r={blinkState ? "0" : "1.5"} fill="#1F2937" className="transition-all duration-150" />
          
          {/* Eye highlights */}
          <circle cx="36" cy="39" r={blinkState ? "0" : "0.8"} fill="white" opacity="0.9" className="transition-all duration-150" />
          <circle cx="66" cy="39" r={blinkState ? "0" : "0.8"} fill="white" opacity="0.9" className="transition-all duration-150" />
          
          {/* Eyelashes */}
          <path d="M29 38 L28 36 M32 37 L31 35 M38 37 L39 35 M41 38 L42 36" stroke="#2D1B14" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M59 38 L58 36 M62 37 L61 35 M68 37 L69 35 M71 38 L72 36" stroke="#2D1B14" strokeWidth="0.8" strokeLinecap="round" />
          
          {/* Nose - More refined */}
          <path 
            d="M50 45 Q48 50 50 53 Q52 50 50 45" 
            fill="#E6A67A" 
            opacity="0.4"
          />
          <circle cx="49" cy="51" r="0.5" fill="#D4965A" opacity="0.3" />
          <circle cx="51" cy="51" r="0.5" fill="#D4965A" opacity="0.3" />
          
          {/* Cheeks - Subtle blush */}
          <circle cx="25" cy="50" r="4" fill="#F87171" opacity="0.2" />
          <circle cx="75" cy="50" r="4" fill="#F87171" opacity="0.2" />
          
          {/* Mouth - More realistic with lips */}
          <path 
            d={getMouthPath()}
            stroke="url(#lipGradient)" 
            strokeWidth="2.5" 
            fill={getMouthFill()}
            strokeLinecap="round"
            className="transition-all duration-120"
          />
          
          {/* Lip highlight */}
          <path 
            d="M46 59 Q50 58 54 59" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="1" 
            fill="none"
            strokeLinecap="round"
            opacity={mouthFrame === 0 ? "1" : "0.3"}
            className="transition-opacity duration-150"
          />
          
          {/* Speaking indicator - More subtle sound waves */}
          {isSpeaking && (
            <g className="animate-pulse" opacity="0.7">
              <path 
                d="M85 35 Q88 38 85 45" 
                stroke="rgba(255,255,255,0.9)" 
                strokeWidth="1.5" 
                fill="none"
                className="animate-bounce"
              />
              <path 
                d="M88 32 Q92 38 88 48" 
                stroke="rgba(255,255,255,0.7)" 
                strokeWidth="1.5" 
                fill="none"
                className="animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <path 
                d="M91 28 Q96 38 91 52" 
                stroke="rgba(255,255,255,0.5)" 
                strokeWidth="1.5" 
                fill="none"
                className="animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </g>
          )}
        </svg>

        {/* Status indicator dot - More elegant */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300 ${
          isActive 
            ? isSpeaking 
              ? 'bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50' 
              : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
            : 'bg-slate-500 shadow-md'
        }`}>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Name and Status - More elegant styling */}
      <div className="mt-4 text-center space-y-1">
        <h3 className="text-white font-semibold text-sm drop-shadow-lg tracking-wide">{name}</h3>
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isSpeaking 
              ? 'bg-rose-400 animate-pulse' 
              : isActive 
                ? 'bg-emerald-400' 
                : 'bg-slate-400'
          }`}></div>
          <p className="text-white/90 text-xs drop-shadow-md font-medium">
            {isSpeaking ? 'Speaking...' : isActive ? 'Listening' : 'Connecting...'}
          </p>
        </div>
      </div>
    </div>
  )
}
