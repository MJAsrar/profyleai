'use client'
//
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
  Eye,
  MessageSquare
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
    <div className="w-full space-y-6 md:space-y-8">
      {/* Progress Steps */}
      <Card className="card-elevated border-primary/20 bg-gradient-to-br from-card to-muted/20 shadow-medium">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
              {[
                { id: 'job-details', label: 'Job Details', number: 1 },
                { id: 'resume-selection', label: 'Resume', number: 2 },
                { id: 'questions', label: 'Questions', number: 3 },
                { id: 'ready', label: 'Ready', number: 4 }
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-full transition-all ${
                    currentStep === step.id 
                      ? 'bg-primary text-primary-foreground shadow-medium' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === step.id ? 'bg-primary-foreground/20' : 'bg-background'
                    }`}>
                      <span className={currentStep === step.id ? 'text-primary-foreground' : 'text-muted-foreground'}>
                        {step.number}
                      </span>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <div className="w-4 md:w-8 h-0.5 bg-border mx-1 md:mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="shadow-medium border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium text-foreground">{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Job Details */}
      {currentStep === 'job-details' && (
        <Card className="card-elevated shadow-strong border-border/50">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-medium">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="heading-3 text-foreground">Job Details</h2>
                <p className="body-small text-muted-foreground font-normal">Tell us about the position you're interviewing for</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="body-default font-semibold text-foreground">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={jobData.jobTitle}
                  onChange={(e) => setJobData({ ...jobData, jobTitle: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="body-default font-semibold text-foreground">Company Name *</Label>
                <Input
                  id="companyName"
                  value={jobData.companyName}
                  onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                  placeholder="e.g., Google"
                  className="border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="industry" className="body-default font-semibold text-foreground">Industry</Label>
                <Input
                  id="industry"
                  value={jobData.industry}
                  onChange={(e) => setJobData({ ...jobData, industry: e.target.value })}
                  placeholder="e.g., Technology"
                  className="border-border/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceLevel" className="body-default font-semibold text-foreground">Experience Level</Label>
                <Select 
                  value={jobData.experienceLevel} 
                  onValueChange={(value: any) => setJobData({ ...jobData, experienceLevel: value })}
                >
                  <SelectTrigger className="border-border/50 focus:border-primary/50 focus:ring-primary/20">
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
            
            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="body-default font-semibold text-foreground">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={jobData.jobDescription}
                onChange={(e) => setJobData({ ...jobData, jobDescription: e.target.value })}
                placeholder="Paste the job description here (optional but recommended for better questions)"
                rows={6}
                className="border-border/50 focus:border-primary/50 focus:ring-primary/20 resize-none"
              />
              <p className="body-small text-muted-foreground">
                Adding a job description helps us generate more targeted interview questions.
              </p>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleJobDataSubmit}
                className="btn-gradient shadow-medium px-6 py-3"
                size="lg"
              >
                Next: Select Resume <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Resume Selection */}
      {currentStep === 'resume-selection' && (
        <Card className="card-elevated shadow-strong border-border/50">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-medium">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="heading-3 text-foreground">Select Your Resume</h2>
                <p className="body-small text-muted-foreground font-normal">
                  Choose the resume that best matches this job opportunity. The AI will reference your specific experience during the interview.
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isLoadingResumes ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="heading-3 text-foreground">No Resumes Found</h3>
                  <p className="body-default text-muted-foreground max-w-sm mx-auto">
                    You need to create a resume first before starting a video interview.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard/resume-builder'}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  Create Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`group border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      selectedResumeId === resume.id
                        ? 'border-primary bg-primary/5 shadow-medium'
                        : 'border-border/50 hover:border-primary/30 hover:shadow-soft bg-card'
                    }`}
                    onClick={() => setSelectedResumeId(resume.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {resume.title}
                          </h3>
                          {selectedResumeId === resume.id && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="body-small text-muted-foreground">
                            <User className="h-4 w-4 inline mr-2" />
                            {resume.personalInfo?.fullName || 'No name provided'}
                          </p>
                          <p className="body-small text-muted-foreground">
                            {getResumeSummary(resume)}
                          </p>
                        </div>
                        
                        {resume.summary && (
                          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                            <p className="body-small text-foreground line-clamp-2">
                              {resume.summary.substring(0, 150)}...
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-4 border-border/50 hover:bg-primary/5 hover:border-primary/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {resumes.length > 0 && (
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('job-details')}
                  className="border-border/50 hover:bg-muted/50"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleResumeSelection} 
                  disabled={!selectedResumeId}
                  className="btn-gradient shadow-medium px-6"
                  size="lg"
                >
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
        <Card className="card-elevated shadow-strong border-border/50">
          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-border/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-medium">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="heading-3 text-foreground">Interview Questions Ready</h2>
                <p className="body-small text-muted-foreground font-normal">
                  We've generated {questions.length} personalized questions based on the {jobData.jobTitle} role and your resume.
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
              <h4 className="font-semibold mb-4 text-foreground">Interview Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Position", value: jobData.jobTitle, icon: Briefcase },
                  { label: "Company", value: jobData.companyName, icon: Building },
                  { label: "Resume", value: getSelectedResume()?.title, icon: FileText },
                  { label: "Questions", value: `${questions.length} questions`, icon: MessageSquare }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="body-small text-muted-foreground">{item.label}:</span>
                      <span className="ml-2 font-medium text-foreground">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Sample Questions Preview</h4>
              <div className="space-y-3">
                {questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border/50 border-l-4 border-l-primary">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <p className="body-default text-foreground leading-relaxed">{question.question}</p>
                    </div>
                  </div>
                ))}
                {questions.length > 3 && (
                  <div className="text-center p-4 rounded-lg bg-muted/20 border border-border/30">
                    <p className="body-small text-muted-foreground">
                      + {questions.length - 3} more personalized questions await you...
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('resume-selection')}
                className="border-border/50 hover:bg-muted/50"
              >
                Back
              </Button>
              <Button 
                onClick={handleStartInterview} 
                disabled={isLoading}
                className="btn-gradient shadow-medium px-8 py-3"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    Start AI Interview
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
