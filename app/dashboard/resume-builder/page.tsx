"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { SectionsRail } from "@/components/resume-builder/sections-rail"
import { LivePreview } from "@/components/resume-builder/live-preview"
import { StyleBar } from "@/components/resume-builder/style-bar"
import { ResumeSelection } from "@/components/resume-builder/resume-selection"
import { TemplateSelector } from "@/components/resume-builder/template-selector"

import { PersonalInfoForm } from "@/components/resume-builder/forms/personal-info-form"
import { SummaryForm } from "@/components/resume-builder/forms/summary-form"
import { ExperienceForm } from "@/components/resume-builder/forms/experience-form"
import { EducationForm } from "@/components/resume-builder/forms/education-form"
import { SkillsForm } from "@/components/resume-builder/forms/skills-form"
import { ProjectsForm } from "@/components/resume-builder/forms/projects-form"
import { CertificationsForm } from "@/components/resume-builder/forms/certifications-form"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ListSkeleton } from "@/components/ui/states"

import { useResumeStore, useAutoSave } from "@/lib/resume-store"
import {
  RESUME_SECTIONS,
  nextIncompleteSection,
  type SectionKey,
} from "@/lib/resume-sections"

const SECTION_FORMS: Record<SectionKey, React.ComponentType> = {
  personal: PersonalInfoForm,
  summary: SummaryForm,
  experience: ExperienceForm,
  education: EducationForm,
  skills: SkillsForm,
  projects: ProjectsForm,
  certifications: CertificationsForm,
}

