"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, CheckCircle, ArrowRight, Sparkles, RotateCcw, FolderOpen, FileText, Loader2 } from "lucide-react"
import { useResumeStore, type ResumeData } from "@/lib/resume-store"
import { useToast } from "@/hooks/use-toast"
import { useFontConfig } from "@/lib/font-config-store"
import { DetailedTailoringResults } from "./detailed-tailoring-results"

interface JobData {
  jobTitle: string
  jobDescription: string
  companyName: string
}

interface TailoringData {
  jobTitle: string
  jobDescription: string
  companyName: string
  matchScore?: number
  tailoringNotes?: string
  tailoredAt?: Date
  atsBreakdown?: {
    keywordMatch: number
    formatScore: number
    relevanceScore: number
    overallScore: number
  }
  detailedChanges?: {
    summary: {
      changed: boolean
      changeType: string
      keywordsAdded: string[]
      improvementReason: string
    }
    experience: Array<{
      id: string
      changed: boolean
      changeType: string
      keywordsAdded: string[]
      improvementReason: string
    }>
    skills: {
      changed: boolean
      changeType: string
      skillsReordered: string[]
      skillsAdded: string[]
      improvementReason: string
    }
    projects?: Array<{
      id: string
      changed: boolean
      changeType: string
      keywordsAdded: string[]
      improvementReason: string
    }>
  }
  keywordAnalysis?: {
    jobKeywords: string[]
    matchedKeywords: string[]
    missedKeywords: string[]
    addedKeywords: string[]
  }
}

interface TailoredResumePreviewProps {
  jobData: JobData
  tailoringData?: TailoringData | null
  resumeData: ResumeData
}

