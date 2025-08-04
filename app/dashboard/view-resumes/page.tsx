"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/ui/page-container"
import { MotionWrapper } from "@/components/ui/motion-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FolderOpen, 
  Download, 
  Edit, 
  Trash2, 
  Calendar, 
  Building2, 
  FileText,
  AlertCircle,
  Target,
  TrendingUp,
  Plus,
  Layout
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFontConfig } from "@/lib/font-config-store"

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

interface TailoredResume {
  id: string
  title: string
  jobTitle: string
  companyName: string
  jobDescription: string
  matchScore: number | null
  createdAt: string
  template: {
    id: string
    name: string
    category: string
    previewUrl: string | null
  }
  baseResume: {
    id: string
    title: string
  }
  tailoringMetadata?: any
}

export default function ViewResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { fontConfig } = useFontConfig()

  const fetchAllResumes = async () => {
    try {
      setIsLoading(true)
      
      // Fetch both regular resumes and tailored resumes
      const [resumesResponse, tailoredResponse] = await Promise.all([
        fetch('/api/resumes'),
        fetch('/api/tailored-resumes')
      ])
      
      if (!resumesResponse.ok || !tailoredResponse.ok) {
        throw new Error('Failed to fetch resumes')
      }

      const [resumesData, tailoredData] = await Promise.all([
        resumesResponse.json(),
        tailoredResponse.json()
      ])
      
      setResumes(resumesData.data || resumesData.resumes || [])
      setTailoredResumes(tailoredData.data || tailoredData.tailoredResumes || [])
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
      setError(error instanceof Error ? error.message : 'Failed to load resumes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllResumes()
  }, [])

  const handleEditResume = (resumeId: string) => {
    // Navigate to resume builder with the specific resume ID
    router.push(`/dashboard/resume-builder?resumeId=${resumeId}`)
  }

  const handleEditTailoredResume = (tailoredResumeId: string) => {
    // Navigate to resume builder with the specific tailored resume ID
    router.push(`/dashboard/resume-builder?tailoredResumeId=${tailoredResumeId}`)
  }

  const handleDownload = async (resumeId: string, title: string, isTailored: boolean = false) => {
    try {
      console.log('Downloading resume:', resumeId)
      
      const endpoint = isTailored 
        ? `/api/tailored-resumes/${resumeId}/download`
        : `/api/resumes/${resumeId}/download`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fontConfig
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to download resume')
      }
      
      // Get the PDF blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('✅ Resume downloaded successfully')
    } catch (error) {
      console.error('Failed to download resume:', error)
      setError('Failed to download resume. Please try again.')
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete resume')
      }

      // Refresh the list
      await fetchAllResumes()
    } catch (error) {
      console.error('Failed to delete resume:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete resume')
    }
  }

  const handleDeleteTailoredResume = async (tailoredResumeId: string) => {
    if (!confirm('Are you sure you want to delete this tailored resume?')) {
      return
    }

    try {
      const response = await fetch(`/api/tailored-resumes/${tailoredResumeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete tailored resume')
      }

      // Refresh the list
      await fetchAllResumes()
    } catch (error) {
      console.error('Failed to delete tailored resume:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete tailored resume')
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500"
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number | null) => {
    if (!score) return "secondary"
    if (score >= 90) return "default"
    if (score >= 75) return "secondary"
    return "destructive"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description
    return description.slice(0, maxLength) + '...'
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
      <MotionWrapper animation="fade-in-down">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">My Resumes</h1>
          </div>
          <p className="text-muted-foreground">
            Manage all your resumes and tailored versions in one place
          </p>
        </div>
      </MotionWrapper>

      {/* Error Alert */}
      {error && (
        <MotionWrapper animation="fade-in">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </MotionWrapper>
      )}

      {/* Loading State */}
      {isLoading ? (
        <MotionWrapper animation="scale-in">
          <div className="space-y-8">
            {/* Loading sections */}
            {[1, 2].map((section) => (
              <div key={section} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MotionWrapper>
      ) : (
        <div className="space-y-12">
          {/* My Resumes Section */}
          <MotionWrapper animation="fade-in-up" delay={200}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">My Resumes</h2>
                  <p className="text-muted-foreground">
                    Your base resumes that can be tailored for different jobs
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/resume-builder">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Resume
                  </Link>
                </Button>
              </div>

              {resumes.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Resumes Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first resume to get started. You can then tailor it for different job applications.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/resume-builder">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Resume
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((resume, index) => (
                    <MotionWrapper key={resume.id} animation="slide-in-up" delay={index * 50}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2 mb-1">
                                {resume.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Layout className="h-4 w-4" />
                                <span>{resume.template.name}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {resume.template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <Separator />

                          {/* Resume Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Updated {formatDate(resume.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>Created {formatDate(resume.createdAt)}</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditResume(resume.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDownload(resume.id, resume.title, false)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteResume(resume.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </MotionWrapper>
                  ))}
                </div>
              )}
            </div>
          </MotionWrapper>

          {/* Tailored Resumes Section */}
          <MotionWrapper animation="fade-in-up" delay={400}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Tailored Resumes</h2>
                  <p className="text-muted-foreground">
                    AI-optimized versions of your resumes for specific job applications
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/resume-tailoring">
                    <Target className="h-4 w-4 mr-2" />
                    Create Tailored Resume
                  </Link>
                </Button>
              </div>

              {tailoredResumes.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tailored Resumes Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Use our AI-powered resume tailoring to optimize your resume for specific job applications.
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/resume-tailoring">
                        <Target className="h-4 w-4 mr-2" />
                        Start Tailoring
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tailoredResumes.map((resume, index) => (
                    <MotionWrapper key={resume.id} animation="slide-in-up" delay={index * 50}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2 mb-1">
                                {resume.jobTitle}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span>{resume.companyName}</span>
                              </div>
                            </div>
                            {resume.matchScore && (
                              <Badge variant={getScoreBadge(resume.matchScore)} className="ml-2">
                                {resume.matchScore}%
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Job Description Preview */}
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {truncateDescription(resume.jobDescription)}
                            </p>
                          </div>

                          <Separator />

                          {/* Resume Details */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Template:</span>
                              <span className="font-medium">{resume.template.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Based on:</span>
                              <span className="font-medium">{resume.baseResume.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Created {formatDate(resume.createdAt)}</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditTailoredResume(resume.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDownload(resume.id, resume.title, true)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTailoredResume(resume.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </MotionWrapper>
                  ))}
                </div>
              )}
            </div>
          </MotionWrapper>
        </div>
      )}

      {/* Statistics */}
      {(resumes.length > 0 || tailoredResumes.length > 0) && (
        <MotionWrapper animation="fade-in" delay={600}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resume Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{resumes.length}</div>
                  <div className="text-sm text-muted-foreground">Base Resumes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{tailoredResumes.length}</div>
                  <div className="text-sm text-muted-foreground">Tailored Versions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tailoredResumes.filter(r => r.matchScore && r.matchScore >= 90).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Match (90%+)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {tailoredResumes.filter(r => r.matchScore && r.matchScore >= 75 && r.matchScore < 90).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Good Match (75-89%)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {tailoredResumes.length > 0 ? new Set(tailoredResumes.map(r => r.companyName)).size : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Companies Applied</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}
    </PageContainer>
  )
}