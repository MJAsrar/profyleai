"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Edit3 } from "lucide-react"
import { PersonalInfoForm } from "./forms/personal-info-form"
import { SummaryForm } from "./forms/summary-form"
import { ExperienceForm } from "./forms/experience-form"
import { EducationForm } from "./forms/education-form"
import { SkillsForm } from "./forms/skills-form"
import { ProjectsForm } from "./forms/projects-form"
import { CertificationsForm } from "./forms/certifications-form"
import { useResumeStore } from "@/lib/resume-store"

const steps = [
  { id: 0, title: "Personal Info", component: PersonalInfoForm },
  { id: 1, title: "Summary", component: SummaryForm },
  { id: 2, title: "Experience", component: ExperienceForm },
  { id: 3, title: "Education", component: EducationForm },
  { id: 4, title: "Skills", component: SkillsForm },
  { id: 5, title: "Projects", component: ProjectsForm },
  { id: 6, title: "Certifications", component: CertificationsForm },
]

export function ResumeForm() {
  const { currentStep, setCurrentStep, resumeData, updateTitle } = useResumeStore()
  const CurrentStepComponent = steps[currentStep].component

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
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
        {/* Resume Title Input */}
        <div className="space-y-2">
          <Label htmlFor="resumeTitle" className="text-sm font-medium flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Resume Name
          </Label>
          <Input
            id="resumeTitle"
            value={resumeData.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Enter resume name..."
            className="text-sm"
          />
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CurrentStepComponent />

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={nextStep} disabled={currentStep === steps.length - 1}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
