import type { ResumeData } from "@/lib/resume-store"
import { escapeLatex, escapeLatexParagraphs } from "./escape"

/**
 * Turns the résumé JSON into a single-column, ATS-safe LaTeX document rendered with a modern
 * sans face (Latin Modern Sans, via fontspec/XeTeX — Tectonic compiles this). This is the one
 * source of truth for the builder's PDF: the same .tex drives both the live preview and the
 * download.
 *
 * Design goals: recruiter-safe (one column, real headings, selectable text), quiet typography,
 * and empty sections simply disappear.
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

interface DensityMetrics {
  margin: string
  sectionBefore: string
  sectionAfter: string
  itemSep: string
  entryGap: string
}

const DENSITY: Record<Density, DensityMetrics> = {
  compact: { margin: "0.55in", sectionBefore: "8pt", sectionAfter: "3pt", itemSep: "1pt", entryGap: "4pt" },
  normal: { margin: "0.7in", sectionBefore: "11pt", sectionAfter: "5pt", itemSep: "2pt", entryGap: "7pt" },
  relaxed: { margin: "0.85in", sectionBefore: "14pt", sectionAfter: "7pt", itemSep: "3pt", entryGap: "10pt" },
}

const SEP = " $\\cdot$ "

/** "2024-03" → "Mar 2024"; "2024" → "2024"; "" → "". */
function formatDate(value?: string): string {
  if (!value) return ""
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{4})-(\d{2})$/)
  if (!match) return escapeLatex(trimmed)
  const [, year, month] = match
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const idx = parseInt(month, 10) - 1
  const label = names[idx] ? `${names[idx]} ${year}` : year
  return escapeLatex(label)
}

function dateRange(start?: string, end?: string, isCurrent?: boolean): string {
  const from = formatDate(start)
  const to = isCurrent ? escapeLatex("Present") : formatDate(end)
  if (from && to) return `${from} -- ${to}`
  return from || to || ""
}

