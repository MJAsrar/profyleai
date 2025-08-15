'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Briefcase, 
  Building, 
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye
} from 'lucide-react'
import { InterviewJobData, PracticeQuestion } from '@/lib/services/interview-service'

// Resume data interface (matches database structure)
interface ResumeData {
  id: string
  title: string
  personalInfo: any // JSON field from database
  summary?: string
  experience: any[] // JSON array from database
  skills: any[] // JSON array from database
  education: any[] // JSON array from database
  projects: any[] // JSON array from database
  certifications?: any[] // JSON array from database
  template?: {
    id: string
    name: string
    category: string
    previewUrl?: string
  }
  createdAt?: string
  updatedAt?: string
}

interface EnhancedInterviewSetupProps {
  onSetupComplete: (data: {
    jobData: InterviewJobData
    selectedResume: ResumeData
    questions: PracticeQuestion[]
  }) => void
  isLoading?: boolean
}

export function EnhancedInterviewSetup({ onSetupComplete, isLoading = false }: EnhancedInterviewSetupProps) {
  const [currentStep, setCurrentStep] = useState<'job-details' | 'resume-selection' | 'questions' | 'ready'>('job-details')
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Job data
  const [jobData, setJobData] = useState<InterviewJobData>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    industry: '',
    experienceLevel: 'mid'
  })
  
  // Resume data
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  
  // Generated questions
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])

  // Load user's resumes on mount
  useEffect(() => {
    loadUserResumes()
  }, [])

  const loadUserResumes = async () => {
    try {
      setIsLoadingResumes(true)
      const response = await fetch('/api/resumes')
      const data = await response.json()
      
      console.log('📄 Resume API Response:', data)
      
      if (data.success) {
        const resumesData = data.data || []
        console.log('📋 Found resumes:', resumesData.length, resumesData)
        setResumes(resumesData)
        // Auto-select first resume if available
        if (resumesData.length > 0) {
          setSelectedResumeId(resumesData[0].id)
        }
      } else {
        throw new Error(data.error || 'Failed to load resumes')
      }
    } catch (error) {
      console.error('Failed to load resumes:', error)
      setError('Failed to load your resumes. Please try again.')
    } finally {
      setIsLoadingResumes(false)
    }
  }

  const handleJobDataSubmit = () => {
    if (!jobData.jobTitle || !jobData.companyName) {
      setError('Please fill in job title and company name')
      return
    }
    setError(null)
    setCurrentStep('resume-selection')
  }

  const handleResumeSelection = () => {
    if (!selectedResumeId) {
      setError('Please select a resume')
      return
    }
    setError(null)
    generateQuestions()
  }

  const generateQuestions = async () => {
    try {
      setIsGeneratingQuestions(true)
      setError(null)
      
      const selectedResume = resumes.find(r => r.id === selectedResumeId)
      if (!selectedResume) {
        throw new Error('Selected resume not found')
      }

      // Generate questions based on job data and resume
      const response = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          resumeData: {
            summary: selectedResume.summary,
            experience: selectedResume.experience,
            skills: selectedResume.skills,
            projects: selectedResume.projects
          }
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      setQuestions(data.data.questions)
      setCurrentStep('questions')
    } catch (error) {
      console.error('Error generating questions:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate questions')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleStartInterview = () => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId)
    if (!selectedResume) {
      setError('Selected resume not found')
      return
    }

    onSetupComplete({
      jobData,
      selectedResume,
      questions
    })
  }

  const getSelectedResume = () => resumes.find(r => r.id === selectedResumeId)

  // Generate resume summary for display
  const getResumeSummary = (resume: ResumeData) => {
    const experienceCount = Array.isArray(resume.experience) ? resume.experience.length : 0
    const skillCount = Array.isArray(resume.skills) ? 
      resume.skills.reduce((acc, cat) => acc + (Array.isArray(cat.skills) ? cat.skills.length : 0), 0) : 0
    const projectCount = Array.isArray(resume.projects) ? resume.projects.length : 0
    return `${experienceCount} positions • ${skillCount} skills • ${projectCount} projects`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Badge variant={currentStep === 'job-details' ? 'default' : 'secondary'}>
                1. Job Details
              </Badge>
              <Badge variant={currentStep === 'resume-selection' ? 'default' : 'secondary'}>
                2. Resume Selection
              </Badge>
              <Badge variant={currentStep === 'questions' ? 'default' : 'secondary'}>
                3. Review Questions
              </Badge>
              <Badge variant={currentStep === 'ready' ? 'default' : 'secondary'}>
                4. Ready
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Job Details */}
      {currentStep === 'job-details' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={jobData.jobTitle}
                  onChange={(e) => setJobData({ ...jobData, jobTitle: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={jobData.companyName}
                  onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                  placeholder="e.g., Google"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={jobData.industry}
                  onChange={(e) => setJobData({ ...jobData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select 
                  value={jobData.experienceLevel} 
                  onValueChange={(value: any) => setJobData({ ...jobData, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="lead">Lead Level (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={jobData.jobDescription}
                onChange={(e) => setJobData({ ...jobData, jobDescription: e.target.value })}
                placeholder="Paste the job description here (optional but recommended for better questions)"
                rows={6}
              />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleJobDataSubmit}>
                Next: Select Resume <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Resume Selection */}
      {currentStep === 'resume-selection' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Your Resume
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose the resume that best matches this job opportunity. The AI will reference your specific experience during the interview.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingResumes ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading your resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Resumes Found</h3>
                <p className="text-muted-foreground mb-4">
                  You need to create a resume first before starting a video interview.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/resume-builder'}>
                  Create Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedResumeId === resume.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedResumeId(resume.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{resume.title}</h3>
                          {selectedResumeId === resume.id && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {resume.personalInfo?.fullName || 'No name provided'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getResumeSummary(resume)}
                        </p>
                        {resume.summary && (
                          <p className="text-sm mt-2 line-clamp-2">
                            {resume.summary.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {resumes.length > 0 && (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('job-details')}>
                  Back
                </Button>
                <Button onClick={handleResumeSelection} disabled={!selectedResumeId}>
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      Generate Questions <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review Questions */}
      {currentStep === 'questions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Interview Questions Ready
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              We've generated {questions.length} personalized questions based on the {jobData.jobTitle} role and your resume.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Interview Overview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <span className="ml-2 font-medium">{jobData.jobTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Company:</span>
                  <span className="ml-2 font-medium">{jobData.companyName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Resume:</span>
                  <span className="ml-2 font-medium">{getSelectedResume()?.title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="ml-2 font-medium">{questions.length} questions</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Sample Questions</h4>
              <div className="space-y-2">
                {questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-3">
                    <p className="text-sm">{question.question}</p>
                  </div>
                ))}
                {questions.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    + {questions.length - 3} more questions...
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('resume-selection')}>
                Back
              </Button>
              <Button onClick={handleStartInterview} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
