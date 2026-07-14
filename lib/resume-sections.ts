import type { ResumeData } from "@/lib/resume-store"

/**
 * The résumé's sections, and what "done" means for each.
 *
 * Completion is DERIVED from the data on every render — there is no `completed` flag
 * stored anywhere. A flag would drift the moment a user deleted their last job, and
 * the rail would keep claiming the section was finished.
 */

export type SectionKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"

export interface SectionDef {
  key: SectionKey
  label: string
  /** Required sections gate the completion bar; optional ones only add to it. */
  required: boolean
  /** Shown in the rail when the section is empty — says what to put there, not "empty". */
  hint: string
}

export const RESUME_SECTIONS: readonly SectionDef[] = [
  { key: "personal", label: "Personal info", required: true, hint: "Name and email" },
  { key: "summary", label: "Summary", required: true, hint: "Two or three lines" },
  { key: "experience", label: "Experience", required: true, hint: "Where you've worked" },
  { key: "education", label: "Education", required: true, hint: "School or training" },
  { key: "skills", label: "Skills", required: true, hint: "What you can do" },
  { key: "projects", label: "Projects", required: false, hint: "Optional" },
  { key: "certifications", label: "Certifications", required: false, hint: "Optional" },
] as const

const nonEmpty = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0

/** How many entries a section holds. `null` for sections that aren't lists. */
export function sectionCount(data: ResumeData, key: SectionKey): number | null {
  switch (key) {
    case "experience":
      return data.experience?.length ?? 0
    case "education":
      return data.education?.length ?? 0
    case "skills":
      return data.skills?.length ?? 0
    case "projects":
      return data.projects?.length ?? 0
    case "certifications":
      return data.certifications?.length ?? 0
    default:
      return null
  }
}

export function isSectionComplete(data: ResumeData, key: SectionKey): boolean {
  switch (key) {
    case "personal":
      return nonEmpty(data.personalInfo?.fullName) && nonEmpty(data.personalInfo?.email)

    case "summary":
      // A one-word summary is not a summary. 40 characters is roughly one sentence.
      return (data.summary?.trim().length ?? 0) >= 40

    case "experience":
      return (data.experience ?? []).some((e) => nonEmpty(e.company) && nonEmpty(e.position))

    case "education":
      return (data.education ?? []).some((e) => nonEmpty(e.institution) && nonEmpty(e.degree))

    case "skills":
      return (data.skills ?? []).some((c) => (c.skills ?? []).some((s) => nonEmpty(s.name)))

    case "projects":
      return (data.projects ?? []).some((p) => nonEmpty(p.name))

    case "certifications":
      return (data.certifications ?? []).some((c) => nonEmpty(c.name))
  }
}

/**
 * Percent complete, counted over the REQUIRED sections only.
 *
 * Optional sections can't push you past 100 and their absence can't hold you below it —
 * otherwise a perfectly good résumé with no side projects would sit at 71% forever.
 */
export function completionPercent(data: ResumeData): number {
  const required = RESUME_SECTIONS.filter((s) => s.required)
  const done = required.filter((s) => isSectionComplete(data, s.key)).length
  return Math.round((done / required.length) * 100)
}

/** The first required section that isn't done — what the "next" button should jump to. */
export function nextIncompleteSection(data: ResumeData): SectionKey | null {
  return (
    RESUME_SECTIONS.find((s) => s.required && !isSectionComplete(data, s.key))?.key ?? null
  )
}