/** Clickable link with an escaped label; only '#' and '%' actually break \href targets. */
function link(url: string, label: string): string {
  const target = url.replace(/#/g, "\\#").replace(/%/g, "\\%")
  return `\\href{${target}}{${escapeLatex(label)}}`
}

/** Strip protocol for a compact display label. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function joinNonEmpty(parts: Array<string | undefined | null>, separator: string): string {
  return parts.filter((p): p is string => !!p && p.trim() !== "").join(separator)
}

function itemize(items: string[], itemSep: string): string {
  const escaped = items.map((i) => i.trim()).filter(Boolean)
  if (escaped.length === 0) return ""
  const lines = escaped.map((i) => `  \\item ${escapeLatex(i)}`).join("\n")
  return `\\begin{itemize}[leftmargin=1.25em, itemsep=${itemSep}, topsep=2pt, parsep=0pt]\n${lines}\n\\end{itemize}`
}

function section(title: string, body: string): string {
  if (!body.trim()) return ""
  return `\\section*{${escapeLatex(title)}}\n${body}`
}

function buildHeader(data: ResumeData): string {
  const p = data.personalInfo
  const name = escapeLatex(p.fullName || data.title || "")
  const title = p.professionalTitle ? `\\\\[2pt]{\\accentcolor\\large ${escapeLatex(p.professionalTitle)}}` : ""

  const contactBits: string[] = []
  if (p.email) contactBits.push(link(`mailto:${p.email}`, p.email))
  if (p.phone) contactBits.push(escapeLatex(p.phone))
  if (p.location) contactBits.push(escapeLatex(p.location))
  if (p.website) contactBits.push(link(p.website, displayUrl(p.website)))
  if (p.linkedin) contactBits.push(link(p.linkedin, displayUrl(p.linkedin)))
  if (p.github) contactBits.push(link(p.github, displayUrl(p.github)))
  if (p.portfolio) contactBits.push(link(p.portfolio, displayUrl(p.portfolio)))

  const contact = contactBits.length ? `\\\\[5pt]{\\small ${contactBits.join(SEP)}}` : ""

  return `\\begin{center}\n{\\LARGE\\bfseries ${name}}${title}${contact}\n\\end{center}\n\\vspace{2pt}`
}

function buildExperience(data: ResumeData, m: DensityMetrics): string {
  const entries = data.experience
    .map((exp) => {
      const headLine = `\\noindent\\textbf{${escapeLatex(exp.position || "")}}\\hfill{\\small ${dateRange(
        exp.startDate,
        exp.endDate,
        exp.isCurrent
      )}}\\par`
      const sub = joinNonEmpty([exp.company, exp.location], ", ")
      const subLine = sub ? `{\\small\\itshape ${escapeLatex(sub)}}\\par` : ""
      const desc = exp.description ? `${escapeLatexParagraphs(exp.description)}\\par` : ""
      const bullets = itemize(exp.achievements || [], m.itemSep)
      const tech =
        exp.technologies && exp.technologies.length
          ? `{\\small\\textbf{Tech:} ${escapeLatex(exp.technologies.join(", "))}}\\par`
          : ""
      return joinNonEmpty([headLine, subLine, desc, bullets, tech], "\n")
    })
    .filter(Boolean)
  return entries.join(`\n\\vspace{${m.entryGap}}\n`)
}

function buildEducation(data: ResumeData, m: DensityMetrics): string {
  const entries = data.education
    .map((edu) => {
      const degree = joinNonEmpty([edu.degree, edu.field], ", ")
      const headLine = `\\noindent\\textbf{${escapeLatex(degree)}}\\hfill{\\small ${dateRange(
        edu.startDate,
        edu.endDate
      )}}\\par`
      const sub = joinNonEmpty([edu.institution, edu.location], ", ")
      const subLine = sub ? `{\\small\\itshape ${escapeLatex(sub)}}\\par` : ""
      const details: string[] = []
      if (edu.gpa) details.push(`GPA: ${edu.gpa}`)
      if (edu.honors && edu.honors.length) details.push(edu.honors.join(", "))
      if (edu.relevantCourses && edu.relevantCourses.length)
        details.push(`Coursework: ${edu.relevantCourses.join(", ")}`)
      const detailLine = details.length ? `{\\small ${escapeLatex(details.join(" | "))}}\\par` : ""
      return joinNonEmpty([headLine, subLine, detailLine], "\n")
    })
    .filter(Boolean)
  return entries.join(`\n\\vspace{${m.entryGap}}\n`)
}

function buildSkills(data: ResumeData): string {
  const rows = data.skills
    .map((cat) => {
      const names = (cat.skills || [])
        .map((s) => s.name)
        .filter((n): n is string => !!n && n.trim() !== "")
      if (names.length === 0) return ""
      const label = cat.category ? `\\textbf{${escapeLatex(cat.category)}:} ` : ""
      return `\\noindent ${label}${escapeLatex(names.join(", "))}\\par`
    })
    .filter(Boolean)
  return rows.join("\n\\vspace{2pt}\n")
}

function buildProjects(data: ResumeData, m: DensityMetrics): string {
  const entries = data.projects
    .map((proj) => {
      const headLine = `\\noindent\\textbf{${escapeLatex(proj.name || "")}}\\hfill{\\small ${dateRange(
        proj.startDate,
        proj.endDate
      )}}\\par`
      const linkBits: string[] = []
      if (proj.liveUrl) linkBits.push(link(proj.liveUrl, displayUrl(proj.liveUrl)))
      if (proj.githubUrl) linkBits.push(link(proj.githubUrl, displayUrl(proj.githubUrl)))
      const linkLine = linkBits.length ? `{\\small ${linkBits.join(SEP)}}\\par` : ""
      const desc = proj.description ? `${escapeLatexParagraphs(proj.description)}\\par` : ""
      const bullets = itemize(proj.highlights || [], m.itemSep)
      const tech =
        proj.technologies && proj.technologies.length
          ? `{\\small\\textbf{Tech:} ${escapeLatex(proj.technologies.join(", "))}}\\par`
          : ""
      return joinNonEmpty([headLine, linkLine, desc, bullets, tech], "\n")
    })
    .filter(Boolean)
  return entries.join(`\n\\vspace{${m.entryGap}}\n`)
}

function buildCertifications(data: ResumeData, m: DensityMetrics): string {
  const entries = data.certifications
    .map((cert) => {
      const date = cert.isLifetime ? "" : formatDate(cert.issueDate)
      const headLine = `\\noindent\\textbf{${escapeLatex(cert.name || "")}}${
        cert.issuedBy ? `{\\small\\itshape\\ — ${escapeLatex(cert.issuedBy)}}` : ""
      }\\hfill{\\small ${date}}\\par`
      const details: string[] = []
      if (cert.credentialId) details.push(`ID: ${cert.credentialId}`)
      if (cert.description) details.push(cert.description)
      const detailLine = details.length ? `{\\small ${escapeLatex(details.join(" | "))}}\\par` : ""
      return joinNonEmpty([headLine, detailLine], "\n")
    })
    .filter(Boolean)
  return entries.join(`\n\\vspace{${m.entryGap}}\n`)
}

export function resumeToLatex(data: ResumeData, style: LatexStyle = DEFAULT_LATEX_STYLE): string {
  const m = DENSITY[style.density] ?? DENSITY.normal
  const fontSize = Number.isFinite(style.fontSize) ? style.fontSize : DEFAULT_LATEX_STYLE.fontSize
  const leading = (fontSize * 1.25).toFixed(1)
  const accent = /^[0-9a-fA-F]{6}$/.test(style.accent) ? style.accent : DEFAULT_LATEX_STYLE.accent

  const sections = joinNonEmpty(
    [
      section("Summary", data.summary ? escapeLatexParagraphs(data.summary) : ""),
      section("Experience", buildExperience(data, m)),
      section("Education", buildEducation(data, m)),
      section("Skills", buildSkills(data)),
      section("Projects", buildProjects(data, m)),
      section("Certifications", buildCertifications(data, m)),
    ],
    "\n\n"
  )

  return `\\documentclass{article}
\\usepackage{fontspec}
% Latin Modern Sans, looked up by FILENAME rather than family name: family-name lookup goes
% through system fontconfig, which knows nothing about Tectonic's bundled fonts (and the
% compile container has no system fonts). Filename lookup resolves via the TeX file system.
\\setmainfont{lmsans10-regular.otf}[
  BoldFont = lmsans10-bold.otf,
  ItalicFont = lmsans10-oblique.otf,
  BoldItalicFont = lmsans10-boldoblique.otf
]
\\usepackage[margin=${m.margin}]{geometry}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\definecolor{accent}{HTML}{${accent}}
\\newcommand{\\accentcolor}{\\color{accent}}

\\titleformat{\\section}{\\normalsize\\bfseries\\accentcolor}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{${m.sectionBefore}}{${m.sectionAfter}}

\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

\\AtBeginDocument{\\fontsize{${fontSize}pt}{${leading}pt}\\selectfont}

\\begin{document}
${buildHeader(data)}

${sections}
\\end{document}
`
}
