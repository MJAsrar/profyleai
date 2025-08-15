'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target,
  Clock,
  MessageSquare,
  BarChart3,
  Download,
  Share2,
  PlayCircle,
  Eye
} from 'lucide-react'
import { InterviewSummary } from '@/lib/types/interview-types'

interface VideoInterviewResultsProps {
  sessionId: string
  summary: InterviewSummary
  recordingUrl?: string
  onNewInterview: () => void
  onViewRecording?: () => void
}

interface ScoreCardProps {
  title: string
  score: number
  icon: React.ReactNode
  description: string
}

function ScoreCard({ title, score, icon, description }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium">{title}</h3>
          </div>
          <Badge variant="outline" className={getScoreColor(score)}>
            {getScoreDescription(score)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
          <Progress value={score} className="h-2" />
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function VideoInterviewResults({ 
  sessionId, 
  summary, 
  recordingUrl,
  onNewInterview,
  onViewRecording 
}: VideoInterviewResultsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleDownloadReport = () => {
    // Implement PDF report generation
    console.log('Downloading report for session:', sessionId)
  }

  const handleShareResults = () => {
    // Implement sharing functionality
    console.log('Sharing results for session:', sessionId)
  }

  const getOverallRating = (score: number) => {
    if (score >= 90) return { text: 'Outstanding', color: 'text-green-600', icon: '🏆' }
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600', icon: '⭐' }
    if (score >= 70) return { text: 'Good', color: 'text-blue-600', icon: '👍' }
    if (score >= 60) return { text: 'Fair', color: 'text-yellow-600', icon: '👌' }
    return { text: 'Needs Work', color: 'text-red-600', icon: '📈' }
  }

  const rating = getOverallRating(summary.overallScore)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{rating.icon}</div>
          <CardTitle className="text-2xl">Interview Complete!</CardTitle>
          <div className={`text-xl font-medium ${rating.color}`}>
            {rating.text} Performance
          </div>
          <div className="text-4xl font-bold mt-2">
            {summary.overallScore}%
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button onClick={onNewInterview}>
              Start New Interview
            </Button>
            
            {recordingUrl && onViewRecording && (
              <Button variant="outline" onClick={onViewRecording}>
                <PlayCircle className="h-4 w-4 mr-2" />
                View Recording
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            
            <Button variant="outline" onClick={handleShareResults}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard
              title="Content Quality"
              score={summary.contentScore}
              icon={<MessageSquare className="h-5 w-5" />}
              description="Quality and relevance of your responses"
            />
            
            <ScoreCard
              title="Delivery"
              score={summary.deliveryScore}
              icon={<Target className="h-5 w-5" />}
              description="Speaking clarity and pace"
            />
            
            <ScoreCard
              title="Engagement"
              score={summary.engagementScore}
              icon={<Eye className="h-5 w-5" />}
              description="Eye contact and body language"
            />
            
            <ScoreCard
              title="Confidence"
              score={summary.confidenceScore}
              icon={<Award className="h-5 w-5" />}
              description="Overall confidence level"
            />
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.strengths.slice(0, 5).map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.improvements.slice(0, 5).map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Scores Tab */}
        <TabsContent value="scores" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Overall Score</span>
                    <span className="font-bold">{summary.overallScore}%</span>
                  </div>
                  <Progress value={summary.overallScore} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Content Quality</span>
                    <span>{summary.contentScore}%</span>
                  </div>
                  <Progress value={summary.contentScore} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery Style</span>
                    <span>{summary.deliveryScore}%</span>
                  </div>
                  <Progress value={summary.deliveryScore} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Engagement Level</span>
                    <span>{summary.engagementScore}%</span>
                  </div>
                  <Progress value={summary.engagementScore} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Confidence</span>
                    <span>{summary.confidenceScore}%</span>
                  </div>
                  <Progress value={summary.confidenceScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">Best Area</div>
                      <div className="text-sm text-green-600">
                        {summary.engagementScore >= Math.max(summary.contentScore, summary.deliveryScore, summary.confidenceScore) 
                          ? 'Engagement' 
                          : summary.contentScore >= Math.max(summary.deliveryScore, summary.confidenceScore)
                          ? 'Content Quality'
                          : summary.deliveryScore >= summary.confidenceScore
                          ? 'Delivery Style'
                          : 'Confidence'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {Math.max(summary.contentScore, summary.deliveryScore, summary.engagementScore, summary.confidenceScore)}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium text-orange-800">Focus Area</div>
                      <div className="text-sm text-orange-600">
                        {summary.engagementScore <= Math.min(summary.contentScore, summary.deliveryScore, summary.confidenceScore) 
                          ? 'Engagement' 
                          : summary.contentScore <= Math.min(summary.deliveryScore, summary.confidenceScore)
                          ? 'Content Quality'
                          : summary.deliveryScore <= summary.confidenceScore
                          ? 'Delivery Style'
                          : 'Confidence'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-800">
                      {Math.min(summary.contentScore, summary.deliveryScore, summary.engagementScore, summary.confidenceScore)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {summary.detailedFeedback}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">What You Did Well</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Areas for Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {summary.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Action Plan</CardTitle>
              <p className="text-muted-foreground">
                Follow these recommendations to improve your interview performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={onNewInterview} size="lg">
              Practice These Skills in Another Interview
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
