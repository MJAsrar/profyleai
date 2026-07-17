"use client"

import { useEffect, useRef } from "react"

import { useResumeStore } from "@/lib/resume-store"
import { useLatexStyle } from "@/lib/latex/style-store"
import { useLatexPdfStore } from "@/lib/latex/pdf-store"
import { LatexStyleBar } from "./latex-style-bar"
import { cn } from "@/lib/utils"

/**
 * The live LaTeX preview: the pane *is* the compiled PDF. It debounces edits, POSTs the résumé
 * to the compile service, and shows the returned PDF. The last good PDF stays on screen while a
 * new compile runs (or fails), so the surface never flashes empty mid-edit.
 */

const DEBOUNCE_MS = 1200

const STATUS_LABEL: Record<string, string> = {
  idle: "",
  warming: "warming up…",
  compiling: "compiling…",
  ready: "up to date",
  error: "compile error",
}

export function LatexPreview({ className }: { className?: string }) {
  const resumeData = useResumeStore((s) => s.resumeData)
  // The picked template's name selects the LaTeX design, so switching template recompiles.
  const templateName = useResumeStore((s) => s.selectedTemplate?.name ?? null)
  const style = useLatexStyle()

  const status = useLatexPdfStore((s) => s.status)
  const pdfUrl = useLatexPdfStore((s) => s.pdfUrl)
  const errorMessage = useLatexPdfStore((s) => s.errorMessage)
  const log = useLatexPdfStore((s) => s.log)
  const compile = useLatexPdfStore((s) => s.compile)
  const warm = useLatexPdfStore((s) => s.warm)
  const dispose = useLatexPdfStore((s) => s.dispose)

  // Warm the compile service on mount; tear down the blob URL on exit.
  useEffect(() => {
    warm()
    return () => dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compile immediately on first mount, then debounce every edit / style / template change.
  const firstRun = useRef(true)
  useEffect(() => {
    const delay = firstRun.current ? 0 : DEBOUNCE_MS
    firstRun.current = false
    const timer = setTimeout(() => {
      compile(resumeData, style, templateName)
    }, delay)
    return () => clearTimeout(timer)
  }, [resumeData, style, templateName, compile])

  const busy = status === "compiling" || status === "warming"

  return (
    <aside
      className={cn(
        "flex flex-col border-[rgba(33,31,28,.08)] bg-[#eef2ea] lg:w-[472px] lg:shrink-0 lg:border-l",
        className
      )}
    >
      <div className="flex flex-1 flex-col overflow-hidden px-[26px] pb-2 pt-[26px]">
        <div className="mb-4 flex w-full items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.12em] text-[#8a837a]">LIVE PREVIEW</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#8a837a]">
            {busy && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2e6a4a]" aria-hidden="true" />
            )}
            {STATUS_LABEL[status] ?? ""}
          </span>
        </div>

        <div
          className="relative flex-1 overflow-hidden rounded-[6px] border border-[rgba(33,31,28,.1)] bg-white"
          style={{ boxShadow: "0 20px 50px -30px rgba(30,25,20,.4)" }}
        >
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Résumé preview"
              className={cn("h-full w-full transition-opacity", busy && "opacity-70")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center">
              <p className="max-w-[240px] text-[13px] leading-relaxed text-[#6f685f]">
                {status === "error"
                  ? "Couldn't build the preview yet — see the note below."
                  : "Building your résumé preview…"}
              </p>
            </div>
          )}

          {busy && pdfUrl && (
            <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#211f1c]/80 px-2.5 py-1 font-mono text-[10px] text-white">
              {status === "warming" ? "warming up…" : "compiling…"}
            </div>
          )}
        </div>

        {status === "error" && errorMessage && (
          <div className="mt-3 rounded-[8px] border border-[#c2410c]/30 bg-[#fff4ed] px-3 py-2.5 text-[12px] text-[#9a3412]">
            <p className="font-medium">{errorMessage}</p>
            {log && (
              <details className="mt-1.5">
                <summary className="cursor-pointer text-[11px] text-[#b45309]">Show compiler log</summary>
                <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-[#7c2d12]">
                  {log}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      <LatexStyleBar />
    </aside>
  )
}
