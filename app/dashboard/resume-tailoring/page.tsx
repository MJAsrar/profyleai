"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/ui/page-container"
import { MotionWrapper } from "@/components/ui/motion-wrapper"
import { ResumeTailoringHeader } from "@/components/resume-tailoring/resume-tailoring-header"
import { JobInputForm } from "@/components/resume-tailoring/job-input-form"
import { TailoredResumePreview } from "@/components/resume-tailoring/tailored-resume-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"


export default function ResumeTailoringPage() {
  const { 
    tailorResume, 
    revertTailoring, 
    getTailoringStatus,
    loadTailoredResume,
    isTailoring, 
    tailoringData,
    resumeData 
  } = useResumeStore()

  const [jobData, setJobData] = useState<{
    jobTitle: string
    jobDescription: string
    companyName: string
    baseResumeId?: string
  }>({
    jobTitle: "",
    jobDescription: "",
    companyName: "",
    baseResumeId: "",
  })
  
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing tailoring data on mount
  useEffect(() => {
    const loadTailoringStatus = async () => {
      try {
        const status = await getTailoringStatus()
        if (status.hasTailoredResume && status.currentTailoring) {
          setJobData({
            jobTitle: status.currentTailoring.jobTitle,
            jobDescription: "", // We don't store full job description in status
            companyName: status.currentTailoring.companyName,
          })
          setShowPreview(true)
        }
      } catch (error) {
        console.error('Failed to load tailoring status:', error)
      }
    }

    loadTailoringStatus()
  }, [getTailoringStatus])

  const handleJobSubmit = async (data: { jobTitle: string; jobDescription: string; companyName: string; baseResumeId?: string }) => {
    setJobData(data)
    setError(null)
    
    try {
      const result = await tailorResume(data)
      
      // Load the newly created tailored resume into the store
      if (result?.tailoredResume?.id) {
        console.log('Loading tailored resume into store:', result.tailoredResume.id)
        await loadTailoredResume(result.tailoredResume.id)
      }
      
      setShowPreview(true)
      
      console.log('Tailoring completed, new tailored resume created:', result?.tailoredResume?.id)
    } catch (error) {
      console.error('Tailoring failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to tailor resume')
    }
  }

  const handleReset = async () => {
    try {
      setError(null)
      if (tailoringData) {
        // If there's tailored data, revert to original
        await revertTailoring()
      }
      setJobData({ jobTitle: "", jobDescription: "", companyName: "" })
      setShowPreview(false)
    } catch (error) {
      console.error('Failed to reset:', error)
      setError(error instanceof Error ? error.message : 'Failed to reset')
    }
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
      <MotionWrapper animation="fade-in-down">
        <ResumeTailoringHeader onReset={handleReset} showReset={showPreview} />
      </MotionWrapper>

      <div className="mt-6">
        {/* Error Alert */}
        {error && (
          <MotionWrapper animation="fade-in">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </MotionWrapper>
        )}

        {/* Loading State */}
        {isTailoring ? (
          <MotionWrapper animation="scale-in">
            <Card className="mx-auto max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Tailoring Your Resume</h3>
                <p className="text-sm text-muted-foreground text-center">
                  AI is analyzing the job requirements and optimizing your resume...
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This may take 10-30 seconds
                </p>
              </CardContent>
            </Card>
          </MotionWrapper>
        ) : !showPreview ? (
          <MotionWrapper animation="fade-in-up" delay={200}>
            <JobInputForm onSubmit={handleJobSubmit} />
          </MotionWrapper>
        ) : (
          <MotionWrapper animation="fade-in-up" delay={300}>
            <TailoredResumePreview 
              jobData={jobData} 
              tailoringData={tailoringData}
              resumeData={resumeData}
            />
          </MotionWrapper>
        )}
      </div>
    </PageContainer>
  )
}