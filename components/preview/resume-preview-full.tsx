"use client"

import { memo, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState, ListSkeleton } from "@/components/ui/states"
import { EnhancedResumeRenderer } from "@/components/resume-builder/enhanced-resume-renderer"
import { useResumeStore, type ResumeData, type ResumeTemplate } from "@/lib/resume-store"
import { useFontConfig } from "@/lib/font-config-store"

const ZOOM_STEPS = [0.6, 0.75, 0.9, 1, 1.25] as const

const Page = memo(function Page({
  template,
  data,
  scale,
}: {
  template: ResumeTemplate
  data: ResumeData
  scale: number
}) {
  return <EnhancedResumeRenderer key={template.id} template={template} data={data} scale={scale} />
})

export function ResumePreviewFull() {
  const resumeData = useResumeStore((s) => s.resumeData)
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)
  const loadResume = useResumeStore((s) => s.loadResume)

  const fontConfig = useFontConfig()

  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [zoom, setZoom] = useState(0.9)

  const resumeId = resumeData.id

  // Pull the saved version, so the preview shows what's actually stored rather than
  // whatever happens to be sitting in the local store from a half-finished edit.
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        if (resumeId) await loadResume(resumeId)
      } catch {
        if (!cancelled) toast.error("Showing your last local copy — we couldn't reach the server.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // Deliberately keyed on the id alone: re-running when `resumeData` changes would
    // refetch on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId])

  async function download() {
    if (!resumeId) {
      toast.error("Save the résumé first — there's nothing to export yet.")
      return
    }

    setIsExporting(true)
    try {
      const res = await fetch(`/api/resumes/${resumeId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontConfig }),
      })
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${(resumeData.personalInfo?.fullName || "resume")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("The PDF didn't generate. Try again in a moment.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) return <ListSkeleton rows={5} />

  const hasContent =
    Boolean(resumeId) &&
    Boolean(
      resumeData.personalInfo?.fullName?.trim() ||
        resumeData.personalInfo?.email?.trim() ||
        resumeData.summary?.trim() ||
        resumeData.experience?.length ||
        resumeData.education?.length ||
        resumeData.skills?.length
    )

  if (!selectedTemplate || !hasContent) {
    return (
      <EmptyState
        code="RB"
        title="No résumé to preview"
        description="Once you've built and saved a résumé, this is where you'll see exactly what comes out of the PDF."
        action={
          <Button asChild>
            <Link href="/dashboard/resume-builder">Build my résumé</Link>
          </Button>
        }
      />
    )
  }

  const zoomIndex = ZOOM_STEPS.indexOf(zoom as (typeof ZOOM_STEPS)[number])

  return (
    <div>
      {/* ---- Action bar ---- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-[26px] leading-tight text-ink">
            {resumeData.title || "Your résumé"}
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {selectedTemplate.name} · this is what the PDF will look like
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-[8px] border border-border bg-card">
            <button
              type="button"
              onClick={() => setZoom(ZOOM_STEPS[Math.max(0, zoomIndex - 1)])}
              disabled={zoomIndex <= 0}
              aria-label="Zoom out"
              className="px-2.5 py-1.5 font-mono text-[13px] leading-none text-ink-muted hover:text-ink disabled:opacity-40"
            >
              −
            </button>
            <span className="w-[42px] text-center font-mono text-[10px] text-ink-faint">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, zoomIndex + 1)])}
              disabled={zoomIndex >= ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              className="px-2.5 py-1.5 font-mono text-[13px] leading-none text-ink-muted hover:text-ink disabled:opacity-40"
            >
              +
            </button>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/resume-builder?resumeId=${resumeId}`}>Edit</Link>
          </Button>

          <Button size="sm" onClick={download} disabled={isExporting}>
            {isExporting ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* ---- The page, on the design's darker canvas ---- */}
      <div className="mt-6 flex justify-center overflow-auto rounded-panel bg-[#e7e3da] p-6 sm:p-10">
        <div
          className="h-fit w-[720px] max-w-full bg-white"
          style={{ boxShadow: "0 30px 80px -30px rgba(30,25,20,.45)" }}
        >
          <Page template={selectedTemplate} data={resumeData} scale={zoom} />
        </div>
      </div>
    </div>
  )
}
