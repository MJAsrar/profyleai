"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"
import { useToast } from "@/hooks/use-toast"

export function SummaryForm() {
  const { resumeData, updateSummary } = useResumeStore()
  const { toast } = useToast()
  const [isOptimizing, setIsOptimizing] = useState(false)

  const optimizeWithAI = async () => {
    if (!resumeData.summary || resumeData.summary.trim().length === 0) {
      toast({
        title: "No content to optimize",
        description: "Please write some content first, then click optimize to improve it.",
        variant: "destructive"
      })
      return
    }

    setIsOptimizing(true)
    try {
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: resumeData.summary,
          contentType: 'summary',
          context: {
            // Add context if available from resume data
            jobTitle: resumeData.personalInfo?.professionalTitle
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize content')
      }

      if (result.success && result.data) {
        updateSummary(result.data.optimizedContent)
        toast({
          title: "Summary optimized!",
          description: `Improved with: ${result.data.improvements.slice(0, 2).join(', ')}${result.data.improvements.length > 2 ? '...' : ''}`,
        })
      }
    } catch (error) {
      console.error('Error optimizing summary:', error)
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Failed to optimize content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary">Professional Summary</Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={optimizeWithAI}
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
        id="summary"
        value={resumeData.summary}
        onChange={(e) => updateSummary(e.target.value)}
        placeholder="Write a compelling summary that highlights your key achievements and career objectives..."
        className="min-h-[120px]"
      />
      <p className="text-sm text-muted-foreground">
        Tip: Keep it concise (2-3 sentences) and focus on your most relevant skills and achievements.
      </p>
    </div>
  )
}
