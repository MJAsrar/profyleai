"use client"

import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-right' | 'slide-in-left' | 'slide-in-up' | 'scale-in' | 'bounce-in'
  delay?: number
  duration?: string
}

export function MotionWrapper({ 
  children, 
  className = "", 
  animation = 'fade-in-up',
  delay = 0,
  duration = "0.6s"
}: MotionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? `animate-${animation}` : "opacity-0",
        className
      )}
      style={{
        animationDuration: duration,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  )
}

interface StaggeredContainerProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-right' | 'slide-in-left' | 'scale-in'
}

export function StaggeredContainer({ 
  children, 
  className = "",
  staggerDelay = 100,
  animation = 'fade-in-up'
}: StaggeredContainerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <MotionWrapper 
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </MotionWrapper>
      ))}
    </div>
  )
}