"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_LATEX_STYLE, type Density, type LatexStyle } from "./resume-template"

/**
 * The handful of real knobs the LaTeX preview exposes — body font size, vertical density, and
 * an accent colour. Deliberately small. Persisted so a user's choices survive a reload.
 */

export const FONT_SIZE_OPTIONS = [9.5, 10, 10.5, 11, 11.5] as const

export const DENSITY_OPTIONS: Array<{ value: Density; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "relaxed", label: "Relaxed" },
]

export const ACCENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "2E6A4A", label: "Sage" },
  { value: "1F2937", label: "Ink" },
  { value: "1D4ED8", label: "Blue" },
  { value: "9333EA", label: "Violet" },
  { value: "B45309", label: "Amber" },
  { value: "BE123C", label: "Rose" },
]

interface LatexStyleState {
  style: LatexStyle
  setFontSize: (size: number) => void
  setDensity: (density: Density) => void
  setAccent: (accent: string) => void
  reset: () => void
}

export const useLatexStyleStore = create<LatexStyleState>()(
  persist(
    (set) => ({
      style: DEFAULT_LATEX_STYLE,
      setFontSize: (size) => set((s) => ({ style: { ...s.style, fontSize: size } })),
      setDensity: (density) => set((s) => ({ style: { ...s.style, density } })),
      setAccent: (accent) => set((s) => ({ style: { ...s.style, accent } })),
      reset: () => set({ style: DEFAULT_LATEX_STYLE }),
    }),
    {
      name: "latex-style",
      version: 1,
      partialize: (state) => ({ style: state.style }),
    }
  )
)

/** Just the style object (stable selector) for the preview + template. */
export const useLatexStyle = () => useLatexStyleStore((s) => s.style)
