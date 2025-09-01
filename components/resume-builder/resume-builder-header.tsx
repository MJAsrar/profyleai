"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Palette, Save, Download, CheckCircle2, Clock, Loader2, ArrowLeft } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"
import { useFontConfig } from "@/lib/font-config-store"

interface ResumeBuilderHeaderProps {
  onChangeTemplate?: () => void
  onBack?: () => void
}

export function ResumeBuilderHeader({ onChangeTemplate, onBack }: ResumeBuilderHeaderProps) {
  const { 
    saveResume, 
    getCompletionPercentage, 
    hasUnsavedChanges, 
    isSaving, 
    lastSaved, 
    resumeData 
  } = useResumeStore()
  const fontConfig = useFontConfig()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const completionPercentage = getCompletionPercentage()

  const handleSave = async () => {
    try {
      await saveResume()
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save your resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // First save the resume if there are unsaved changes
      if (hasUnsavedChanges) {
        await saveResume()
      }

      // Allow export even without saving - just ensure we have an ID by saving first
      if (!resumeData.id) {
        await saveResume()
      }

      if (!resumeData.id) {
        throw new Error('Unable to save resume before exporting')
      }

      console.log('Downloading resume PDF:', resumeData.id)
      
      const response = await fetch(`/api/resumes/${resumeData.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fontConfig
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to download resume')
      }
      
      // Get the PDF blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resumeData.personalInfo.fullName || 'Resume'}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "PDF exported",
        description: "Your resume has been exported as PDF.",
      })
    } catch (error) {
      console.error('Failed to export PDF:', error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getSaveStatusText = () => {
    if (isSaving) return "Saving..."
    if (!hasUnsavedChanges && lastSaved) {
      try {
        // Handle case where lastSaved might be a string (from localStorage persistence)
        const lastSavedDate = lastSaved instanceof Date ? lastSaved : new Date(lastSaved)
        const timeSince = new Date().getTime() - lastSavedDate.getTime()
        if (timeSince < 60000) return "Saved just now"
        if (timeSince < 3600000) return `Saved ${Math.floor(timeSince / 60000)}m ago`
        return `Saved ${Math.floor(timeSince / 3600000)}h ago`
      } catch (error) {
        // Fallback if date parsing fails
        return "Saved"
      }
    }
    if (hasUnsavedChanges) return "Unsaved changes"
    return "Not saved"
  }

  const getSaveStatusIcon = () => {
    if (isSaving) return <Loader2 className="h-3 w-3 animate-spin" />
    if (!hasUnsavedChanges && lastSaved) return <CheckCircle2 className="h-3 w-3 text-green-500" />
    return <Clock className="h-3 w-3 text-orange-500" />
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 sm:gap-2 px-1 sm:px-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-semibold truncate">Resume Builder</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">Create your professional resume</p>
        </div>
      </div>

      {/* Center Section - Progress (hidden on very small screens) */}
      <div className="hidden md:flex flex-1 max-w-sm mx-2 lg:mx-6">
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <div className="flex-1">
            <Progress value={completionPercentage} className="h-1.5" />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground">{completionPercentage}%</span>
            <Badge variant={completionPercentage >= 80 ? "default" : "secondary"} className="text-xs py-0 px-1 sm:px-2">
              {completionPercentage >= 80 ? "Ready" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
        {/* Save Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          {getSaveStatusIcon()}
          <span>{getSaveStatusText()}</span>
        </div>

        {onChangeTemplate && (
          <Button variant="outline" size="sm" onClick={onChangeTemplate} className="px-2 sm:px-3">
            <Palette className="h-4 w-4" />
            <span className="hidden lg:ml-2 lg:inline">Template</span>
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="px-2 sm:px-3"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden lg:ml-2 lg:inline">Save</span>
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleExportPDF}
          disabled={isExporting || completionPercentage < 50}
          className="px-2 sm:px-3"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden lg:ml-2 lg:inline">Export</span>
        </Button>
      </div>
    </header>
  )
}
