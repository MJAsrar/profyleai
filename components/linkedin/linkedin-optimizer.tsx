"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Sparkles, CheckCircle, AlertCircle, TrendingUp, Users, Eye, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LinkedInOptimizer() {
  const { toast } = useToast()
  
  // Coming Soon overlay component
  const ComingSoonOverlay = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
      <Card className="max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            <Sparkles className="h-12 w-12 mx-auto text-blue-500 mb-3" />
            <h3 className="text-xl font-semibold mb-2">LinkedIn Optimization</h3>
            <p className="text-muted-foreground mb-4">
              We're putting the finishing touches on our LinkedIn profile optimization features.
            </p>
            <Badge variant="secondary" className="mb-2">
              Coming Soon
            </Badge>
            <p className="text-sm text-muted-foreground">
              Get ready to supercharge your LinkedIn presence with AI-powered suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
  const [profileData, setProfileData] = useState({
    headline: "",
    summary: "",
    currentPosition: "",
    skills: [] as string[],
    experience: "",
  })
  const [currentSkill, setCurrentSkill] = useState("")
  const [optimizationScore, setOptimizationScore] = useState(65)
  const [suggestions, setSuggestions] = useState([
    { type: "warning", text: "Add more keywords related to your industry" },
    { type: "success", text: "Good use of action verbs in your summary" },
    { type: "warning", text: "Consider adding quantifiable achievements" },
  ])

  const addSkill = () => {
    if (currentSkill.trim() && !profileData.skills.includes(currentSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, currentSkill.trim()],
      })
      setCurrentSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const generateAIHeadline = () => {
    // Simulate AI generation
    const aiHeadline = `${profileData.currentPosition || "Professional"} | Driving Innovation & Growth | Expert in Technology Solutions`
    setProfileData({ ...profileData, headline: aiHeadline })
    toast({
      title: "AI Headline Generated",
      description: "Your LinkedIn headline has been optimized with AI.",
    })
  }

  const generateAISummary = () => {
    // Simulate AI generation
    const aiSummary = `Experienced professional with a proven track record of delivering exceptional results in dynamic environments. Passionate about innovation and continuous learning, I specialize in leveraging cutting-edge technologies to drive business growth and operational excellence.

Key strengths include:
• Strategic thinking and problem-solving
• Cross-functional team leadership
• Data-driven decision making
• Client relationship management

I'm always open to connecting with like-minded professionals and exploring new opportunities to create value and drive meaningful impact.`

    setProfileData({ ...profileData, summary: aiSummary })
    setOptimizationScore(85)
    toast({
      title: "AI Summary Generated",
      description: "Your LinkedIn summary has been optimized with AI.",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    })
  }

  return (
    <div className="relative space-y-6">
      <ComingSoonOverlay />
      {/* Launching Soon Card */}
      <Card className="text-center">
        <CardContent className="pt-12 pb-12">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">LinkedIn Optimizer - Launching Soon!</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We're building a powerful AI-driven LinkedIn optimization tool that will help you create compelling headlines, summaries, and profiles that get noticed by recruiters.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Profile Optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Visibility Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Network Growth</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-medium">AI Headline Generator</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Create compelling LinkedIn headlines that grab recruiters' attention and improve searchability.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-md">
                  <Copy className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-medium">Summary Optimizer</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate professional summaries that tell your story and showcase your unique value proposition.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-md">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-medium">Profile Analytics</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Track your profile performance with insights on views, search appearances, and engagement.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-md">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <h4 className="font-medium">Skills Optimization</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get recommendations for relevant skills and optimize your skills section for better visibility.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-100 rounded-md">
                  <Eye className="h-4 w-4 text-cyan-600" />
                </div>
                <h4 className="font-medium">Visibility Score</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get a comprehensive score of your profile's visibility and actionable tips for improvement.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-md">
                  <Users className="h-4 w-4 text-pink-600" />
                </div>
                <h4 className="font-medium">Network Growth</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Strategies and tools to grow your professional network and increase your LinkedIn reach.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
