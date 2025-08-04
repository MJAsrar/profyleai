"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"
import { useToast } from "@/hooks/use-toast"

export function ExperienceForm() {
  const { resumeData, addExperience, updateExperience, removeExperience } = useResumeStore()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  })

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position) {
      addExperience(newExperience)
      setNewExperience({
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      })
      setShowAddForm(false)
    }
  }

  const optimizeExperienceDescription = async (company: string, position: string, currentDescription: string, experienceId?: string) => {
    if (!currentDescription || currentDescription.trim().length === 0) {
      toast({
        title: "No content to optimize",
        description: "Please write some content first, then click optimize to improve it.",
        variant: "destructive"
      })
      return
    }

    const isNewExperience = !experienceId
    if (isNewExperience) {
      setIsOptimizing(true)
    } else {
      setOptimizingId(experienceId)
    }

    try {
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentDescription,
          contentType: 'experience',
          context: {
            companyName: company,
            position: position,
            jobTitle: resumeData.personalInfo?.professionalTitle
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize content')
      }

      if (result.success && result.data) {
        if (isNewExperience) {
          setNewExperience({ ...newExperience, description: result.data.optimizedContent })
        } else {
          updateExperience(experienceId, { description: result.data.optimizedContent })
        }
        
        toast({
          title: "Experience description optimized!",
          description: `Improved with: ${result.data.improvements.slice(0, 2).join(', ')}${result.data.improvements.length > 2 ? '...' : ''}`,
        })
      }
    } catch (error) {
      console.error('Error optimizing experience description:', error)
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Failed to optimize content. Please try again.",
        variant: "destructive"
      })
    } finally {
      if (isNewExperience) {
        setIsOptimizing(false)
      } else {
        setOptimizingId(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Work Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={newExperience.position}
                  onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                  placeholder="Job Title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                  disabled={newExperience.current}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="current"
                checked={newExperience.current}
                onCheckedChange={(checked) => setNewExperience({ ...newExperience, current: checked as boolean })}
              />
              <Label htmlFor="current">I currently work here</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Job Description</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => optimizeExperienceDescription(newExperience.company, newExperience.position, newExperience.description)}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isOptimizing ? "Optimizing..." : "Optimize with AI"}
                </Button>
              </div>
              <Textarea
                id="description"
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                placeholder="Describe your key responsibilities and achievements..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddExperience}>Add Experience</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {resumeData.experience.map((exp) => (
          <Card key={exp.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{exp.position}</h4>
                  <p className="text-muted-foreground">{exp.company}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <div className="mt-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm whitespace-pre-line flex-1">{exp.description}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => optimizeExperienceDescription(exp.company, exp.position, exp.description, exp.id)}
                          disabled={optimizingId === exp.id}
                          className="ml-2"
                        >
                          {optimizingId === exp.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
