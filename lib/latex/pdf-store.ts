"use client"

import { create } from "zustand"
import type { ResumeData } from "@/lib/resume-store"
import type { LatexStyle } from "./resume-template"

/**
 * Shared state for the compiled résumé PDF, so the preview pane (which drives compilation) and
 * the header's "Download PDF" button (which consumes the result) stay in sync.
 *
 * Compilation is superseded, not queued: while you keep typing, only the latest request's PDF
 * wins — earlier in-flight responses are dropped. The last good PDF stays on screen through a
 * failed compile, with the error surfaced alongside it.
 */

export type CompileStatus = "idle" | "warming" | "compiling" | "ready" | "error"

interface LatexPdfState {
  status: CompileStatus
  pdfUrl: string | null
  pdfBytes: Uint8Array | null
  errorMessage: string | null
  log: string | null
  warm: () => Promise<void>
  compile: (resumeData: ResumeData, style: LatexStyle, templateName?: string | null) => Promise<void>
  download: (
    filename: string,
    resumeData: ResumeData,
    style: LatexStyle,
    templateName?: string | null
  ) => Promise<void>
  dispose: () => void
}

// Module-level so superseding survives across store updates.
let activeToken = 0

function triggerDownload(bytes: Uint8Array, filename: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export const useLatexPdfStore = create<LatexPdfState>((set, get) => ({
  status: "idle",
  pdfUrl: null,
  pdfBytes: null,
  errorMessage: null,
  log: null,

  warm: async () => {
    if (get().status === "idle") set({ status: "warming" })
    try {
      await fetch("/api/resumes/latex-pdf?warm=1")
    } catch {
      /* warming is best-effort */
    } finally {
      if (get().status === "warming") set({ status: "idle" })
    }
  },

  compile: async (resumeData, style, templateName) => {
    const token = ++activeToken
    set({ status: "compiling", errorMessage: null })

    try {
      const res = await fetch("/api/resumes/latex-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, style, templateName }),
      })
      if (token !== activeToken) return // superseded by a newer edit

      if (res.ok) {
        const buf = await res.arrayBuffer()
        if (token !== activeToken) return
        const bytes = new Uint8Array(buf)
        const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }))
        const previous = get().pdfUrl
        if (previous) URL.revokeObjectURL(previous)
        set({ status: "ready", pdfUrl: url, pdfBytes: bytes, log: null, errorMessage: null })
      } else {
        const payload = await res.json().catch(() => ({}))
        if (token !== activeToken) return
        // Keep the last good PDF visible; just report what failed.
        set({
          status: "error",
          errorMessage: payload?.error || "The résumé couldn't be compiled.",
          log: payload?.log || null,
        })
      }
    } catch {
      if (token !== activeToken) return
      set({ status: "error", errorMessage: "Couldn't reach the PDF compiler.", log: null })
    }
  },

  download: async (filename, resumeData, style, templateName) => {
    const existing = get().pdfBytes
    if (existing) {
      triggerDownload(existing, filename)
      return
    }
    // Nothing compiled yet (or the last compile failed) — compile once, then download.
    await get().compile(resumeData, style, templateName)
    const bytes = get().pdfBytes
    if (bytes) triggerDownload(bytes, filename)
  },

  dispose: () => {
    const url = get().pdfUrl
    if (url) URL.revokeObjectURL(url)
    activeToken++ // invalidate any in-flight compile
    set({ status: "idle", pdfUrl: null, pdfBytes: null, errorMessage: null, log: null })
  },
}))
