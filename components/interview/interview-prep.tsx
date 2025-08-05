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
      {/* Launching Soon Card */}
      <Card className="text-center">
        <CardContent className="pt-12 pb-12">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">AI Interview Prep - Launching Soon!</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We're working on an amazing AI-powered interview preparation tool that will help you practice with personalized questions, get real-time feedback, and boost your confidence.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>AI-Generated Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Personalized Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Progress Tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle>What's Coming</CardTitle>
          <CardDescription>Preview of features that will be available soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-md">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-medium">AI Question Generator</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get personalized interview questions based on your role, company, and experience level.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-md">
                  <Play className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-medium">Practice Sessions</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Record your answers and get timing feedback to improve your interview performance.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-md">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-medium">Progress Tracking</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Track your improvement over time with detailed analytics and insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
