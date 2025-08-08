"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Edit, Share } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"
import { EnhancedResumeRenderer } from "@/components/resume-builder/enhanced-resume-renderer"
import { exportResumeToPDFMake, generatePDFFilename } from "@/lib/pdf-make-utils"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useFontConfig } from "@/lib/font-config-store"

import Link from "next/link"

export function ResumePreviewFull() {
  const { resumeData, selectedTemplate, loadResume, templates } = useResumeStore()
  const { toast } = useToast()
  const { fontConfig } = useFontConfig()
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load the latest saved resume on component mount
  useEffect(() => {
    const loadLatestResume = async () => {
      try {
        // If we have a resume ID, load the latest data from the database
        if (resumeData.id) {
          await loadResume(resumeData.id)
        }
      } catch (error) {
        console.error('Failed to load latest resume:', error)
        toast({
          title: "Load Error",
          description: "Could not load the latest resume data. Showing cached version.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadLatestResume()
  }, [resumeData.id, loadResume, toast])

  const handleExportPDF = async () => {
    setIsExporting(true)

    try {
      if (!resumeData.id) {
        throw new Error('Resume must be saved before downloading')
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
        title: "PDF Downloaded! ✨",
        description: "Resume downloaded successfully",
      })
    } catch (error) {
      console.error('PDF export error:', error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Could not generate PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center animate-pulse">
            <Download className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="heading-2">Loading Resume...</h2>
            <p className="text-muted-foreground body-default">Please wait while we load your latest resume data.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if resume exists and has meaningful content
  const hasResumeContent = resumeData.id && (
    (resumeData.personalInfo.fullName && resumeData.personalInfo.fullName.trim().length > 0) ||
    (resumeData.personalInfo.email && resumeData.personalInfo.email.trim().length > 0) ||
    (resumeData.summary && resumeData.summary.trim().length > 0) ||
    (resumeData.experience && resumeData.experience.length > 0) ||
    (resumeData.education && resumeData.education.length > 0) ||
    (resumeData.skills && resumeData.skills.length > 0) ||
    (resumeData.projects && resumeData.projects.length > 0) ||
    (resumeData.certifications && resumeData.certifications.length > 0)
  )

  if (!selectedTemplate || !hasResumeContent) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-12 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="heading-2">No Resume Found</h2>
            <p className="text-muted-foreground body-default max-w-md mx-auto">
              You haven't created a resume yet. Create one first to see it here.
            </p>
          </div>
          <Link href="/dashboard/resume-builder">
            <Button size="lg" className="h-12 px-8 btn-gradient">
              <Edit className="mr-2 h-5 w-5" />
              Create Your First Resume
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <Card className="card-elevated">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Resume Preview</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">View and export your resume</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/dashboard/resume-builder">
                <Button variant="outline" className="h-9 px-3 sm:h-10 sm:px-4 text-sm">
                  <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" className="h-9 px-3 sm:h-10 sm:px-4 text-sm">
                <Share className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Share
              </Button>
              <Button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="h-9 px-3 sm:h-10 sm:px-4 btn-gradient text-sm"
              >
                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {isExporting ? "Exporting..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Content */}
      <div id="resume-preview-full" className="w-full min-h-screen bg-muted/30 rounded-xl p-3 sm:p-6 lg:p-8 shadow-soft">
        <EnhancedResumeRenderer 
          template={selectedTemplate} 
          data={resumeData}
          className="w-full mx-auto max-w-4xl shadow-medium rounded-lg overflow-hidden"
        />
      </div>
    </div>
  )
}