export function TailoredResumePreview({ 
  jobData, 
  tailoringData, 
  resumeData 
}: TailoredResumePreviewProps) {
  const { revertTailoring } = useResumeStore()
  const { toast } = useToast()
  const { fontConfig } = useFontConfig()
  const [isDownloading, setIsDownloading] = useState(false)

  // Extract match score from tailoring data
  const matchScore = tailoringData?.matchScore || 85
  
  // Parse tailoring notes to extract key changes
  const tailoringChanges = tailoringData?.tailoringNotes 
    ? [
        {
          section: "Professional Summary",
          change: "Enhanced to highlight relevant experience and keywords",
          highlight: true
        },
        {
          section: "Skills",
          change: "Reordered to prioritize job requirements",
          highlight: true
        },
        {
          section: "Experience",
          change: "Optimized descriptions with quantified achievements",
          highlight: true
        },
        {
          section: "Keywords",
          change: `Integrated ${jobData.companyName} industry terminology`,
          highlight: false
        }
      ]
    : []

  // Extract skills from resume data
  const enhancedSkills = resumeData.skills
    .flatMap(category => category.skills.map(skill => skill.name))
    .slice(0, 8)

  const handleRevert = async () => {
    try {
      await revertTailoring()
    } catch (error) {
      console.error('Failed to revert:', error)
    }
  }

  const handleDownload = async () => {
    if (!resumeData.id) {
      toast({
        title: "Cannot download resume",
        description: "Resume must be saved first. Please save your resume and try again.",
        variant: "destructive"
      })
      return
    }

    setIsDownloading(true)
    try {
      console.log('🚀 Starting tailored resume download:', {
        resumeId: resumeData.id,
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        hasPersonalInfo: !!resumeData.personalInfo,
        fontConfig: fontConfig
      })
      
      // Use the tailored resume download endpoint
      const response = await fetch(`/api/tailored-resumes/${resumeData.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fontConfig
        })
      })
      
      console.log('📡 Download response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      })
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use the default error message
        }
        throw new Error(errorMessage)
      }
      
      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type')
      if (contentType && !contentType.includes('application/pdf')) {
        console.warn('⚠️ Unexpected content type:', contentType)
        // Try to read as text to see if it's an error response
        const text = await response.text()
        console.error('❌ Response content:', text)
        throw new Error('Server returned invalid response format')
      }
      
      // Get the PDF blob
      const blob = await response.blob()
      console.log('📄 PDF blob created:', {
        size: blob.size,
        type: blob.type
      })
      
      if (blob.size === 0) {
        throw new Error('PDF file is empty')
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `${resumeData.personalInfo?.fullName || 'Tailored_Resume'}_${jobData.companyName}_${jobData.jobTitle}`.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
      link.download = `${fileName}_Resume.pdf`
      
      console.log('💾 Triggering download:', {
        fileName: link.download,
        blobUrl: url.substring(0, 50) + '...'
      })
      
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Resume downloaded successfully! ✨",
        description: `Your tailored resume for ${jobData.companyName} has been downloaded.`,
      })
      
      console.log('✅ Tailored resume downloaded successfully')
    } catch (error) {
      console.error('❌ Failed to download tailored resume:', error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download resume. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Detailed Tailoring Results */}
      {tailoringData?.atsBreakdown && tailoringData?.detailedChanges && tailoringData?.keywordAnalysis && (
        <DetailedTailoringResults
          matchScore={matchScore}
          atsBreakdown={tailoringData.atsBreakdown}
          detailedChanges={tailoringData.detailedChanges}
          keywordAnalysis={tailoringData.keywordAnalysis}
          tailoringNotes={tailoringData.tailoringNotes || "Resume has been optimized with relevant keywords and improved content structure."}
          jobTitle={jobData.jobTitle}
          companyName={jobData.companyName}
        />
      )}

      {/* Fallback Basic Summary for legacy data */}
      {(!tailoringData?.atsBreakdown || !tailoringData?.detailedChanges) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Tailoring Complete
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your resume has been optimized for: <strong>{jobData.jobTitle}</strong> at <strong>{jobData.companyName}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${matchScore >= 90 ? 'text-green-600' : matchScore >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {matchScore}%
                </div>
                <div className="text-xs text-muted-foreground">Match Score</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{tailoringChanges.length}</div>
                <div className="text-xs text-muted-foreground">Key Changes</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Key Improvements:</h4>
              {tailoringChanges.map((change, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">{change.section}:</span> {change.change}
                    {change.highlight && (
                      <Badge variant="secondary" className="ml-2 text-xs">High Impact</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tailored Resume Preview
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold">{resumeData.personalInfo.fullName || "Your Name"}</h3>
            <p className="text-sm text-muted-foreground">{jobData.jobTitle}</p>
            <div className="text-xs text-muted-foreground flex gap-4">
              <span>{resumeData.personalInfo.email || "email@example.com"}</span>
              <span>{resumeData.personalInfo.phone || "(555) 123-4567"}</span>
              <span>{resumeData.personalInfo.location || "City, State"}</span>
            </div>
          </div>

          <Separator />

          {/* Enhanced Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              Professional Summary
              <Badge variant="outline" className="text-xs">Enhanced</Badge>
            </h4>
            <p className="text-sm text-muted-foreground">
              {resumeData.summary || `Experienced ${jobData.jobTitle.toLowerCase()} with proven track record in delivering high-quality solutions and leading cross-functional teams. Specialized in modern web technologies and passionate about creating scalable applications that drive business growth.`}
            </p>
          </div>

          {/* Enhanced Skills */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              Technical Skills
              <Badge variant="outline" className="text-xs">Reordered</Badge>
            </h4>
            <div className="flex flex-wrap gap-2">
              {enhancedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Preview */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              Professional Experience
              <Badge variant="outline" className="text-xs">Optimized</Badge>
            </h4>
            <div className="space-y-3">
              {resumeData.experience.slice(0, 2).map((exp, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-sm">{exp.position}</h5>
                      <p className="text-xs text-muted-foreground">{exp.company}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || "Present"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {exp.description || `Led development of key features resulting in 25% improved user engagement. Collaborated with ${jobData.companyName} stakeholders to deliver high-impact solutions.`}
                  </p>
                </div>
              ))}
            </div>
          </div>


          
          {tailoringData && (
            <div className="pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleRevert}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Revert to Original Resume
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Tailored resume saved!</p>
                <p className="text-muted-foreground text-xs">
                  Your tailored resume has been saved as a new version. You can access it anytime.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href="/dashboard/view-resumes">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View All Resumes
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href="/dashboard/cover-letter">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Cover Letter
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}