export default function ResumeBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tailoredResumeId = searchParams.get("tailoredResumeId")
  const resumeId = searchParams.get("resumeId")

  // Narrow selectors. A bare `useResumeStore()` here would re-render this whole page —
  // rail, editor, preview and all — on every keystroke in any field.
  const title = useResumeStore((s) => s.resumeData.title)
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)
  const templates = useResumeStore((s) => s.templates)
  const isLoading = useResumeStore((s) => s.isLoading)
  const isSaving = useResumeStore((s) => s.isSaving)

  const updateTitle = useResumeStore((s) => s.updateTitle)
  const loadTemplates = useResumeStore((s) => s.loadTemplates)
  const loadResume = useResumeStore((s) => s.loadResume)
  const loadTailoredResume = useResumeStore((s) => s.loadTailoredResume)
  const resetToDefaults = useResumeStore((s) => s.resetToDefaults)
  const saveResume = useResumeStore((s) => s.saveResume)

  const [activeSection, setActiveSection] = useState<SectionKey>("personal")
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showResumeSelection, setShowResumeSelection] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  useAutoSave()

  useEffect(() => {
    if (templatesLoaded) return
    if (templates.length > 0) {
      setTemplatesLoaded(true)
      return
    }
    loadTemplates().finally(() => setTemplatesLoaded(true))
  }, [templatesLoaded, templates.length, loadTemplates])

  // A new résumé id in the URL means a different document — start over.
  useEffect(() => {
    setIsInitialized(false)
  }, [tailoredResumeId, resumeId])

  useEffect(() => {
    if (!templatesLoaded || isInitialized) return

    const init = async () => {
      try {
        if (tailoredResumeId) {
          await loadTailoredResume(tailoredResumeId)
        } else if (resumeId) {
          await loadResume(resumeId)
        } else {
          setShowResumeSelection(true)
        }
      } catch {
        toast.error("Couldn't open that résumé.")
        setShowResumeSelection(true)
      } finally {
        setIsInitialized(true)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesLoaded, isInitialized])

  const handleCreateNew = useCallback(() => {
    resetToDefaults()
    setShowResumeSelection(false)
    setShowTemplateSelector(true)
    setActiveSection("personal")
    router.replace("/dashboard/resume-builder", { scroll: false })
  }, [resetToDefaults, router])

  const handleSelectExisting = useCallback(
    async (id: string) => {
      try {
        await loadResume(id)
        setShowResumeSelection(false)
        setActiveSection("personal")
        router.replace(`/dashboard/resume-builder?resumeId=${id}`, { scroll: false })
      } catch {
        toast.error("Couldn't open that résumé.")
      }
    },
    [loadResume, router]
  )

  const handleBackToSelection = useCallback(() => {
    setShowResumeSelection(true)
    setShowTemplateSelector(false)
    resetToDefaults()
    router.replace("/dashboard/resume-builder", { scroll: false })
  }, [resetToDefaults, router])

  async function handleSave() {
    try {
      await saveResume()
      toast.success("Résumé saved.")
    } catch {
      toast.error("Save failed. Your work is still here — try again.")
    }
  }

  if (isLoading || !isInitialized) {
    return (
      <>
        <ToolTopBar title="Résumé builder" />
        <div className="mx-auto w-full max-w-[1400px] px-8 py-8">
          <ListSkeleton rows={6} />
        </div>
      </>
    )
  }

  if (showResumeSelection) {
    return (
      <>
        <ToolTopBar title="Résumé builder" />
        <div className="mx-auto w-full max-w-[1100px] px-8 py-8">
          <ResumeSelection
            onCreateNew={handleCreateNew}
            onSelectResume={handleSelectExisting}
            onBack={handleBackToSelection}
          />
        </div>
      </>
    )
  }

  if (showTemplateSelector) {
    return (
      <>
        <ToolTopBar title="Pick a template" />
        <div className="mx-auto w-full max-w-[1100px] px-8 py-8">
          <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
            ← Back
          </Button>
          <div className="mt-4">
            <TemplateSelector onTemplateSelect={() => setShowTemplateSelector(false)} />
          </div>
        </div>
      </>
    )
  }

  const ActiveForm = SECTION_FORMS[activeSection]
  const activeDef = RESUME_SECTIONS.find((s) => s.key === activeSection)!
  const activeIndex = RESUME_SECTIONS.findIndex((s) => s.key === activeSection)
  const nextSection = RESUME_SECTIONS[activeIndex + 1]

  return (
    <>
      <ToolTopBar
        title="Résumé builder"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
            >
              {selectedTemplate?.name ?? "Choose template"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-[1500px] px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <SectionsRail active={activeSection} onSelect={setActiveSection} />

          {/* ---- Editor ---- */}
          <div className="min-w-0 flex-1">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {activeDef.required ? "Required" : "Optional"}
                  </p>
                  <h2 className="mt-1 font-display text-[24px] leading-tight text-ink">
                    {activeDef.label}
                  </h2>
                </div>

                <div className="w-full sm:w-[240px]">
                  <Input
                    aria-label="Résumé name"
                    value={title}
                    onChange={(e) => updateTitle(e.target.value)}
                    placeholder="Untitled résumé"
                  />
                </div>
              </div>

              <div className="pt-6">
                <ActiveForm />
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveSection(RESUME_SECTIONS[activeIndex - 1].key)}
                >
                  ← {RESUME_SECTIONS[activeIndex - 1]?.label ?? "Back"}
                </Button>

                {nextSection ? (
                  <Button size="sm" onClick={() => setActiveSection(nextSection.key)}>
                    {nextSection.label} →
                  </Button>
                ) : (
                  <FinishButton onSave={handleSave} onJump={setActiveSection} />
                )}
              </div>
            </Card>

            <div className="mt-6">
              <StyleBar />
            </div>
          </div>

          {/* ---- Preview ---- */}
          <LivePreview className="lg:w-[472px] lg:shrink-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)]" />
        </div>
      </div>
    </>
  )
}

/**
 * At the end of the sections, the useful thing to say isn't "done" — it's whether
 * anything required is still missing, and where.
 */
function FinishButton({
  onSave,
  onJump,
}: {
  onSave: () => void
  onJump: (key: SectionKey) => void
}) {
  const resumeData = useResumeStore((s) => s.resumeData)
  const missing = nextIncompleteSection(resumeData)

  if (missing) {
    const label = RESUME_SECTIONS.find((s) => s.key === missing)!.label
    return (
      <Button size="sm" variant="outline" onClick={() => onJump(missing)}>
        Finish {label.toLowerCase()}
      </Button>
    )
  }

  return (
    <Button size="sm" onClick={onSave}>
      Save résumé
    </Button>
  )
}
