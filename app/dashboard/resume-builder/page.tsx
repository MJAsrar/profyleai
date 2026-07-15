"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import Link from "next/link"
import { ToolTopBar, CreditChip } from "@/components/layout/tool-top-bar"
import { SectionsRail } from "@/components/resume-builder/sections-rail"
import { LivePreview } from "@/components/resume-builder/live-preview"
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
import { ListSkeleton } from "@/components/ui/states"

import { useResumeStore, useAutoSave } from "@/lib/resume-store"
import { setHideSidebar } from "@/lib/hooks/use-app-chrome"
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
  const hasUnsavedChanges = useResumeStore((s) => s.hasUnsavedChanges)

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

  // The editing view is a focused, full-width three-pane layout — hide the main app
  // sidebar while it's up, and restore it on the selection/template screens and on exit.
  const inEditor = !isLoading && isInitialized && !showResumeSelection && !showTemplateSelector
  useEffect(() => {
    setHideSidebar(inEditor)
    return () => setHideSidebar(false)
  }, [inEditor])

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
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f3ec]">
      {/* ---- Top bar ---- */}
      <header className="flex h-[62px] shrink-0 items-center justify-between gap-4 border-b border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-[22px]">
        <div className="flex min-w-0 items-center gap-3.5">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] text-[18px] text-[#4b463f] transition-colors hover:bg-[#f1ede4]"
          >
            <span aria-hidden="true">←</span>
          </Link>

          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#2e6a4a] font-display text-[18px] font-semibold text-[#f6f3ec]"
          >
            P
          </span>

          <div className="flex min-w-0 items-center gap-2.5">
            <input
              aria-label="Résumé name"
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Untitled résumé"
              className="min-w-0 max-w-[280px] flex-1 border-0 bg-transparent p-0 text-[15px] font-semibold text-[#211f1c] outline-none placeholder:text-[#a79f93] focus:underline focus:underline-offset-4"
            />

            <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-[#8a837a]">
              {isSaving ? "· Saving…" : hasUnsavedChanges ? "· Unsaved" : "· Saved"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-[7px] rounded-[9px] border border-[rgba(33,31,28,.1)] bg-[#f1ede4] px-3 py-2 text-[13px] font-medium text-[#4b463f] hover:border-[#2e6a4a]"
          >
            {selectedTemplate?.name ?? "Template"}{" "}
            <span aria-hidden="true" className="text-[#8a837a]">
              ▾
            </span>
          </button>

          <CreditChip />

          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>

          <Button asChild size="sm">
            <Link href="/dashboard/preview">Preview &amp; export</Link>
          </Button>
        </div>
      </header>

      {/* ---- Three panes ---- */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <SectionsRail active={activeSection} onSelect={setActiveSection} />

        {/* Editor */}
        <div className="flex-1 overflow-auto bg-[#f6f3ec] px-6 py-[30px] sm:px-[34px]">
          <h2 className="mb-1.5 font-display text-[28px] font-medium text-[#211f1c]">
            {activeDef.label}
          </h2>

          <p className="mb-[22px] text-[14px] text-[#8a837a]">
            {activeDef.required
              ? "Required — this one carries real weight with a recruiter."
              : "Optional — worth adding when it says something your job titles don't."}
          </p>

          <ActiveForm />

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[rgba(33,31,28,.1)] pt-5">
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
        </div>

        {/* Preview */}
        <LivePreview />
      </div>
    </div>
  )
}

/**
 * At the end of the sections, the useful thing to say isn't "done" — it's whether anything
 * required is still missing, and where.
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
