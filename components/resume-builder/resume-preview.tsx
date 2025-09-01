"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2
} from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"

import { EnhancedResumeRenderer } from "./enhanced-resume-renderer"
import { useFontConfig } from "@/lib/font-config-store"

export function ResumePreview() {
  const { resumeData, selectedTemplate, getCompletionPercentage, hasUnsavedChanges, isSaving } = useResumeStore()
  const fontConfig = useFontConfig()
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [zoom, setZoom] = useState(0.75)

  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const completionPercentage = getCompletionPercentage()

  // Auto-update preview when data changes
  useEffect(() => {
    const updatePreview = async () => {
      setIsPreviewLoading(true)
      // Small delay to batch rapid changes
      setTimeout(() => {
        setLastUpdated(new Date())
        setIsPreviewLoading(false)
      }, 300)
    }

    updatePreview()
  }, [resumeData, selectedTemplate, fontConfig])

  // Force refresh preview (useful for debugging)
  const handleRefresh = () => {
    setLastUpdated(new Date())
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.05, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.05, 0.3))
  }





  if (!selectedTemplate) {
    return (
      <Card className="card-elevated h-fit">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg">No Template Selected</p>
              <p className="text-sm text-muted-foreground">Choose a template to see your live resume preview</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated h-fit">
      <CardHeader className="pb-4 space-y-4">
        {/* Header with Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Live Preview</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={completionPercentage >= 80 ? "default" : "secondary"} className="text-xs">
                  {completionPercentage}% Complete
                </Badge>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                    Unsaved
                  </Badge>
                )}
                {isSaving && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            disabled={zoom <= 0.3}
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground min-w-[40px] sm:min-w-[50px] text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 ml-1 sm:ml-2"
            disabled={isPreviewLoading}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isPreviewLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Preview Loading Overlay */}
        {isPreviewLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating preview...
            </div>
          </div>
        )}

        {/* Preview Container */}
        <div className="relative">
          <div className="overflow-auto bg-white rounded-lg border border-muted/50 shadow-soft h-[400px] md:h-[600px] max-w-full">
            <div 
              ref={previewRef}
              id="resume-preview" 
              className="w-full h-full p-2 sm:p-4"
              style={{
                minHeight: '100%',
                backgroundColor: 'white'
              }}
            >
              <div style={{ width: '100%' }}>
                <EnhancedResumeRenderer 
                  template={selectedTemplate} 
                  data={resumeData}
                  scale={zoom}
                  className=""
                  key={`${selectedTemplate.id}-${lastUpdated.getTime()}`}
                />
              </div>
            </div>
          </div>

          {/* Preview Info Bar */}
          <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Template: {selectedTemplate.name}</span>
              </div>
              <span>Category: {selectedTemplate.category.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-3">
              {!hasUnsavedChanges && !isSaving && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Saved</span>
                </div>
              )}
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
