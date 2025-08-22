"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Plus, 
  Edit,
  Calendar,
  Layout,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import { useCreditCheck } from "@/hooks/use-credit-check"
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal"

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

interface ResumeSelectionProps {
  onCreateNew: () => void
  onSelectResume: (resumeId: string) => void
  onBack: () => void
}

export function ResumeSelection({ onCreateNew, onSelectResume, onBack }: ResumeSelectionProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<'create' | 'edit' | null>(null)
  
  // Credit check hook
  const {
    checkCredits,
    isChecking,
    showInsufficientCreditsModal,
    setShowInsufficientCreditsModal,
    requiredAction,
    currentBalance,
  } = useCreditCheck()

  const fetchResumes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/resumes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch resumes')
      }

      const data = await response.json()
      setResumes(data.data || data.resumes || [])
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

  const handleOptionSelect = async (option: 'create' | 'edit') => {
    if (option === 'create') {
      // Check credits before creating new resume
      try {
        const result = await checkCredits('RESUME_BUILDER')
        if (result.hasEnoughCredits) {
          onCreateNew()
        } else {
          setShowInsufficientCreditsModal(true)
        }
      } catch (error) {
        // Error is handled by the hook
      }
    } else {
      setSelectedOption('edit')
    }
  }

  const handleResumeSelect = (resumeId: string) => {
    onSelectResume(resumeId)
  }

  // Show option selection first
  if (selectedOption !== 'edit') {
    return (
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Resume Builder</h1>
          <p className="text-muted-foreground">
            Choose how you'd like to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Resume */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOptionSelect('create')}>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Create New Resume</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Start building a fresh resume from scratch with our guided templates
              </p>
              <div className="space-y-2">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Fresh
                </Button>
                <p className="text-xs text-muted-foreground">
                  Costs 3 credits
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Existing Resume */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOptionSelect('edit')}>
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Edit Existing Resume</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Continue working on one of your existing resumes
              </p>
              <Button variant="outline" className="w-full" disabled={isLoading}>
                <Edit className="h-4 w-4 mr-2" />
                {isLoading ? 'Loading...' : `Edit Resume (${resumes.length})`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show resume selection when editing
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Select Resume to Edit</h1>
          <p className="text-muted-foreground">Choose which resume you'd like to continue working on</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
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
      ) : resumes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Resumes Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have any resumes yet. Start by creating your first resume.
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleResumeSelect(resume.id)}>
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

                {/* Action Button */}
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Resume
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Insufficient Credits Modal */}
      {requiredAction && (
        <InsufficientCreditsModal
          isOpen={showInsufficientCreditsModal}
          onClose={() => setShowInsufficientCreditsModal(false)}
          action={requiredAction}
          currentBalance={currentBalance}
          onPurchaseSuccess={() => {
            setShowInsufficientCreditsModal(false)
            // After purchase, proceed with the action
            onCreateNew()
          }}
        />
      )}
    </div>
  )
}