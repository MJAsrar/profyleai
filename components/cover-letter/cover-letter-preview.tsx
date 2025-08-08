"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Loader2,
  RefreshCw
} from "lucide-react"
import { useCoverLetterStore } from "@/lib/cover-letter-store"

export function CoverLetterPreview() {
  const { coverLetterData } = useCoverLetterStore()
  const { toast } = useToast()
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [zoom, setZoom] = useState(0.75)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

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
  }, [coverLetterData])

  // Force refresh preview (useful for debugging)
  const handleRefresh = () => {
    setLastUpdated(new Date())
    toast({
      title: "Preview refreshed",
      description: "The cover letter preview has been updated.",
    })
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.05, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.05, 0.3))
  }

  const renderCoverLetter = () => (
    <div className="max-w-2xl mx-auto bg-white px-8 pt-2 pb-8 text-slate-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Header with elegant styling - tight spacing */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-center tracking-wider text-slate-700 mb-1 uppercase">
          {coverLetterData.personalInfo.fullName || "[Your Name]"}
        </h1>
        <div className="w-full h-px bg-slate-700 mb-3"></div>
        
        {(coverLetterData.personalInfo.email || coverLetterData.personalInfo.phone || coverLetterData.personalInfo.address) && (
          <div className="flex justify-between text-xs text-slate-600">
            <div className="space-y-1">
              {coverLetterData.personalInfo.email && <div>{coverLetterData.personalInfo.email}</div>}
              {coverLetterData.personalInfo.phone && <div>{coverLetterData.personalInfo.phone}</div>}
            </div>
            <div className="text-right space-y-1">
              {coverLetterData.personalInfo.address && <div>{coverLetterData.personalInfo.address}</div>}
              <div>{new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Line */}
      {coverLetterData.jobDetails.jobTitle && (
        <div className="mb-3">
          <span className="font-semibold text-slate-700">RE: </span>
          <span className="italic text-slate-700">Application for {coverLetterData.jobDetails.jobTitle} Position at {coverLetterData.jobDetails.companyName}</span>
        </div>
      )}

      {/* Salutation */}
      <div className="mb-3 font-semibold text-slate-700">
        {coverLetterData.jobDetails.hiringManager && coverLetterData.jobDetails.hiringManager.trim() !== ''
          ? `Dear ${coverLetterData.jobDetails.hiringManager},`
          : 'Dear Hiring Manager,'}
      </div>

      {/* Content with beautiful typography */}
      <div className="space-y-3 text-sm leading-relaxed text-slate-700">
        {coverLetterData.content.opening && (
          <div className="text-justify whitespace-pre-line">{coverLetterData.content.opening}</div>
        )}
        {coverLetterData.content.body && (
          <div className="text-justify whitespace-pre-line">{coverLetterData.content.body}</div>
        )}
        {coverLetterData.content.closing && (
          <div className="text-justify whitespace-pre-line">{coverLetterData.content.closing}</div>
        )}
      </div>

      {/* Professional closing */}
      <div className="mt-5 space-y-0">
        <div className="text-slate-700">Sincerely,</div>
        <div className="text-sm text-slate-700">{coverLetterData.personalInfo.fullName || "[Your Name]"}</div>
      </div>
    </div>
  )

  return (
    <Card className="h-fit relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Cover Letter Preview
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Use Export PDF button in header
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
              id="cover-letter-preview" 
              className="w-full h-full p-2 sm:p-4"
              style={{
                minHeight: '100%',
                backgroundColor: 'white'
              }}
            >
              <div 
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: `${100 / zoom}%`
                }}
              >
                {renderCoverLetter()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
