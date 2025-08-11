/**
 * Styling Controls - Conditional display of font and spacing controls
 */

"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FontSizeControls } from './font-size-controls'
import { SpacingControls } from './spacing-controls'
import { Type, Move } from 'lucide-react'
import { useResumeStore } from '@/lib/resume-store'
import { MotionWrapper } from '@/components/ui/motion-wrapper'

export function StylingControls() {
  const { resumeData, currentStep } = useResumeStore()
  const [showFontControls, setShowFontControls] = useState(false)
  const [showSpacingControls, setShowSpacingControls] = useState(false)
  
  // Show controls only if user has reached certifications step (6) or has certifications
  const shouldShowControls = currentStep >= 6 || resumeData.certifications.length > 0
  
  if (!shouldShowControls) {
    return null
  }

  return (
    <MotionWrapper animation="fade-in-up" delay={100}>
      <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant={showFontControls ? "default" : "outline"}
            onClick={() => {
              setShowFontControls(!showFontControls)
              if (showSpacingControls && !showFontControls) {
                setShowSpacingControls(false)
              }
            }}
            className={`flex items-center gap-2 transition-all ${
              showFontControls ? 'shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <Type className="h-4 w-4" />
            {showFontControls ? 'Hide Font Controls' : 'Modify Font Sizes'}
          </Button>
          
          <Button
            variant={showSpacingControls ? "default" : "outline"}
            onClick={() => {
              setShowSpacingControls(!showSpacingControls)
              if (showFontControls && !showSpacingControls) {
                setShowFontControls(false)
              }
            }}
            className={`flex items-center gap-2 transition-all ${
              showSpacingControls ? 'shadow-md' : 'hover:shadow-sm'
            }`}
          >
            <Move className="h-4 w-4" />
            {showSpacingControls ? 'Hide Spacing Controls' : 'Modify Spacing'}
          </Button>
        </div>

        {/* Conditional Controls */}
        {showFontControls && (
          <MotionWrapper animation="slide-in-down" delay={0}>
            <FontSizeControls />
          </MotionWrapper>
        )}
        
        {showSpacingControls && (
          <MotionWrapper animation="slide-in-down" delay={0}>
            <SpacingControls />
          </MotionWrapper>
        )}
      </div>
    </MotionWrapper>
  )
}
