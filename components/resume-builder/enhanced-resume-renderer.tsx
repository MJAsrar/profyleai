"use client"

import React, { useMemo } from 'react'
import { ResumeTemplateRenderer } from './resume-template-renderer'
import { DynamicTemplateRenderer } from './dynamic-template-renderer'
import type { ResumeData, ResumeTemplate } from '@/lib/resume-store'

interface EnhancedResumeRendererProps {
  template: ResumeTemplate
  data: ResumeData
  scale?: number
  className?: string
}

export function EnhancedResumeRenderer({
  template,
  data,
  scale = 1,
  className = ""
}: EnhancedResumeRendererProps) {
  
  // Determine which renderer to use based on template type
  const rendererType = useMemo(() => {
    if (template.cssData && Object.keys(template.cssData).length > 0) {
      return 'dynamic'
    }
    return 'static'
  }, [template])
  
  const containerStyle = scale !== 1 ? {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: `${100 / scale}%`
  } : {}
  
  return (
    <div className={`enhanced-resume-renderer ${className}`}>
      <div style={containerStyle} className="normal-rendering-mode">
        {rendererType === 'dynamic' ? (
          <DynamicTemplateRenderer
            template={template}
            data={data}
            scale={1} // Don't double-scale
            className="bg-white"
          />
        ) : (
          <div className="bg-white min-h-[600px] p-8">
            <ResumeTemplateRenderer 
              template={template} 
              data={data} 
            />
          </div>
        )}
      </div>
    </div>
  )
}