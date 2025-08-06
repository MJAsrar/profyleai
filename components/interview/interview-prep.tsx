"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Building,
  Brain,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  Timer,
  Star,
  Lightbulb,
  FileText,
  BarChart3,
  Zap,
  Send,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  PracticeQuestion, 
  AnswerFeedback, 
  CompanyResearch, 
  BehavioralCoaching,
  MockInterviewSession,
  MockInterviewSummary,
  InterviewProgress
} from "@/lib/services/interview-service"

interface JobFormData {
  companyName: string
  jobTitle: string
  jobDescription: string
  industry: string
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
}

interface InterviewPrepData {
  id: string
  title: string
  companyName: string
  jobTitle: string
  jobDescription: string
  industry?: string
  experienceLevel: string
  questions: PracticeQuestion[]
  companyResearch?: CompanyResearch
  behavioralCoaching?: BehavioralCoaching
  questionsGenerated: boolean
  researchCompleted: boolean
  coachingLoaded: boolean
  createdAt: string
  updatedAt: string
}

export function InterviewPrep() {
  const { toast } = useToast()
  

  
  // Main state
  const [currentView, setCurrentView] = useState<'list' | 'new' | 'existing'>('list')
  const [existingPreps, setExistingPreps] = useState<InterviewPrepData[]>([])
  const [selectedPrep, setSelectedPrep] = useState<InterviewPrepData | null>(null)
  const [isLoadingPreps, setIsLoadingPreps] = useState(true)
  const [currentInterviewPrepId, setCurrentInterviewPrepId] = useState<string | null>(null)
  
  // Job setup state
  const [jobData, setJobData] = useState<JobFormData>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    industry: '',
    experienceLevel: 'mid'
  })
  
  // Practice questions state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false)
  
  // Mock interview state
  const [mockSession, setMockSession] = useState<MockInterviewSession | null>(null)
  const [mockSummary, setMockSummary] = useState<MockInterviewSummary | null>(null)
  const [interviewTimer, setInterviewTimer] = useState(0)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  
  // Company research state
  const [companyResearch, setCompanyResearch] = useState<CompanyResearch | null>(null)
  const [isResearchingCompany, setIsResearchingCompany] = useState(false)
  
  // Behavioral coaching state
  const [behavioralCoaching, setBehavioralCoaching] = useState<BehavioralCoaching | null>(null)
  const [isLoadingCoaching, setIsLoadingCoaching] = useState(false)
  
  // Answer feedback state
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null)
  
  // Load existing interview preps on component mount
  useEffect(() => {
    loadExistingPreps()
  }, [])

  // Timer effect for mock interviews
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isInterviewActive) {
      interval = setInterval(() => {
        setInterviewTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isInterviewActive])

  const loadExistingPreps = async () => {
    setIsLoadingPreps(true)
    try {
      const response = await fetch('/api/interview/list')
      const result = await response.json()
      
      if (result.success) {
        setExistingPreps(result.data)
        if (result.data.length === 0) {
          setCurrentView('new')
        }
    } else {
        console.error('Failed to load interview preps:', result.error)
      toast({
          title: "Loading Failed",
          description: "Could not load your interview preparations.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading interview preps:', error)
      toast({
        title: "Loading Failed",
        description: "Could not load your interview preparations.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingPreps(false)
    }
  }

  const selectExistingPrep = async (prep: InterviewPrepData) => {
    setSelectedPrep(prep)
    setCurrentInterviewPrepId(prep.id)
    setJobData({
      companyName: prep.companyName,
      jobTitle: prep.jobTitle,
      jobDescription: prep.jobDescription,
      industry: prep.industry || '',
      experienceLevel: prep.experienceLevel as any
    })
    setQuestions(prep.questions)
    setCompanyResearch(prep.companyResearch || null)
    setBehavioralCoaching(prep.behavioralCoaching || null)
    setCurrentView('existing')
    
    // Reset other states
    setCurrentQuestionIndex(0)
    setCurrentAnswer('')
    setAnswerFeedback(null)
    setMockSession(null)
    setMockSummary(null)
  }

  const startNewPrep = () => {
    setSelectedPrep(null)
    setCurrentInterviewPrepId(null)
    setJobData({
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      industry: '',
      experienceLevel: 'mid'
    })
    setQuestions([])
    setCompanyResearch(null)
    setBehavioralCoaching(null)
    setCurrentView('new')
    
    // Reset other states
    setCurrentQuestionIndex(0)
    setCurrentAnswer('')
    setAnswerFeedback(null)
    setMockSession(null)
    setMockSummary(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return <Users className="h-4 w-4" />
      case 'technical': return <Brain className="h-4 w-4" />
      case 'situational': return <Target className="h-4 w-4" />
      case 'company-specific': return <Building className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const generateQuestions = async () => {
    if (!jobData.companyName || !jobData.jobTitle || !jobData.jobDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in company name, job title, and job description.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingQuestions(true)
    try {
      const response = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...jobData, questionCount: 10 })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setQuestions(result.data.questions)
        setCurrentInterviewPrepId(result.data.interviewPrepId)
        setCurrentQuestionIndex(0)
        setCurrentAnswer('')
        setAnswerFeedback(null)
        
        // Refresh the list of existing preps
        await loadExistingPreps()
        
        toast({
          title: "Questions Generated!",
          description: `Generated ${result.data.questions.length} personalized interview questions.`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const evaluateCurrentAnswer = async () => {
    if (!currentAnswer.trim() || !questions[currentQuestionIndex]) {
      toast({
        title: "No Answer",
        description: "Please provide an answer before evaluation.",
        variant: "destructive"
      })
      return
    }

    setIsEvaluatingAnswer(true)
    try {
      const response = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[currentQuestionIndex],
          answer: currentAnswer,
          jobContext: jobData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAnswerFeedback(result.data)
        toast({
          title: "Answer Evaluated!",
          description: `Your answer scored ${result.data.score}/100 points.`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error evaluating answer:', error)
      toast({
        title: "Evaluation Failed",
        description: "Failed to evaluate answer. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsEvaluatingAnswer(false)
    }
  }

  const startMockInterview = async () => {
    if (questions.length === 0 || !currentInterviewPrepId) {
      toast({
        title: "No Questions",
        description: "Please generate questions first.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/interview/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          interviewPrepId: currentInterviewPrepId,
          questions: questions
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMockSession(result.data)
        setMockSummary(null)
        setInterviewTimer(0)
        setIsInterviewActive(true)
        setCurrentQuestionIndex(0)
        setCurrentAnswer('')
        toast({
          title: "Mock Interview Started!",
          description: `Starting ${result.data.questions.length} question mock interview.`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error starting mock interview:', error)
      toast({
        title: "Failed to Start",
        description: "Could not start mock interview. Please try again.",
        variant: "destructive"
      })
    }
  }

  const completeMockInterview = async () => {
    if (!mockSession) return

    setIsInterviewActive(false)
    
    try {
      const response = await fetch('/api/interview/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          mockInterviewId: mockSession.sessionId,
          totalTime: interviewTimer
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMockSummary(result.data.summary)
        toast({
          title: "Interview Complete!",
          description: `Overall score: ${result.data.summary.overallScore}/100`
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error completing mock interview:', error)
      toast({
        title: "Completion Failed",
        description: "Could not complete interview analysis.",
        variant: "destructive"
      })
    }
  }

  const researchCompany = async () => {
    if (!jobData.companyName || !jobData.jobTitle || !currentInterviewPrepId) {
      toast({
        title: "Missing Information",
        description: "Please generate questions first or provide company name and job title.",
        variant: "destructive"
      })
      return
    }

    setIsResearchingCompany(true)
    try {
      const response = await fetch('/api/interview/company-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: jobData.companyName,
          jobTitle: jobData.jobTitle,
          industry: jobData.industry,
          interviewPrepId: currentInterviewPrepId
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCompanyResearch(result.data)
        toast({
          title: "Research Complete!",
          description: "Company insights and likely questions ready."
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error researching company:', error)
      toast({
        title: "Research Failed",
        description: "Could not research company. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsResearchingCompany(false)
    }
  }

  const loadBehavioralCoaching = async () => {
    if (!jobData.jobTitle || !currentInterviewPrepId) {
      toast({
        title: "Missing Information",
        description: "Please generate questions first or provide a job title.",
        variant: "destructive"
      })
      return
    }

    setIsLoadingCoaching(true)
    try {
      const response = await fetch('/api/interview/behavioral-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: jobData.jobTitle,
          experienceLevel: jobData.experienceLevel,
          interviewPrepId: currentInterviewPrepId
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBehavioralCoaching(result.data)
        toast({
          title: "Coaching Loaded!",
          description: "Behavioral questions and coaching tips ready."
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error loading coaching:', error)
      toast({
        title: "Loading Failed",
        description: "Could not load coaching content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingCoaching(false)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setCurrentAnswer('')
      setAnswerFeedback(null)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setCurrentAnswer('')
      setAnswerFeedback(null)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="relative space-y-8">
      {/* Interview Prep List/Selection */}
      {currentView === 'list' && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center py-8 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl border">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Interview Preparation</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Master your interviews with AI-powered practice questions, mock interviews, and personalized coaching
            </p>
            <Button onClick={startNewPrep} size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="mr-2 h-5 w-5" />
              Start New Interview Prep
            </Button>
          </div>

          {/* Existing Preparations */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                Your Interview Preparations
              </CardTitle>
              <CardDescription>
                Continue with an existing prep or start fresh with a new preparation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingPreps ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <span className="text-lg font-medium">Loading your preparations...</span>
                  <span className="text-sm text-muted-foreground">This won't take long</span>
                </div>
              ) : existingPreps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Target className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ready to ace your interviews?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first interview preparation to get personalized questions, coaching, and feedback
                  </p>
                  <Button onClick={startNewPrep} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Your First Prep
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {existingPreps.map((prep) => (
                      <Card 
                        key={prep.id} 
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-muted/20" 
                        onClick={() => selectExistingPrep(prep)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                {prep.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {prep.companyName} • {prep.experienceLevel} level
                              </p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                              <Building className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {prep.questionsGenerated && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Questions Ready
                              </Badge>
                            )}
                            {prep.researchCompleted && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                <Building className="h-3 w-3 mr-1" />
                                Research Done
                              </Badge>
                            )}
                            {prep.coachingLoaded && (
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                <Brain className="h-3 w-3 mr-1" />
                                Coaching Ready
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Created {new Date(prep.createdAt).toLocaleDateString()}</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center pt-6 border-t border-muted/50">
                    <Button variant="outline" onClick={startNewPrep} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Start New Interview Prep
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back Button for existing/new views */}
      {(currentView === 'existing' || currentView === 'new') && (
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setCurrentView('list')} className="shadow-md hover:shadow-lg transition-shadow">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Interview Preparations
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Setting up your interview preparation
          </div>
        </div>
      )}

      {/* Job Setup Card - Only show in new or existing view */}
      {(currentView === 'new' || currentView === 'existing') && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">Interview Setup</CardTitle>
                <CardDescription className="text-base mt-1">
                  Tell us about the role you're preparing for and we'll create personalized interview content
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="company" className="text-base font-medium">Company Name</Label>
                <Input
                  id="company"
                  placeholder="e.g. Google, Microsoft, Apple"
                  value={jobData.companyName}
                  onChange={(e) => setJobData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="h-12 text-base border-2 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="jobTitle" className="text-base font-medium">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Software Engineer, Product Manager"
                  value={jobData.jobTitle}
                  onChange={(e) => setJobData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="h-12 text-base border-2 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="industry" className="text-base font-medium">Industry <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input
                  id="industry"
                  placeholder="e.g. Technology, Healthcare, Finance"
                  value={jobData.industry}
                  onChange={(e) => setJobData(prev => ({ ...prev, industry: e.target.value }))}
                  className="h-12 text-base border-2 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="experience" className="text-base font-medium">Experience Level</Label>
                <Select 
                  value={jobData.experienceLevel} 
                  onValueChange={(value) => setJobData(prev => ({ ...prev, experienceLevel: value as any }))}
                >
                  <SelectTrigger className="h-12 text-base border-2 focus:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                    <SelectItem value="executive">Executive (Leadership)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="jobDescription" className="text-base font-medium">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the complete job description here. Include responsibilities, requirements, and qualifications for the most accurate preparation..."
                rows={6}
                value={jobData.jobDescription}
                onChange={(e) => setJobData(prev => ({ ...prev, jobDescription: e.target.value }))}
                className="text-base border-2 focus:border-primary/50 transition-colors resize-none"
              />
              <p className="text-sm text-muted-foreground">
                The more detailed the job description, the better we can tailor your interview preparation.
              </p>
            </div>
            
            <div className="pt-4 border-t border-muted/50">
              <Button 
                onClick={generateQuestions} 
                disabled={isGeneratingQuestions || !jobData.companyName || !jobData.jobTitle}
                size="lg"
                className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating Personalized Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-5 w-5" />
                    Generate Interview Preparation
                  </>
                )}
              </Button>
              {(!jobData.companyName || !jobData.jobTitle) && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Please fill in the company name and job title to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interview Prep Tabs - Only show in new or existing view */}
      {(currentView === 'new' || currentView === 'existing') && (
        <Tabs defaultValue="practice" className="space-y-8">
          <div className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-xl p-2">
            <TabsList className="grid w-full grid-cols-5 bg-transparent border-0 gap-2">
              <TabsTrigger 
                value="practice" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm font-medium transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Practice Questions
              </TabsTrigger>
              <TabsTrigger 
                value="mock" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm font-medium transition-all"
              >
                <Play className="h-4 w-4 mr-2" />
                Mock Interview
              </TabsTrigger>
              <TabsTrigger 
                value="behavioral" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm font-medium transition-all"
              >
                <Brain className="h-4 w-4 mr-2" />
                Behavioral Coaching
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm font-medium transition-all"
              >
                <Building className="h-4 w-4 mr-2" />
                Company Research
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm font-medium transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
            </TabsList>
          </div>

        {/* Practice Questions Tab */}
        <TabsContent value="practice" className="space-y-6">
          {questions.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ready for Practice Questions?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Complete your job details above and generate personalized interview questions tailored to your role.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>AI-powered questions based on your specific job description</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Question Navigation */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getCategoryIcon(currentQuestion?.category)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getDifficultyColor(currentQuestion?.difficulty)} shadow-sm`}>
                          {currentQuestion?.difficulty}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{currentQuestion?.question}</h3>
                    <p className="text-sm text-muted-foreground">
                      Category: {currentQuestion?.category} • Difficulty: {currentQuestion?.difficulty}
                    </p>
                  </div>
                  
                  {/* STAR Framework Guidance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                          <Star className="h-5 w-5" />
                          STAR Framework Guide
                        </h4>
                        <div className="space-y-4">
                          <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                            <div className="font-medium text-sm text-amber-900 dark:text-amber-100">Situation</div>
                            <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">{currentQuestion?.starFramework.situation}</div>
                          </div>
                          <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                            <div className="font-medium text-sm text-amber-900 dark:text-amber-100">Task</div>
                            <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">{currentQuestion?.starFramework.task}</div>
                          </div>
                          <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                            <div className="font-medium text-sm text-amber-900 dark:text-amber-100">Action</div>
                            <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">{currentQuestion?.starFramework.action}</div>
                          </div>
                          <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                            <div className="font-medium text-sm text-amber-900 dark:text-amber-100">Result</div>
                            <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">{currentQuestion?.starFramework.result}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <CardContent className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Lightbulb className="h-5 w-5" />
                          Expert Tips
                        </h4>
                        <ul className="space-y-3">
                          {currentQuestion?.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-blue-700 dark:text-blue-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Answer Input */}
                  <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <Label htmlFor="answer" className="text-base font-semibold text-green-800 dark:text-green-200">Your Answer</Label>
                        </div>
                        <Textarea
                          id="answer"
                          placeholder="Write your answer using the STAR framework. Be specific about the situation, your tasks, actions taken, and measurable results..."
                          rows={8}
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          className="border-2 border-green-200 focus:border-green-400 dark:border-green-800 dark:focus:border-green-600 bg-white/70 dark:bg-black/20 text-base resize-none"
                        />
                        <div className="flex items-center justify-between text-sm text-green-700 dark:text-green-300">
                          <span>{currentAnswer.length} characters</span>
                          <span>Aim for 150-300 words for a complete answer</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={evaluateCurrentAnswer}
                      disabled={isEvaluatingAnswer || !currentAnswer.trim()}
                      size="lg"
                      className="shadow-lg hover:shadow-xl transition-all px-8"
                    >
                      {isEvaluatingAnswer ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          AI is analyzing your answer...
                        </>
                      ) : (
                        <>
                          <Send className="mr-3 h-5 w-5" />
                          Get AI Feedback & Score
                        </>
                      )}
                    </Button>
                  </div>
        </CardContent>
      </Card>

              {/* Answer Feedback */}
              {answerFeedback && (
      <Card>
        <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Answer Evaluation
                      <Badge variant="outline" className="ml-auto">
                        Score: {answerFeedback.score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2 text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {answerFeedback.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2 text-orange-600">
                          <AlertCircle className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {answerFeedback.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">•</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* STAR Analysis */}
                    <div>
                      <h4 className="font-medium mb-3">STAR Framework Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(answerFeedback.starAnalysis).map(([component, analysis]) => (
                          <div key={component} className="text-center">
                            <div className={`p-2 rounded-lg ${
                              analysis.present 
                                ? analysis.quality === 'excellent' ? 'bg-green-100' 
                                  : analysis.quality === 'good' ? 'bg-yellow-100' 
                                  : 'bg-orange-100'
                                : 'bg-red-100'
                            }`}>
                              <div className="font-medium capitalize">{component}</div>
                              <div className="text-sm">
                                {analysis.present ? analysis.quality : 'Missing'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Rewritten Answer */}
                    <div>
                      <h4 className="font-medium mb-2">Professional Rewrite</h4>
                      <div className="p-4 bg-muted rounded-lg text-sm">
                        {answerFeedback.rewrittenAnswer}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Estimated speaking time: {answerFeedback.estimatedTime} seconds
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Mock Interview Tab */}
        <TabsContent value="mock" className="space-y-4">
          {!mockSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Mock Interview Simulation
                </CardTitle>
                <CardDescription>
                  Practice with a full interview simulation and get comprehensive feedback
                </CardDescription>
        </CardHeader>
        <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium">5 Questions</h4>
                      <p className="text-sm text-muted-foreground">Curated from your practice set</p>
                </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Timer className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium">Timed Practice</h4>
                      <p className="text-sm text-muted-foreground">Real interview conditions</p>
              </div>
                    <div className="p-4 border rounded-lg text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <h4 className="font-medium">Detailed Report</h4>
                      <p className="text-sm text-muted-foreground">Comprehensive analysis</p>
                    </div>
            </div>
            
                  <Button 
                    onClick={startMockInterview}
                    disabled={questions.length === 0}
                    className="w-full"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Mock Interview
                  </Button>
                  
                  {questions.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Generate practice questions first to start a mock interview.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : mockSummary ? (
            // Interview Summary
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Interview Summary
                  <Badge variant="outline" className="ml-auto">
                    Overall Score: {mockSummary.overallScore}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">Key Strengths</h4>
                    <ul className="space-y-2">
                      {mockSummary.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
              </div>
                  <div>
                    <h4 className="font-medium mb-3 text-orange-600">Areas to Improve</h4>
                    <ul className="space-y-2">
                      {mockSummary.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
            </div>
            
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Category Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(mockSummary.categoryScores).map(([category, score]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm">{score}/100</span>
                </div>
                        <Progress value={score} className="h-2" />
              </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Time Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Time:</span>
                        <span>{formatTime(mockSummary.timeAnalysis.totalTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average per Question:</span>
                        <span>{formatTime(mockSummary.timeAnalysis.averageTimePerQuestion)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">STAR Framework Usage</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={mockSummary.starFrameworkUsage.overall} className="flex-1" />
                      <span className="text-sm">{mockSummary.starFrameworkUsage.overall}%</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setMockSession(null)
                    setMockSummary(null)
                  }}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start New Mock Interview
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Active Interview
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Mock Interview in Progress
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {mockSession.questions.length}
                    </span>
                    <Badge variant="outline">
                      {formatTime(interviewTimer)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium">{mockSession.questions[currentQuestionIndex]?.question}</h3>
                </div>
                
                <Textarea
                  placeholder="Provide your answer as if speaking to an interviewer..."
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      // In a real implementation, you'd save the answer and move to next question
                      if (currentQuestionIndex < mockSession.questions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1)
                        setCurrentAnswer('')
                      } else {
                        completeMockInterview()
                      }
                    }}
                    disabled={!currentAnswer.trim()}
                  >
                    {currentQuestionIndex < mockSession.questions.length - 1 ? (
                      <>
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Next Question
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Interview
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsInterviewActive(false)
                      setMockSession(null)
                    }}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    End Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Behavioral Coaching Tab */}
        <TabsContent value="behavioral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Behavioral & Situational Coaching
              </CardTitle>
              <CardDescription>
                Master common behavioral questions with model answers and expert tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={loadBehavioralCoaching}
                disabled={isLoadingCoaching || !jobData.jobTitle}
                className="w-full mb-4"
              >
                {isLoadingCoaching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Coaching Content...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Load Behavioral Coaching
                  </>
                )}
              </Button>
              
              {!jobData.jobTitle && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please enter a job title in the setup section first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {behavioralCoaching && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Common Behavioral Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {behavioralCoaching.commonQuestions.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <h4 className="font-medium mb-2">{item.question}</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Model Answer:</h5>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {item.modelAnswer}
              </p>
            </div>
                        <div>
                          <h5 className="text-sm font-medium mb-1">Tips:</h5>
                          <ul className="text-sm space-y-1">
                            {item.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
          </div>
                      </div>
                    </div>
                  ))}
        </CardContent>
      </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Situational Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {behavioralCoaching.situationalScenarios.map((scenario, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{scenario.scenario}</h4>
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium">Recommended Approach:</h5>
                          <p className="text-sm text-muted-foreground">{scenario.approach}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">Key Points to Emphasize:</h5>
                          <ul className="text-sm space-y-1">
                            {scenario.keyPoints.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Company Research Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company-Specific Preparation
              </CardTitle>
              <CardDescription>
                Get insights about the company, culture, and likely interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={researchCompany}
                disabled={isResearchingCompany || !jobData.companyName || !jobData.jobTitle}
                className="w-full mb-4"
              >
                {isResearchingCompany ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching Company...
                  </>
                ) : (
                  <>
                    <Building className="mr-2 h-4 w-4" />
                    Research {jobData.companyName || 'Company'}
                  </>
                )}
              </Button>
              
              {(!jobData.companyName || !jobData.jobTitle) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please enter company name and job title in the setup section first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {companyResearch && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">About {companyResearch.companyName}</h4>
                    <p className="text-sm text-muted-foreground">{companyResearch.overview}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Mission</h4>
                    <p className="text-sm text-muted-foreground">{companyResearch.mission}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Core Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {companyResearch.values.map((value, index) => (
                        <Badge key={index} variant="secondary">{value}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent News</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {companyResearch.recentNews.map((news, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {news}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Industry Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {companyResearch.industryTrends.map((trend, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Likely Interview Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {companyResearch.likelyQuestions.map((question, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Culture Fit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {companyResearch.cultureFit.map((fit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {fit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Competitive Landscape</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {companyResearch.competitorInfo.map((info, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {info}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Interview Preparation Progress
              </CardTitle>
              <CardDescription>
                Track your improvement and identify areas to focus on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mock progress data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-muted-foreground">Sessions Completed</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">78</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">82</div>
                  <div className="text-sm text-muted-foreground">Confidence Score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Key Strengths</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Clear communication style
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Strong problem-solving approach
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Professional demeanor
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-orange-600">Focus Areas</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      Technical depth in explanations
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      STAR framework consistency
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      Quantifying achievements
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium mb-3">Weekly Progress</h4>
                <div className="space-y-3">
                  {[
                    { week: "Week 1", sessions: 2, score: 65 },
                    { week: "Week 2", sessions: 3, score: 72 },
                    { week: "Week 3", sessions: 2, score: 78 },
                    { week: "Week 4", sessions: 1, score: 85 }
                  ].map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{week.week}</span>
                        <span className="text-sm text-muted-foreground">
                          {week.sessions} session{week.sessions !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={week.score} className="w-20" />
                        <span className="text-sm font-medium">{week.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}