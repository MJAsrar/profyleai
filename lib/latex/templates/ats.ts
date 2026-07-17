import type { ResumeData } from "@/lib/resume-store"
import { escapeLatex, escapeLatexParagraphs } from "../escape"
import {
  bullets,
  cleanList,
  commonPreamble,
  dateRange,
  displayUrl,
  fontFamily,
  formatDate,
  joinNonEmpty,
  skillNames,
} from "../format"
import { resolveStyle, type LatexStyle, type LatexTemplate, type DensityMetrics } from "../types"

/**
 * ATS Friendly — deliberately the plainest design here, optimised for résumé parsers rather
 * than for the eye.
 *
 * The constraints are what make it: no tables (some parsers flatten cells in the wrong order),
 * no letterspacing, no multi-column anything, conventional section names ("Work Experience",
 * "Education", "Skills") that parsers key off, URLs written as plain visible text rather than
 * hidden behind link labels, and one fact per line. It's a Helvetica-alike face because that's
 * the ATS convention.
 *
 * Every other template here already extracts cleanly; this one trades visual interest for the
 * fewest possible assumptions about the reader.
 */

function header(data: ResumeData): string {
  const p = data.personalInfo
  const lines: string[] = []
  lines.push(`\\noindent{\\LARGE\\bfseries ${escapeLatex(p.fullName || data.title || "")}}\\par`)
  if (p.professionalTitle) lines.push(`\\noindent ${escapeLatex(p.professionalTitle)}\\par`)

  // Plain text, not \href: what the parser sees is exactly what's printed.
  const contact = joinNonEmpty(
    [p.location, p.phone, p.email].map((v) => (v ? escapeLatex(v) : "")),
    " | "
  )
  if (contact) lines.push(`\\noindent ${contact}\\par`)

  const webs = joinNonEmpty(
    [p.linkedin, p.github, p.website, p.portfolio].map((u) => (u ? escapeLatex(displayUrl(u)) : "")),
    " | "
  )
  if (webs) lines.push(`\\noindent ${webs}\\par`)

  return lines.join("\n")
}

