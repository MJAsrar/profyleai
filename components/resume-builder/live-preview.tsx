"use client"

import { memo, useDeferredValue } from "react"
import { EnhancedResumeRenderer } from "./enhanced-resume-renderer"
import { StyleBar } from "./style-bar"
import { useResumeStore, type ResumeData, type ResumeTemplate } from "@/lib/resume-store"
import { useFontConfig } from "@/lib/font-config-store"
import { cn } from "@/lib/utils"

/**
 * The live preview pane, to the design: a 472px sage column, the page floating on it, and
 * the style controls docked at its foot.
 *
 * Two things used to make this the jankiest surface in the product, and both are fixed:
 *
 *  1. The preview keyed the renderer on `Date.now()` of the last edit, so React tore down
 *     and rebuilt the entire renderer subtree on every keystroke. The key is now the
 *     template id — the only thing whose change actually warrants a remount.
 *
 *  2. Every component called `useResumeStore()` bare, subscribing to the whole store. The
 *     subscriptions here are narrow, and the data goes through `useDeferredValue` so the
 *     expensive render happens at low priority: the character you typed lands in the input
 *     immediately and the page catches up a frame later, instead of blocking on it.
 */

const PreviewPage = memo(function PreviewPage({
  template,
  data,
}: {
  template: ResumeTemplate
  data: ResumeData
}) {
  return <EnhancedResumeRenderer key={template.id} template={template} data={data} />
})

export function LivePreview({ className }: { className?: string }) {
  const resumeData = useResumeStore((s) => s.resumeData)
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)

  // Subscribed to so a font change repaints; the renderer reads the config itself.
  useFontConfig()

  const deferredData = useDeferredValue(resumeData)
  const isCatchingUp = deferredData !== resumeData

  return (
    <aside
      className={cn(
        "flex flex-col border-[rgba(33,31,28,.08)] bg-[#eef2ea] lg:w-[472px] lg:shrink-0 lg:border-l",
        className
      )}
    >
      <div className="flex flex-1 flex-col items-center overflow-auto px-[26px] pb-2 pt-[26px]">
        <div className="mb-4 flex w-full items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.12em] text-[#8a837a]">
            LIVE PREVIEW
          </span>
          <span className="font-mono text-[11px] text-[#8a837a]">
            {isCatchingUp ? "updating…" : "up to date"}
          </span>
        </div>

        {selectedTemplate ? (
          <div
            className={cn(
              "w-[420px] max-w-full overflow-hidden rounded-[6px] border border-[rgba(33,31,28,.1)] bg-white transition-opacity",
              isCatchingUp && "opacity-90"
            )}
            style={{ boxShadow: "0 20px 50px -30px rgba(30,25,20,.4)" }}
          >
            <PreviewPage template={selectedTemplate} data={deferredData} />
          </div>
        ) : (
          <div className="flex w-[420px] max-w-full flex-1 items-center justify-center rounded-[6px] border border-dashed border-[rgba(33,31,28,.2)] p-8 text-center">
            <p className="max-w-[220px] text-[13px] leading-relaxed text-[#6f685f]">
              Pick a template and your résumé renders here as you type.
            </p>
          </div>
        )}
      </div>

      <StyleBar />
    </aside>
  )
}
