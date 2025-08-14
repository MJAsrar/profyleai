'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Video, 
  Plus, 
  Play, 
  Clock, 
  Award, 
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { VideoInterviewSetup } from '@/components/video-interview/video-interview-setup'
import { VideoInterviewRoom } from '@/components/video-interview/video-interview-room'
import { VideoInterviewResults } from '@/components/video-interview/video-interview-results'
import { useVideoInterviewStore } from '@/lib/stores/video-interview-store'
import { InterviewJobData, PracticeQuestion } from '@/lib/services/interview-service'
import { VideoInterviewSession, InterviewSummary } from '@/lib/services/video-interview-service'

interface VideoInterviewData {
  id: string
  sessionId: string
  title: string
  status: string
  jobTitle: string
  companyName: string
  createdAt: string
  overallScore?: number
  recordingUrl?: string
}

type InterviewPhase = 'setup' | 'questions' | 'device-setup' | 'interview' | 'results'

export default function VideoInterviewPage() {
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('setup')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [jobData, setJobData] = useState<InterviewJobData>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    industry: '',
    experienceLevel: 'mid'
  })
  
  // Generated data
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentSession, setCurrentSession] = useState<VideoInterviewSession | null>(null)
  const [interviewResults, setInterviewResults] = useState<InterviewSummary | null>(null)
  
  // Previous interviews
  const [previousInterviews, setPreviousInterviews] = useState<VideoInterviewData[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  const { initializeSession, cleanup } = useVideoInterviewStore()

  // Load previous interviews on mount
  useEffect(() => {
    loadPreviousInterviews()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const loadPreviousInterviews = async () => {
    try {
      const response = await fetch('/api/video-interview/list?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setPreviousInterviews(data.data.videoInterviews)
      }
    } catch (error) {
      console.error('Failed to load previous interviews:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleGenerateQuestions = async () => {
    if (!jobData.companyName || !jobData.jobTitle) {
      setError('Please fill in company name and job title')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Generating questions for:', jobData)
      
      // Call the existing API endpoint instead of the service directly
      const response = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          questionCount: 8 // Generate 8 questions for video interview
        })
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        setQuestions(result.data.questions)
        setCurrentPhase('device-setup')
      } else {
        throw new Error(result.error || 'Failed to generate questions')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate questions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupComplete = async (deviceConfig: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create video interview session
      const response = await fetch('/api/video-interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          questions,
          aiPersonality: 'professional',
          type: 'practice'
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create interview session')
      }

      // Create session object
      const session: VideoInterviewSession = {
        sessionId: data.data.sessionId,
        userId: 'current-user', // This would come from auth
        jobData,
        questions,
        currentQuestionIndex: 0,
        status: 'scheduled',
        aiPersonality: 'professional',
        recordingStatus: 'none'
      }

      setCurrentSession(session)
      initializeSession(session)
      setCurrentPhase('interview')
    } catch (error) {
      console.error('Error creating session:', error)
      setError(error instanceof Error ? error.message : 'Failed to create interview session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInterviewComplete = () => {
    // Mock results for now - in production this would come from the API
    const mockResults: InterviewSummary = {
      overallScore: 78,
      confidenceScore: 82,
      engagementScore: 75,
      deliveryScore: 80,
      contentScore: 76,
      strengths: [
        'Clear and articulate communication',
        'Good use of specific examples',
        'Professional demeanor throughout',
        'Strong eye contact and engagement'
      ],
      improvements: [
        'Could provide more quantified results',
        'Practice the STAR framework more consistently',
        'Reduce filler words (um, uh)',
        'Improve pacing - some responses were rushed'
      ],
      detailedFeedback: `You demonstrated strong communication skills and professionalism throughout the interview. Your responses showed good preparation and relevant experience. To improve further, focus on structuring your answers using the STAR method more consistently and including specific metrics when discussing achievements. Your confidence level was appropriate and you maintained good engagement with the interviewer.`,
      recommendations: [
        'Practice the STAR framework with 3-5 stories from your experience',
        'Prepare specific metrics and numbers for your achievements',
        'Record yourself answering questions to identify filler words',
        'Practice pacing by speaking more slowly and deliberately'
      ],
      nextSteps: [
        'Schedule follow-up practice sessions focusing on weak areas',
        'Prepare additional STAR stories for behavioral questions',
        'Research the company and role more deeply',
        'Practice with mock technical questions if applicable'
      ]
    }

    setInterviewResults(mockResults)
    setCurrentPhase('results')
  }

  const handleInterviewEnd = () => {
    handleInterviewComplete()
  }

  const handleNewInterview = () => {
    setCurrentPhase('setup')
    setCurrentSession(null)
    setInterviewResults(null)
    setQuestions([])
    setJobData({
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      industry: '',
      experienceLevel: 'mid'
    })
    setError(null)
    cleanup()
    loadPreviousInterviews() // Refresh the list
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Render different phases
  if (currentPhase === 'device-setup') {
    return (
      <div className="container mx-auto py-8">
        <VideoInterviewSetup
          onSetupComplete={handleSetupComplete}
          isLoading={isLoading}
        />
        {error && (
          <Alert className="mt-4 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  if (currentPhase === 'interview' && currentSession) {
    return (
      <VideoInterviewRoom
        sessionId={currentSession.sessionId}
        onInterviewComplete={handleInterviewComplete}
        onInterviewEnd={handleInterviewEnd}
      />
    )
  }

  if (currentPhase === 'results' && interviewResults) {
    return (
      <div className="container mx-auto py-8">
        <VideoInterviewResults
          sessionId={currentSession?.sessionId || ''}
          summary={interviewResults}
          recordingUrl={currentSession?.recordingUrl}
          onNewInterview={handleNewInterview}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Interview Practice</h1>
          <p className="text-muted-foreground">
            Practice interviews with AI-powered feedback and analysis
          </p>
        </div>
        
        <Button onClick={() => setCurrentPhase('setup')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Interview
        </Button>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Start Interview</TabsTrigger>
          <TabsTrigger value="history">Interview History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          {currentPhase === 'setup' && (
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Setup Your Interview
                </CardTitle>
                <p className="text-muted-foreground">
                  Tell us about the position you're interviewing for
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={jobData.companyName}
                      onChange={(e) => setJobData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g., Google, Microsoft"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={jobData.jobTitle}
                      onChange={(e) => setJobData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={jobData.industry || ''}
                      onChange={(e) => setJobData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select 
                      value={jobData.experienceLevel} 
                      onValueChange={(value: any) => setJobData(prev => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                        <SelectItem value="executive">Executive Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Job Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={jobData.jobDescription}
                    onChange={(e) => setJobData(prev => ({ ...prev, jobDescription: e.target.value }))}
                    placeholder="Paste the job description here for more tailored questions..."
                    rows={4}
                  />
                </div>
                
                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleGenerateQuestions}
                  disabled={isLoading || !jobData.companyName || !jobData.jobTitle}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Video Interview
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
              <p className="text-muted-foreground">
                Review your past video interview sessions
              </p>
            </CardHeader>
            
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : previousInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No interviews yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first video interview to see your history here
                  </p>
                  <Button onClick={() => setCurrentPhase('setup')}>
                    Start First Interview
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {previousInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{interview.title}</h3>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(interview.createdAt)}
                          </span>
                          {interview.overallScore && (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {interview.overallScore}% Score
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {interview.status === 'completed' && interview.overallScore && (
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                        )}
                        {interview.recordingUrl && (
                          <Button variant="outline" size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Watch
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium">Total Interviews</h3>
                </div>
                <div className="text-2xl font-bold">{previousInterviews.length}</div>
                <p className="text-sm text-muted-foreground">Practice sessions completed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium">Average Score</h3>
                </div>
                <div className="text-2xl font-bold">
                  {previousInterviews.filter(i => i.overallScore).length > 0
                    ? Math.round(
                        previousInterviews
                          .filter(i => i.overallScore)
                          .reduce((sum, i) => sum + (i.overallScore || 0), 0) /
                        previousInterviews.filter(i => i.overallScore).length
                      )
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Across all completed interviews</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <h3 className="font-medium">Improvement</h3>
                </div>
                <div className="text-2xl font-bold text-green-600">+12%</div>
                <p className="text-sm text-muted-foreground">Since your first interview</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics charts will appear here after you complete more interviews</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
