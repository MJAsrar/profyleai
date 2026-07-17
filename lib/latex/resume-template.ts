import type { ResumeData } from "@/lib/resume-store"
import { modernTemplate } from "./templates/modern"
import { techTemplate } from "./templates/tech"
import { classicTemplate } from "./templates/classic"
import { minimalTemplate } from "./templates/minimal"
import { atsTemplate } from "./templates/ats"
import { DEFAULT_LATEX_STYLE, type LatexStyle, type LatexTemplate } from "./types"

/**
 * The LaTeX template registry — the single entry point for turning résumé JSON into a .tex
 * document.
 *
 * Templates are resolved from the seeded `Template.name` the user picked in the builder, so the
 * template picker actually changes the output rather than decorating a fixed design. An unknown
 * or missing name falls back to Modern Professional.
 */

export { DEFAULT_LATEX_STYLE }
export type { LatexStyle, Density, LatexTemplate } from "./types"

export const LATEX_TEMPLATES: LatexTemplate[] = [
  modernTemplate,
  techTemplate,
  classicTemplate,
  minimalTemplate,
  atsTemplate,
]

export const DEFAULT_TEMPLATE = modernTemplate

/** Resolve a seeded template name (e.g. "Tech Stack") to its design. Falls back to Modern. */
export function resolveTemplate(templateName?: string | null): LatexTemplate {
  if (!templateName) return DEFAULT_TEMPLATE
  const needle = templateName.trim().toLowerCase()
  if (!needle) return DEFAULT_TEMPLATE

  const exact = LATEX_TEMPLATES.find((t) => t.matches.includes(needle) || t.key === needle)
  if (exact) return exact

  // Tolerate renamed/edited seed rows: "Modern Professional v2" still finds Modern.
  const partial = LATEX_TEMPLATES.find((t) => t.matches.some((alias) => needle.includes(alias)))
  return partial ?? DEFAULT_TEMPLATE
}

/** Render a résumé to a full .tex document using the design for `templateName`. */
export function resumeToLatex(
  data: ResumeData,
  style: LatexStyle = DEFAULT_LATEX_STYLE,
  templateName?: string | null
): string {
  return resolveTemplate(templateName).render(data, style)
}
