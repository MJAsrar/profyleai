'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  User,
  Eye
} from 'lucide-react'

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

export default function VideoInterviewPage() {
  const [previousInterviews, setPreviousInterviews] = useState<VideoInterviewData[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Load previous interviews on mount
  useEffect(() => {
    loadPreviousInterviews()
  }, [])

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

  const handleStartNewInterview = () => {
    window.location.href = '/dashboard/video-interview/enhanced'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">In Progress</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Scheduled</Badge>
      default:
        return <Badge variant="outline" className="border-border/50">{status}</Badge>
    }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered Interview Practice
          </div>
          <h1 className="heading-1 text-foreground">Video Interview Practice</h1>
          <p className="body-large text-muted-foreground max-w-2xl mx-auto">
            Practice interviews with Sarah, our advanced AI interviewer. Get personalized feedback 
            and improve your interview skills with realistic conversation flows.
          </p>
        </div>

        {/* New Interview Card - Enhanced Design */}
        <Card className="card-elevated border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-strong">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-medium">
                  <Video className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="space-y-1">
                  <h2 className="heading-3 text-foreground">Start New Interview</h2>
                  <p className="body-small text-muted-foreground">
                    Experience natural conversations with our advanced AI interviewer Sarah
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Enhanced AI Available
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, text: "Natural conversation flow" },
                { icon: User, text: "Resume-aware questions" },
                { icon: TrendingUp, text: "Professional voice quality" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="body-small font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleStartNewInterview}
                className="btn-gradient shadow-medium flex-1 sm:flex-initial text-base font-semibold py-3 px-8"
                size="lg"
              >
                <Video className="h-5 w-5 mr-2" />
                Start AI Interview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-border/50 hover:bg-muted/50"
                size="lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interview History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="heading-3 text-foreground">Recent Interviews</h3>
                    <p className="body-small text-muted-foreground font-normal">Track your progress and review past sessions</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
                    <span className="text-muted-foreground">Loading interview history...</span>
                  </div>
                ) : previousInterviews.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="heading-3 text-foreground">No interviews yet</h3>
                      <p className="body-default text-muted-foreground max-w-sm mx-auto">
                        Start your first AI interview to see your progress and get personalized feedback.
                      </p>
                    </div>
                    <Button 
                      onClick={handleStartNewInterview} 
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start Your First Interview
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previousInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="group border border-border/50 rounded-xl p-4 hover:shadow-medium hover:border-primary/20 transition-all duration-200 bg-card"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {interview.jobTitle} at {interview.companyName}
                            </h3>
                            <p className="body-small text-muted-foreground">
                              {formatDate(interview.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(interview.status)}
                            {interview.overallScore && (
                              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                                Score: {interview.overallScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:border-primary/30">
                            <Play className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                          {interview.recordingUrl && (
                            <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:border-primary/30">
                              <Video className="h-4 w-4 mr-1" />
                              Watch Recording
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="heading-3 text-foreground">Your Progress</h3>
                    <p className="body-small text-muted-foreground font-normal">Track your improvement</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="body-small text-muted-foreground">Total Interviews</span>
                    <span className="text-xl font-bold text-foreground">{previousInterviews.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="body-small text-muted-foreground">Completed</span>
                    <span className="text-xl font-bold text-foreground">
                      {previousInterviews.filter(i => i.status === 'completed').length}
                    </span>
                  </div>
                  
                  {previousInterviews.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                      <span className="body-small text-muted-foreground">Avg Score</span>
                      <span className="text-xl font-bold text-primary">
                        {Math.round(
                          previousInterviews
                            .filter(i => i.overallScore)
                            .reduce((acc, i) => acc + (i.overallScore || 0), 0) /
                          previousInterviews.filter(i => i.overallScore).length || 0
                        )}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="heading-3 text-foreground">Tips for Success</h3>
                    <p className="body-small text-muted-foreground font-normal">Best practices</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { emoji: "🎯", title: "Be Specific", desc: "Use concrete examples from your experience" },
                    { emoji: "🗣️", title: "Speak Clearly", desc: "Ensure good audio quality for best results" },
                    { emoji: "⏱️", title: "Pace Yourself", desc: "Take time to think before answering" }
                  ].map((tip, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{tip.emoji}</span>
                        <span className="font-semibold text-foreground">{tip.title}</span>
                      </div>
                      <p className="body-small text-muted-foreground leading-relaxed">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}