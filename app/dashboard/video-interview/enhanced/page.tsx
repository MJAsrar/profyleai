'use client'

import { useState } from 'react'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto py-8">
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
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
                  <p className="text-gray-600">
                    Great job! Your interview has been recorded and analyzed.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleInterviewEnd}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Results & Feedback
                  </button>
                  
                  <button
                    onClick={handleStartOver}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Start Another Interview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </VideoInterviewErrorBoundary>
  )
}
