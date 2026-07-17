import type { ResumeData } from "@/lib/resume-store"

/**
 * Shared types for the LaTeX résumé templates.
 *
 * Every template is a pure `ResumeData -> .tex` function. They all honour the same three style
 * knobs, so no control in the style bar is ever inert regardless of which template is picked.
 */

export type Density = "compact" | "normal" | "relaxed"

export interface LatexStyle {
  /** Body font size in points. */
  fontSize: number
  /** Overall vertical density (margins + spacing). */
  density: Density
  /** Accent colour as a 6-digit hex string, no leading '#'. */
  accent: string
}

export const DEFAULT_LATEX_STYLE: LatexStyle = {
  fontSize: 10.5,
  density: "normal",
  accent: "2E6A4A",
}

/** Vertical rhythm for a given density. Templates scale these to taste. */
export interface DensityMetrics {
  margin: string
  sectionBefore: string
  sectionAfter: string
  itemSep: string
  entryGap: string
}

export const DENSITY: Record<Density, DensityMetrics> = {
  compact: { margin: "0.5in", sectionBefore: "8pt", sectionAfter: "3pt", itemSep: "1pt", entryGap: "4pt" },
  normal: { margin: "0.7in", sectionBefore: "11pt", sectionAfter: "5pt", itemSep: "2pt", entryGap: "7pt" },
  relaxed: { margin: "0.85in", sectionBefore: "14pt", sectionAfter: "7pt", itemSep: "3pt", entryGap: "10pt" },
}

export interface LatexTemplate {
  /** Stable internal key. */
  key: string
  /** Human label (matches the seeded Template.name it renders for). */
  label: string
  /** One-line description of the design. */
  description: string
  /** Seeded `Template.name` values this design renders, matched case-insensitively. */
  matches: string[]
  render: (data: ResumeData, style: LatexStyle) => string
}

/** Resolve the effective metrics + validated style values for a render. */
export function resolveStyle(style: LatexStyle): {
  m: DensityMetrics
  fontSize: number
  leading: string
  accent: string
} {
  const m = DENSITY[style.density] ?? DENSITY.normal
  const fontSize = Number.isFinite(style.fontSize) ? style.fontSize : DEFAULT_LATEX_STYLE.fontSize
  const leading = (fontSize * 1.25).toFixed(1)
  const accent = /^[0-9a-fA-F]{6}$/.test(style.accent) ? style.accent : DEFAULT_LATEX_STYLE.accent
  return { m, fontSize, leading, accent }
}
