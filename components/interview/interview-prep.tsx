"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  tips: string[]
}

const sampleQuestions: Question[] = [
  {
    id: "1",
    question: "Tell me about yourself.",
    category: "General",
    difficulty: "Easy",
    tips: [
      "Keep it professional and relevant to the role",
      "Structure: Present, Past, Future",
      "Highlight key achievements",
      "Keep it under 2 minutes",
    ],
  },
  {
    id: "2",
    question: "Why do you want to work here?",
    category: "Company",
    difficulty: "Medium",
    tips: [
      "Research the company thoroughly",
      "Mention specific company values or projects",
      "Connect your goals with company mission",
      "Show genuine enthusiasm",
    ],
  },
  {
    id: "3",
    question: "Describe a challenging project you worked on.",
    category: "Technical",
    difficulty: "Hard",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on your specific contributions",
      "Quantify the impact when possible",
      "Explain what you learned",
    ],
  },
]

export function InterviewPrep() {
  const { toast } = useToast()
  const [jobRole, setJobRole] = useState("")
  const [company, setCompany] = useState("")
  const [experience, setExperience] = useState("")
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [practiceStats, setPracticeStats] = useState({
    questionsAnswered: 12,
    averageTime: 45,
    improvementScore: 78,
  })

  const generateQuestions = () => {
    // Simulate AI question generation
    const newQuestions: Question[] = [
      {
        id: "ai-1",
        question: `What interests you most about the ${jobRole} role at ${company}?`,
        category: "Role-Specific",
        difficulty: "Medium",
        tips: [
          "Connect your skills to the role requirements",
          "Mention specific aspects of the job description",
          "Show understanding of the role's impact",
        ],
      },
      {
        id: "ai-2",
        question: "How do you handle working under pressure?",
        category: "Behavioral",
        difficulty: "Medium",
        tips: ["Provide a specific example", "Explain your coping strategies", "Show positive outcomes"],
      },
    ]

    setQuestions([...questions, ...newQuestions])
    toast({
      title: "Questions Generated",
      description: `Generated ${newQuestions.length} personalized questions based on your inputs.`,
    })
  }

  const startPractice = (question: Question) => {
    setCurrentQuestion(question)
    setAnswer("")
    setRecordingTime(0)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      // Store interval ID to clear later
      ;(window as any).recordingInterval = interval
    } else {
      // Stop timer
      clearInterval((window as any).recordingInterval)
      toast({
        title: "Practice Complete",
        description: `You practiced for ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, "0")}`,
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Practice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceStats.questionsAnswered}</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceStats.averageTime}s</div>
            <p className="text-xs text-muted-foreground">-5s from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practiceStats.improvementScore}%</div>
            <Progress value={practiceStats.improvementScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
              <CardDescription>Provide details about your interview to get personalized questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role</Label>
                  <Input
                    id="jobRole"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Tech Company Inc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                    <SelectItem value="lead">Lead/Manager (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateQuestions} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Personalized Questions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Questions</CardTitle>
              <CardDescription>Practice with these AI-generated questions tailored to your role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{question.question}</h4>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline">{question.category}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                        </div>
                      </div>
                      <Button onClick={() => startPractice(question)}>
                        <Play className="mr-2 h-4 w-4" />
                        Practice
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <strong>Tips:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {question.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Practice Session
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                  </div>
                </CardTitle>
                <CardDescription>{currentQuestion.question}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button variant={isRecording ? "destructive" : "default"} onClick={toggleRecording}>
                      {isRecording ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setRecordingTime(0)}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                  <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here or use voice recording..."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Tips for this question:
                  </h4>
                  <ul className="text-sm space-y-1">
                    {currentQuestion.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No Question Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Go to the Questions tab and select a question to start practicing.
                </p>
                <Button onClick={() => startPractice(questions[0])}>
                  <Play className="mr-2 h-4 w-4" />
                  Start with First Question
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Interview Frameworks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">STAR Method</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>S</strong>ituation, <strong>T</strong>ask, <strong>A</strong>ction, <strong>R</strong>
                      esult
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">CAR Method</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>C</strong>hallenge, <strong>A</strong>ction, <strong>R</strong>esult
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">SOAR Method</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>S</strong>ituation, <strong>O</strong>bjective, <strong>A</strong>ction,{" "}
                      <strong>R</strong>esult
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Question Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: "Behavioral", count: 15, color: "bg-blue-100 text-blue-800" },
                    { category: "Technical", count: 12, color: "bg-green-100 text-green-800" },
                    { category: "Company", count: 8, color: "bg-purple-100 text-purple-800" },
                    { category: "Role-Specific", count: 10, color: "bg-orange-100 text-orange-800" },
                    { category: "General", count: 6, color: "bg-gray-100 text-gray-800" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{item.category}</span>
                      <Badge className={item.color}>{item.count} questions</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Interview Preparation Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Before the Interview</h4>
                    {[
                      "Research the company and role",
                      "Practice common questions",
                      "Prepare questions to ask",
                      "Review your resume",
                      "Plan your outfit",
                      "Test your technology (for virtual interviews)",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">During the Interview</h4>
                    {[
                      "Arrive 10-15 minutes early",
                      "Maintain good eye contact",
                      "Listen actively",
                      "Ask thoughtful questions",
                      "Show enthusiasm",
                      "Take notes if appropriate",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
