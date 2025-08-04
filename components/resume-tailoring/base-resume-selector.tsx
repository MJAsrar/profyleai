"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Calendar, 
  Layout,
  AlertCircle,
  Check,
  Plus
} from "lucide-react"
import Link from "next/link"

interface Resume {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  template: {
    id: string
    name: string
    category: string
    previewUrl: string | null
  }
}

interface BaseResumeSelectorProps {
  selectedResumeId?: string
  onResumeSelect: (resumeId: string) => void
  className?: string
}

export function BaseResumeSelector({ selectedResumeId, onResumeSelect, className }: BaseResumeSelectorProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResumes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/resumes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch resumes')
      }

      const data = await response.json()
      const resumes = data.data || []
      setResumes(resumes)
      
      // Auto-select most recent resume if none selected
      if (!selectedResumeId && resumes.length > 0) {
        onResumeSelect(resumes[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
      setError(error instanceof Error ? error.message : 'Failed to load resumes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleResumeSelect = (resumeId: string) => {
    onResumeSelect(resumeId)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Select Base Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Select Base Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (resumes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Select Base Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p>You don't have any resumes yet. Create one first to start tailoring.</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/resume-builder">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Resume
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Select Base Resume
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose which resume to tailor for this job application
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {resumes.map((resume) => (
          <Card 
            key={resume.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedResumeId === resume.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleResumeSelect(resume.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {resume.title}
                    </h4>
                    {selectedResumeId === resume.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Layout className="h-3 w-3" />
                      <span>{resume.template.name}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {resume.template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(resume.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Separator />
        
        <div className="text-center">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/dashboard/resume-builder">
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}