import type { ResumeData } from "@/lib/resume-store"
import { escapeLatex, escapeLatexParagraphs } from "../escape"
import {
  bullets,
  cleanList,
  commonPreamble,
  contactBits,
  dateRange,
  displayUrl,
  fontFamily,
  formatDate,
  joinNonEmpty,
  link,
  skillNames,
} from "../format"
import { resolveStyle, type LatexStyle, type LatexTemplate, type DensityMetrics } from "../types"

/**
 * Modern Professional — a clean single-column sans résumé with a centred header and
 * accent-coloured section headings underlined by a rule. The safe, contemporary default.
 */

const SEP = " $\\cdot$ "

function header(data: ResumeData): string {
  const p = data.personalInfo
  const name = escapeLatex(p.fullName || data.title || "")
  const title = p.professionalTitle
    ? `\\\\[2pt]{\\color{accent}\\large ${escapeLatex(p.professionalTitle)}}`
    : ""
  const bits = contactBits(data)
  const contact = bits.length ? `\\\\[5pt]{\\small ${bits.join(SEP)}}` : ""
  return `\\begin{center}\n{\\LARGE\\bfseries ${name}}${title}${contact}\n\\end{center}\n\\vspace{2pt}`
}

function experience(data: ResumeData, m: DensityMetrics): string {
  return data.experience
    .map((exp) => {
      const head = `\\noindent\\textbf{${escapeLatex(exp.position || "")}}\\hfill{\\small ${dateRange(
        exp.startDate,
        exp.endDate,
        exp.isCurrent
      )}}\\par`
      const sub = joinNonEmpty([exp.company, exp.location], ", ")
      const subLine = sub ? `{\\small\\itshape ${escapeLatex(sub)}}\\par` : ""
      const desc = exp.description ? `${escapeLatexParagraphs(exp.description)}\\par` : ""
      const tech = cleanList(exp.technologies).length
        ? `{\\small\\textbf{Tech:} ${escapeLatex(cleanList(exp.technologies).join(", "))}}\\par`
        : ""
      return joinNonEmpty([head, subLine, desc, bullets(exp.achievements, m.itemSep), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function education(data: ResumeData, m: DensityMetrics): string {
  return data.education
    .map((edu) => {
      const degree = joinNonEmpty([edu.degree, edu.field], ", ")
      const head = `\\noindent\\textbf{${escapeLatex(degree)}}\\hfill{\\small ${dateRange(
        edu.startDate,
        edu.endDate
      )}}\\par`
      const sub = joinNonEmpty([edu.institution, edu.location], ", ")
      const subLine = sub ? `{\\small\\itshape ${escapeLatex(sub)}}\\par` : ""
      const details: string[] = []
      if (edu.gpa) details.push(`GPA: ${edu.gpa}`)
      if (cleanList(edu.honors).length) details.push(cleanList(edu.honors).join(", "))
      if (cleanList(edu.relevantCourses).length)
        details.push(`Coursework: ${cleanList(edu.relevantCourses).join(", ")}`)
      const detailLine = details.length ? `{\\small ${escapeLatex(details.join(" | "))}}\\par` : ""
      return joinNonEmpty([head, subLine, detailLine], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function skills(data: ResumeData): string {
  return data.skills
    .map((cat) => {
      const names = skillNames(cat)
      if (!names.length) return ""
      const label = cat.category ? `\\textbf{${escapeLatex(cat.category)}:} ` : ""
      return `\\noindent ${label}${escapeLatex(names.join(", "))}\\par`
    })
    .filter(Boolean)
    .join("\n\\vspace{2pt}\n")
}

function projects(data: ResumeData, m: DensityMetrics): string {
  return data.projects
    .map((proj) => {
      const head = `\\noindent\\textbf{${escapeLatex(proj.name || "")}}\\hfill{\\small ${dateRange(
        proj.startDate,
        proj.endDate
      )}}\\par`
      const links: string[] = []
      if (proj.liveUrl) links.push(link(proj.liveUrl, displayUrl(proj.liveUrl)))
      if (proj.githubUrl) links.push(link(proj.githubUrl, displayUrl(proj.githubUrl)))
      const linkLine = links.length ? `{\\small ${links.join(SEP)}}\\par` : ""
      const desc = proj.description ? `${escapeLatexParagraphs(proj.description)}\\par` : ""
      const tech = cleanList(proj.technologies).length
        ? `{\\small\\textbf{Tech:} ${escapeLatex(cleanList(proj.technologies).join(", "))}}\\par`
        : ""
      return joinNonEmpty([head, linkLine, desc, bullets(proj.highlights, m.itemSep), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function certifications(data: ResumeData, m: DensityMetrics): string {
  return data.certifications
    .map((cert) => {
      const date = cert.isLifetime ? "" : formatDate(cert.issueDate)
      const issuer = cert.issuedBy ? `{\\small\\itshape\\ --- ${escapeLatex(cert.issuedBy)}}` : ""
      const head = `\\noindent\\textbf{${escapeLatex(cert.name || "")}}${issuer}\\hfill{\\small ${date}}\\par`
      const details: string[] = []
      if (cert.credentialId) details.push(`ID: ${cert.credentialId}`)
      if (cert.description) details.push(cert.description)
      const detailLine = details.length ? `{\\small ${escapeLatex(details.join(" | "))}}\\par` : ""
      return joinNonEmpty([head, detailLine], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function section(title: string, body: string): string {
  if (!body.trim()) return ""
  return `\\section*{${escapeLatex(title)}}\n${body}`
}

function render(data: ResumeData, style: LatexStyle): string {
  const { m, fontSize, leading, accent } = resolveStyle(style)

  const body = joinNonEmpty(
    [
      section("Summary", data.summary ? escapeLatexParagraphs(data.summary) : ""),
      section("Experience", experience(data, m)),
      section("Education", education(data, m)),
      section("Skills", skills(data)),
      section("Projects", projects(data, m)),
      section("Certifications", certifications(data, m)),
    ],
    "\n\n"
  )

  return `\\documentclass{article}
${fontFamily("lmsans10-regular.otf", "lmsans10-bold.otf", "lmsans10-oblique.otf", "lmsans10-boldoblique.otf")}
\\usepackage[margin=${m.margin}]{geometry}
${commonPreamble(accent)}

\\titleformat{\\section}{\\normalsize\\bfseries\\color{accent}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{${m.sectionBefore}}{${m.sectionAfter}}

\\AtBeginDocument{\\fontsize{${fontSize}pt}{${leading}pt}\\selectfont}

\\begin{document}
${header(data)}

${body}
\\end{document}
`
}

export const modernTemplate: LatexTemplate = {
  key: "modern",
  label: "Modern Professional",
  description: "Clean single-column sans with a centred header and accent section rules.",
  matches: ["modern professional", "modern"],
  render,
}
