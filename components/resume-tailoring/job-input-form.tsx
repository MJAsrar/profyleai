"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Target, Building2, FileText, Sparkles } from "lucide-react"
import { BaseResumeSelector } from "./base-resume-selector"
import { useCreditCheck } from "@/hooks/use-credit-check"
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal"

interface JobData {
  jobTitle: string
  jobDescription: string
  companyName: string
  baseResumeId?: string
}

interface JobInputFormProps {
  onSubmit: (data: JobData) => void
  initialData?: JobData
  showPreview?: boolean
}

export function JobInputForm({ 
  onSubmit, 
  initialData = { jobTitle: "", jobDescription: "", companyName: "" },
  showPreview = false 
}: JobInputFormProps) {
  const [formData, setFormData] = useState<JobData>(() => ({
    jobTitle: initialData?.jobTitle || "",
    jobDescription: initialData?.jobDescription || "",
    companyName: initialData?.companyName || "",
    baseResumeId: initialData?.baseResumeId || ""
  }))
  const [isValid, setIsValid] = useState(false)
  
  // Credit check hook
  const {
    checkCredits,
    isChecking,
    showInsufficientCreditsModal,
    setShowInsufficientCreditsModal,
    requiredAction,
    currentBalance,
  } = useCreditCheck()

  // Sync with initialData only when in preview mode and data has meaningful content
  useEffect(() => {
    if (showPreview && initialData && (initialData.jobTitle || initialData.companyName)) {
      // Only update if the form is currently empty or very different from initialData
      const formIsEmpty = !formData.jobTitle && !formData.companyName
      const dataIsDifferent = 
        formData.jobTitle !== initialData.jobTitle ||
        formData.companyName !== initialData.companyName
      
      if (formIsEmpty || dataIsDifferent) {
        setFormData({
          jobTitle: initialData.jobTitle || "",
          jobDescription: initialData.jobDescription || "",
          companyName: initialData.companyName || "",
          baseResumeId: initialData.baseResumeId || ""
        })
      }
    }
  }, [showPreview, initialData?.jobTitle, initialData?.companyName]) // Only depend on actual values, not the object

  useEffect(() => {
    const { jobTitle, jobDescription, companyName, baseResumeId } = formData
    const isValidForm = (
      jobTitle.trim().length > 0 && 
      jobDescription.trim().length >= 50 && 
      companyName.trim().length > 0 &&
      Boolean(baseResumeId) && baseResumeId!.trim().length > 0
    )
    setIsValid(isValidForm)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    
    // Check credits before proceeding with tailoring
    try {
      const result = await checkCredits('RESUME_TAILORING')
      if (result.hasEnoughCredits) {
        onSubmit(formData)
      } else {
        setShowInsufficientCreditsModal(true)
      }
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleInputChange = (field: keyof JobData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleResumeSelect = (resumeId: string) => {
    setFormData(prev => ({
      ...prev,
      baseResumeId: resumeId
    }))
  }

  // Extract key requirements from job description for preview
  const extractedKeywords = formData.jobDescription
    .toLowerCase()
    .split(/[\s,\.\n]+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'will', 'you', 'our', 'this', 'that', 'from', 'they', 'have', 'been'].includes(word)
    )
    .slice(0, 8)

  return (
    <Card className={`card-elevated ${showPreview ? "h-fit" : ""}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="text-lg font-semibold">Job Details</div>
            <p className="text-sm text-muted-foreground font-normal">
              Enter the job information to tailor your resume
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        {/* Resume Selection */}
        <BaseResumeSelector 
          selectedResumeId={formData.baseResumeId}
          onResumeSelect={handleResumeSelect}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="jobTitle" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Job Title *
              </Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Software Engineer"
                value={formData.jobTitle}
                onChange={handleInputChange('jobTitle')}
                required
                className="h-11 focus-ring"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company Name *
              </Label>
              <Input
                id="companyName"
                placeholder="e.g. Google"
                value={formData.companyName}
                onChange={handleInputChange('companyName')}
                required
                className="h-11 focus-ring"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="jobDescription" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Job Description *
            </Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the complete job description here..."
              value={formData.jobDescription}
              onChange={handleInputChange('jobDescription')}
              rows={showPreview ? 8 : 12}
              className="resize-none focus-ring leading-relaxed"
              required
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {formData.jobDescription.length} characters 
                {formData.jobDescription.length < 50 && " (minimum 50 characters)"}
              </span>
              {formData.jobDescription.length >= 50 && (
                <span className="text-green-600">✓ Valid length</span>
              )}
            </div>
          </div>

          {extractedKeywords.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Detected Keywords
              </Label>
              <div className="p-3 rounded-lg bg-muted/30 border border-muted/50">
                <div className="flex flex-wrap gap-2">
                  {extractedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-background/80">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!isValid || isChecking}
            className="w-full h-12 text-base font-medium btn-gradient"
            size="lg"
          >
            <Target className="h-5 w-5 mr-2" />
            {isChecking ? "Checking Credits..." : (showPreview ? "Update Tailored Resume" : "Tailor My Resume")}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Costs 2 credits
          </p>
        </form>

        {!isValid && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <p className="font-medium">Please complete the following:</p>
              <ul className="ml-4 space-y-1">
                {!formData.jobTitle.trim() && <li>• Job title is required</li>}
                {!formData.companyName.trim() && <li>• Company name is required</li>}
                {formData.jobDescription.length < 50 && <li>• Job description needs at least 50 characters</li>}
                {!formData.baseResumeId && <li>• Base resume must be selected</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
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
            onSubmit(formData)
          }}
        />
      )}
    </Card>
  )
}