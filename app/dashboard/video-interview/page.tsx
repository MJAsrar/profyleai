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
  Sparkles
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
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Interview Practice</h1>
          <p className="text-gray-600">Practice interviews with AI-powered feedback and analysis</p>
        </div>

        {/* New Interview Card with ElevenLabs Upgrade Notice */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl">New: AI-Powered Interview Experience</h2>
                <p className="text-sm text-gray-600 font-normal">
                  Experience natural conversations with our advanced AI interviewer Sarah
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Natural conversation flow</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Resume-aware questions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Professional voice quality</span>
              </div>
            </div>
            
            <Button 
              onClick={handleStartNewInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              size="lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Start New AI Interview
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Interview History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading interview history...</span>
                  </div>
                ) : previousInterviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start your first AI interview to see your progress here.
                    </p>
                    <Button onClick={handleStartNewInterview} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Your First Interview
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previousInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {interview.jobTitle} at {interview.companyName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(interview.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(interview.status)}
                            {interview.overallScore && (
                              <Badge variant="outline">
                                Score: {interview.overallScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                          {interview.recordingUrl && (
                            <Button variant="outline" size="sm">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Interviews</span>
                    <span className="font-semibold">{previousInterviews.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold">
                      {previousInterviews.filter(i => i.status === 'completed').length}
                    </span>
                  </div>
                  
                  {previousInterviews.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Score</span>
                      <span className="font-semibold">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium mb-1">🎯 Be Specific</div>
                    <p className="text-gray-600">Use concrete examples from your experience</p>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">🗣️ Speak Clearly</div>
                    <p className="text-gray-600">Ensure good audio quality for best results</p>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">⏱️ Pace Yourself</div>
                    <p className="text-gray-600">Take time to think before answering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}