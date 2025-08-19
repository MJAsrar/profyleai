'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedInterviewSetup } from '@/components/video-interview/enhanced-interview-setup'
import { ElevenLabsInterviewRoom } from '@/components/video-interview/elevenlabs-interview-room'
import { VideoInterviewErrorBoundary } from '@/components/video-interview/video-interview-error-boundary'
import { InterviewJobData, PracticeQuestion } from '@/lib/services/interview-service'

type InterviewPhase = 'setup' | 'interview' | 'completed'

interface ResumeData {
  id: string
  title: string
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
  }
  summary?: string
  experience: Array<{
    jobTitle: string
    company: string
    duration: string
    description: string
  }>
  skills: Array<{
    category: string
    skills: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
}

interface InterviewSessionData {
  sessionId: string
  jobData: InterviewJobData
  selectedResume: ResumeData
  questions: PracticeQuestion[]
}

export default function EnhancedVideoInterviewPage() {
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('setup')
  const [sessionData, setSessionData] = useState<InterviewSessionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSetupComplete = async (data: {
    jobData: InterviewJobData
    selectedResume: ResumeData
    questions: PracticeQuestion[]
  }) => {
    try {
      setIsLoading(true)

      // Create video interview session with resume context
      const response = await fetch('/api/video-interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data.jobData,
          questions: data.questions,
          resumeId: data.selectedResume.id,
          aiPersonality: 'professional',
          type: 'practice'
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create interview session')
      }

      // Store session data
      const sessionData: InterviewSessionData = {
        sessionId: result.data.sessionId,
        jobData: data.jobData,
        selectedResume: data.selectedResume,
        questions: data.questions
      }

      setSessionData(sessionData)
      setCurrentPhase('interview')

    } catch (error) {
      console.error('Error creating interview session:', error)
      // Handle error (you might want to add error state)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInterviewComplete = () => {
    setCurrentPhase('completed')
  }

  const handleInterviewEnd = () => {
    // Redirect to results or dashboard
    window.location.href = '/dashboard/video-interview'
  }

  const handleStartOver = () => {
    setCurrentPhase('setup')
    setSessionData(null)
  }

  return (
    <VideoInterviewErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 md:py-8">
          {currentPhase === 'setup' && (
            <EnhancedInterviewSetup
              onSetupComplete={handleSetupComplete}
              isLoading={isLoading}
            />
          )}

          {currentPhase === 'interview' && sessionData && (
            <ElevenLabsInterviewRoom
              sessionId={sessionData.sessionId}
              jobTitle={sessionData.jobData.jobTitle}
              companyName={sessionData.jobData.companyName}
              jobDescription={sessionData.jobData.jobDescription}
              resumeData={sessionData.selectedResume}
              questions={sessionData.questions}
              onInterviewComplete={handleInterviewComplete}
              onInterviewEnd={handleInterviewEnd}
            />
          )}

          {currentPhase === 'completed' && (
            <div className="max-w-2xl mx-auto">
              <Card className="card-elevated shadow-strong border-border/50 text-center">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-medium">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h2 className="heading-2 text-foreground">Interview Complete!</h2>
                      <p className="body-large text-muted-foreground">
                        Great job! Your interview has been recorded and analyzed. We'll provide detailed feedback to help you improve.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleInterviewEnd}
                      className="w-full btn-gradient shadow-medium py-4 text-base font-semibold"
                      size="lg"
                    >
                      View Results & Feedback
                    </Button>
                    
                    <Button
                      onClick={handleStartOver}
                      variant="outline"
                      className="w-full border-border/50 hover:bg-muted/50 py-4 text-base"
                      size="lg"
                    >
                      Start Another Interview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </VideoInterviewErrorBoundary>
  )
}