function experience(data: ResumeData, m: DensityMetrics): string {
  return data.experience
    .map((exp) => {
      const lines: string[] = []
      if (exp.position) lines.push(`\\noindent\\textbf{${escapeLatex(exp.position)}}\\par`)
      const org = joinNonEmpty([exp.company, exp.location], ", ")
      const when = dateRange(exp.startDate, exp.endDate, exp.isCurrent)
      const orgLine = joinNonEmpty([org ? escapeLatex(org) : "", when], " | ")
      if (orgLine) lines.push(`\\noindent ${orgLine}\\par`)
      if (exp.description) lines.push(`${escapeLatexParagraphs(exp.description)}\\par`)
      const b = bullets(exp.achievements, m.itemSep, "1.5em")
      if (b) lines.push(b)
      if (cleanList(exp.technologies).length)
        lines.push(
          `\\noindent Technologies: ${escapeLatex(cleanList(exp.technologies).join(", "))}\\par`
        )
      return lines.join("\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function education(data: ResumeData, m: DensityMetrics): string {
  return data.education
    .map((edu) => {
      const lines: string[] = []
      const degree = joinNonEmpty([edu.degree, edu.field], ", ")
      if (degree) lines.push(`\\noindent\\textbf{${escapeLatex(degree)}}\\par`)
      const org = joinNonEmpty([edu.institution, edu.location], ", ")
      const when = dateRange(edu.startDate, edu.endDate)
      const orgLine = joinNonEmpty([org ? escapeLatex(org) : "", when], " | ")
      if (orgLine) lines.push(`\\noindent ${orgLine}\\par`)
      if (edu.gpa) lines.push(`\\noindent GPA: ${escapeLatex(edu.gpa)}\\par`)
      if (cleanList(edu.honors).length)
        lines.push(`\\noindent Honors: ${escapeLatex(cleanList(edu.honors).join(", "))}\\par`)
      if (cleanList(edu.relevantCourses).length)
        lines.push(
          `\\noindent Relevant Coursework: ${escapeLatex(cleanList(edu.relevantCourses).join(", "))}\\par`
        )
      return lines.join("\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function skills(data: ResumeData): string {
  return data.skills
    .map((cat) => {
      const names = skillNames(cat)
      if (!names.length) return ""
      const label = cat.category ? `${escapeLatex(cat.category)}: ` : ""
      return `\\noindent ${label}${escapeLatex(names.join(", "))}\\par`
    })
    .filter(Boolean)
    .join("\n\\vspace{2pt}\n")
}

function projects(data: ResumeData, m: DensityMetrics): string {
  return data.projects
    .map((proj) => {
      const lines: string[] = []
      if (proj.name) lines.push(`\\noindent\\textbf{${escapeLatex(proj.name)}}\\par`)
      const when = dateRange(proj.startDate, proj.endDate)
      if (when) lines.push(`\\noindent ${when}\\par`)
      if (proj.description) lines.push(`${escapeLatexParagraphs(proj.description)}\\par`)
      const b = bullets(proj.highlights, m.itemSep, "1.5em")
      if (b) lines.push(b)
      if (cleanList(proj.technologies).length)
        lines.push(
          `\\noindent Technologies: ${escapeLatex(cleanList(proj.technologies).join(", "))}\\par`
        )
      const urls = joinNonEmpty(
        [proj.liveUrl, proj.githubUrl].map((u) => (u ? escapeLatex(displayUrl(u)) : "")),
        " | "
      )
      if (urls) lines.push(`\\noindent ${urls}\\par`)
      return lines.join("\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function certifications(data: ResumeData, m: DensityMetrics): string {
  return data.certifications
    .map((cert) => {
      const lines: string[] = []
      if (cert.name) lines.push(`\\noindent\\textbf{${escapeLatex(cert.name)}}\\par`)
      const meta = joinNonEmpty(
        [
          cert.issuedBy ? escapeLatex(cert.issuedBy) : "",
          cert.isLifetime ? escapeLatex("Lifetime") : formatDate(cert.issueDate),
          cert.credentialId ? `Credential ID: ${escapeLatex(cert.credentialId)}` : "",
        ],
        " | "
      )
      if (meta) lines.push(`\\noindent ${meta}\\par`)
      if (cert.description) lines.push(`${escapeLatexParagraphs(cert.description)}\\par`)
      return lines.join("\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function section(title: string, body: string): string {
  if (!body.trim()) return ""
  return `\\section*{${escapeLatex(title.toUpperCase())}}\n${body}`
}

function render(data: ResumeData, style: LatexStyle): string {
  const { m, fontSize, leading, accent } = resolveStyle(style)
  // Parsers cope best with conventional page geometry.
  const margin = style.density === "compact" ? "0.6in" : style.density === "relaxed" ? "1in" : "0.8in"

  const body = joinNonEmpty(
    [
      section("Summary", data.summary ? escapeLatexParagraphs(data.summary) : ""),
      section("Skills", skills(data)),
      section("Work Experience", experience(data, m)),
      section("Education", education(data, m)),
      section("Projects", projects(data, m)),
      section("Certifications", certifications(data, m)),
    ],
    "\n\n"
  )

  return `\\documentclass{article}
${fontFamily("texgyreheros-regular.otf", "texgyreheros-bold.otf", "texgyreheros-italic.otf", "texgyreheros-bolditalic.otf")}
\\usepackage[margin=${margin}]{geometry}
${commonPreamble(accent)}

\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0em}{}
\\titlespacing*{\\section}{0pt}{${m.sectionBefore}}{${m.sectionAfter}}

\\AtBeginDocument{\\fontsize{${fontSize}pt}{${leading}pt}\\selectfont}

\\begin{document}
${header(data)}
\\vspace{4pt}

${body}
\\end{document}
`
}

export const atsTemplate: LatexTemplate = {
  key: "ats",
  label: "ATS Friendly",
  description: "Plainest possible single-column layout, optimised for résumé parsers.",
  matches: ["ats friendly", "ats"],
  render,
}
