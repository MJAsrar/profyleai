"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Sparkles, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useCoverLetterStore } from "@/lib/cover-letter-store"
import { useCreditCheck } from "@/hooks/use-credit-check"
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal"
import { COVER_LETTER_TONES } from "@/lib/services/gemini-service"

const steps = [
  { id: 0, title: "Job Details" },
  { id: 1, title: "Personal Info" },
  { id: 2, title: "Content & Tone" },
]

export function CoverLetterForm() {
  const {
    coverLetterData,
    currentStep,
    setCurrentStep,
    updateJobDetails,
    updatePersonalInfo,
    updateContent,
    updateTone,
    generateAIContent,
    loadPersonalInfoFromResume,
    isGenerating,
    error,
    lastGenerated,
    clearError,
  } = useCoverLetterStore()
  
  // Credit check hook
  const {
    checkCredits,
    isChecking,
    showInsufficientCreditsModal,
    setShowInsufficientCreditsModal,
    requiredAction,
    currentBalance,
  } = useCreditCheck()

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Check credits before moving to the content generation step (step 2)
      if (currentStep === 1) {
        try {
          const result = await checkCredits('COVER_LETTER')
          if (result.hasEnoughCredits) {
            setCurrentStep(currentStep + 1)
          } else {
            setShowInsufficientCreditsModal(true)
          }
        } catch (error) {
          // Error is handled by the hook
        }
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={coverLetterData.jobDetails.jobTitle}
                  onChange={(e) => updateJobDetails({ jobTitle: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={coverLetterData.jobDetails.companyName}
                  onChange={(e) => updateJobDetails({ companyName: e.target.value })}
                  placeholder="Tech Company Inc."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiringManager">Hiring Manager</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!coverLetterData.jobDetails.hiringManager ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateJobDetails({ hiringManager: "" })}
                  >
                    Unknown
                  </Button>
                  <Button
                    type="button"
                    variant={coverLetterData.jobDetails.hiringManager ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateJobDetails({ hiringManager: "Enter name..." })}
                  >
                    Specific Person
                  </Button>
                </div>
                {coverLetterData.jobDetails.hiringManager && (
                  <Input
                    placeholder="Enter hiring manager's full name"
                    value={coverLetterData.jobDetails.hiringManager === "Enter name..." ? "" : coverLetterData.jobDetails.hiringManager}
                    onChange={(e) => updateJobDetails({ hiringManager: e.target.value })}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={coverLetterData.jobDetails.jobDescription}
                onChange={(e) => updateJobDetails({ jobDescription: e.target.value })}
                placeholder="Paste the job description here to help AI generate better content..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Personal Information</h3>
                <p className="text-xs text-muted-foreground">Fill in your contact details</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadPersonalInfoFromResume}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Load from Resume
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={coverLetterData.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={coverLetterData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={coverLetterData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={coverLetterData.personalInfo.address}
                  onChange={(e) => updatePersonalInfo({ address: e.target.value })}
                  placeholder="New York, NY"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Writing Tone</Label>
              <Select value={coverLetterData.tone} onValueChange={(value: any) => updateTone(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COVER_LETTER_TONES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="opening">Opening Paragraph</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateAIContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate All'}
                </Button>
              </div>
              <Textarea
                id="opening"
                value={coverLetterData.content.opening}
                onChange={(e) => updateContent({ opening: e.target.value })}
                placeholder="Write your opening paragraph..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body Paragraphs</Label>
              <Textarea
                id="body"
                value={coverLetterData.content.body}
                onChange={(e) => updateContent({ body: e.target.value })}
                placeholder="Write your main content..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing">Closing Paragraph</Label>
              <Textarea
                id="closing"
                value={coverLetterData.content.closing}
                onChange={(e) => updateContent({ closing: e.target.value })}
                placeholder="Write your closing paragraph..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {lastGenerated && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Cover letter generated successfully!</strong> Match score: {lastGenerated.matchScore}%</p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium">View improvements made</summary>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {lastGenerated.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {renderStepContent()}

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={nextStep} disabled={currentStep === steps.length - 1 || isChecking}>
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Credits...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
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
            // After purchase, proceed to next step
            setCurrentStep(currentStep + 1)
          }}
        />
      )}
    </Card>
  )
}
