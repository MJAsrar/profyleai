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
    <div className="space-y-6">
      {/* Optimization Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            LinkedIn Profile Optimization Score
          </CardTitle>
          <CardDescription>Your current profile strength based on LinkedIn best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{optimizationScore}%</span>
              <Badge
                variant={optimizationScore >= 80 ? "default" : optimizationScore >= 60 ? "secondary" : "destructive"}
              >
                {optimizationScore >= 80 ? "Excellent" : optimizationScore >= 60 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            <Progress value={optimizationScore} className="w-full" />

            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  {suggestion.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  )}
                  <span className="text-sm">{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="headline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="headline">Headline</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="headline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Headline Optimizer</CardTitle>
              <CardDescription>Create a compelling headline that showcases your value proposition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input
                  id="currentPosition"
                  value={profileData.currentPosition}
                  onChange={(e) => setProfileData({ ...profileData, currentPosition: e.target.value })}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="headline">LinkedIn Headline</Label>
                  <Button variant="outline" size="sm" onClick={generateAIHeadline}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  id="headline"
                  value={profileData.headline}
                  onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                  placeholder="Your compelling LinkedIn headline..."
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{profileData.headline.length}/220 characters</span>
                  {profileData.headline && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(profileData.headline)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Tips for a Great Headline:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Include your current role and key skills</li>
                  <li>• Use industry keywords for better searchability</li>
                  <li>• Highlight your unique value proposition</li>
                  <li>• Keep it under 220 characters</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Summary Optimizer</CardTitle>
              <CardDescription>Craft a compelling summary that tells your professional story</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="summary">LinkedIn Summary</Label>
                  <Button variant="outline" size="sm" onClick={generateAISummary}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  id="summary"
                  value={profileData.summary}
                  onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                  placeholder="Write your professional summary..."
                  className="min-h-[200px]"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{profileData.summary.length}/2600 characters</span>
                  {profileData.summary && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(profileData.summary)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Summary Best Practices:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Start with a strong opening statement</li>
                  <li>• Include quantifiable achievements</li>
                  <li>• Use bullet points for key skills</li>
                  <li>• End with a call-to-action</li>
                  <li>• Include relevant keywords for your industry</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Optimization</CardTitle>
              <CardDescription>Add and organize your skills to improve profile visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill">Add Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skill"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Type a skill and press Enter"
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>
              </div>

              {profileData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Skills ({profileData.skills.length}/50)</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="ml-1 text-xs hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Recommended Skills for Your Industry:</h4>
                <div className="flex flex-wrap gap-2">
                  {["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Git", "Agile"].map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        if (!profileData.skills.includes(skill)) {
                          setProfileData({
                            ...profileData,
                            skills: [...profileData.skills, skill],
                          })
                        }
                      }}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Search Appearances</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">856</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connections</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,341</div>
                <p className="text-xs text-muted-foreground">+23 new this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Optimization Checklist</CardTitle>
              <CardDescription>Complete these items to improve your profile visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { task: "Add a professional profile photo", completed: true },
                  { task: "Write a compelling headline", completed: profileData.headline.length > 0 },
                  { task: "Create a detailed summary", completed: profileData.summary.length > 100 },
                  { task: "Add at least 5 skills", completed: profileData.skills.length >= 5 },
                  { task: "Include work experience", completed: false },
                  { task: "Add education details", completed: false },
                  { task: "Get recommendations", completed: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className={`h-4 w-4 ${item.completed ? "text-green-500" : "text-muted-foreground"}`} />
                    <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.task}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
