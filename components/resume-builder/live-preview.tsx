"use client"

import { memo, useDeferredValue, useState } from "react"
import { EnhancedResumeRenderer } from "./enhanced-resume-renderer"
import { useResumeStore, type ResumeData, type ResumeTemplate } from "@/lib/resume-store"
import { useFontConfig } from "@/lib/font-config-store"
import { cn } from "@/lib/utils"

/**
 * The live preview pane.
 *
 * Two things used to make this the jankiest surface in the product, and both are fixed here:
 *
 *  1. The old preview keyed the renderer on `Date.now()` of the last edit, so React threw
 *     away and rebuilt the entire renderer subtree on every keystroke. The key is now the
 *     template id — the only thing whose change actually warrants a remount.
 *
 *  2. Every component called `useResumeStore()` bare, subscribing to the whole store. The
 *     subscriptions here are narrow, and the résumé data is passed through `useDeferredValue`
 *     so the expensive render happens at low priority: the character you typed lands in the
 *     input immediately, and the page catches up a frame later instead of blocking on it.
 */

const ZOOM_STEPS = [0.5, 0.6, 0.75, 0.9, 1] as const

/**
 * Memoised so the renderer only re-runs when the deferred data, template, or scale
 * actually change — not when the parent re-renders for an unrelated reason (zoom
 * button hover, a sibling's state, the style bar opening).
 */
const PreviewPage = memo(function PreviewPage({
  template,
  data,
  scale,
}: {
  template: ResumeTemplate
  data: ResumeData
  scale: number
}) {
  return (
    <EnhancedResumeRenderer
      key={template.id}
      template={template}
      data={data}
      scale={scale}
    />
  )
})

export function LivePreview({ className }: { className?: string }) {
  const resumeData = useResumeStore((s) => s.resumeData)
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)
  const isSaving = useResumeStore((s) => s.isSaving)
  const hasUnsavedChanges = useResumeStore((s) => s.hasUnsavedChanges)

  // Subscribed to so a font change repaints the page; the renderer reads the config itself.
  useFontConfig()

  const [zoom, setZoom] = useState(0.75)

  // The heavy render trails the keystroke instead of blocking it.
  const deferredData = useDeferredValue(resumeData)
  const isCatchingUp = deferredData !== resumeData

  const zoomIndex = ZOOM_STEPS.indexOf(zoom as (typeof ZOOM_STEPS)[number])

  return (
    <aside className={cn("flex flex-col rounded-panel bg-section-tint", className)}>
      {/* Pane header */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Live preview
        </p>

        <div className="flex items-center gap-2">
          <span
            aria-live="polite"
            className="font-mono text-[10px] tracking-[0.06em] text-ink-faint"
          >
            {isSaving ? "Saving…" : hasUnsavedChanges ? "Unsaved" : "Saved"}
          </span>

          <div className="flex items-center rounded-[8px] border border-border bg-card">
            <button
              type="button"
              onClick={() => setZoom(ZOOM_STEPS[Math.max(0, zoomIndex - 1)])}
              disabled={zoomIndex <= 0}
              aria-label="Zoom out"
              className="px-2 py-1 font-mono text-[13px] leading-none text-ink-muted hover:text-ink disabled:opacity-40"
            >
              −
            </button>
            <span className="w-[38px] text-center font-mono text-[10px] text-ink-faint">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, zoomIndex + 1)])
              }
              disabled={zoomIndex >= ZOOM_STEPS.length - 1}
              aria-label="Zoom in"
              className="px-2 py-1 font-mono text-[13px] leading-none text-ink-muted hover:text-ink disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* The page */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {selectedTemplate ? (
          <div
            className={cn(
              "mx-auto w-fit rounded-[4px] bg-white shadow-doc transition-opacity",
              // A whisper of fade while the deferred render catches up — enough to signal
              // "working", not enough to flicker on every character.
              isCatchingUp && "opacity-90"
            )}
          >
            <PreviewPage template={selectedTemplate} data={deferredData} scale={zoom} />
          </div>
        ) : (
          <div className="flex h-full min-h-[420px] items-center justify-center rounded-[10px] border border-dashed border-border bg-[var(--card-plain)]/60 p-8 text-center">
            <p className="max-w-[220px] text-[13px] leading-relaxed text-ink-muted">
              Pick a template and your résumé will render here as you type.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
