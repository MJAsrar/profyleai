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
 * Traditional Professional — a conservative serif résumé (TeX Gyre Termes, a Times face) with a
 * ruled, centred masthead and centred section headings. The register that suits law, finance,
 * academia and anywhere a sans face reads as too casual.
 */

const SEP = " \\quad$\\vert$\\quad "

function header(data: ResumeData): string {
  const p = data.personalInfo
  const name = escapeLatex((p.fullName || data.title || "").toUpperCase())
  const title = p.professionalTitle
    ? `\\\\[3pt]{\\itshape\\large ${escapeLatex(p.professionalTitle)}}`
    : ""
  const bits = contactBits(data)
  const contact = bits.length ? `\\\\[6pt]{\\small ${bits.join(SEP)}}` : ""
  return `\\begin{center}
{\\namefont\\LARGE ${name}}${title}${contact}
\\end{center}
\\vspace{4pt}
\\hrule height 0.8pt
\\vspace{2pt}
\\hrule height 0.3pt
\\vspace{6pt}`
}

function experience(data: ResumeData, m: DensityMetrics): string {
  return data.experience
    .map((exp) => {
      const head = `\\noindent\\textbf{${escapeLatex(exp.company || "")}}\\hfill{\\small ${escapeLatex(
        exp.location || ""
      )}}\\par`
      const role = `\\noindent{\\itshape ${escapeLatex(exp.position || "")}}\\hfill{\\small\\itshape ${dateRange(
        exp.startDate,
        exp.endDate,
        exp.isCurrent
      )}}\\par`
      const desc = exp.description ? `\\vspace{2pt}${escapeLatexParagraphs(exp.description)}\\par` : ""
      const tech = cleanList(exp.technologies).length
        ? `{\\small\\itshape ${escapeLatex(cleanList(exp.technologies).join(" \\textperiodcentered\\ "))}}\\par`
        : ""
      return joinNonEmpty([head, role, desc, bullets(exp.achievements, m.itemSep), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function education(data: ResumeData, m: DensityMetrics): string {
  return data.education
    .map((edu) => {
      const head = `\\noindent\\textbf{${escapeLatex(edu.institution || "")}}\\hfill{\\small ${escapeLatex(
        edu.location || ""
      )}}\\par`
      const degree = joinNonEmpty([edu.degree, edu.field], ", ")
      const line = `\\noindent{\\itshape ${escapeLatex(degree)}}\\hfill{\\small\\itshape ${dateRange(
        edu.startDate,
        edu.endDate
      )}}\\par`
      const details: string[] = []
      if (edu.gpa) details.push(`GPA: ${edu.gpa}`)
      if (cleanList(edu.honors).length) details.push(cleanList(edu.honors).join(", "))
      if (cleanList(edu.relevantCourses).length)
        details.push(`Relevant coursework: ${cleanList(edu.relevantCourses).join(", ")}`)
      const detailLine = details.length ? `{\\small ${escapeLatex(details.join(". "))}}\\par` : ""
      return joinNonEmpty([head, line, detailLine], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function skills(data: ResumeData): string {
  return data.skills
    .map((cat) => {
      const names = skillNames(cat)
      if (!names.length) return ""
      const label = cat.category ? `\\textbf{${escapeLatex(cat.category)}.} ` : ""
      return `\\noindent ${label}${escapeLatex(names.join(", "))}\\par`
    })
    .filter(Boolean)
    .join("\n\\vspace{3pt}\n")
}

function projects(data: ResumeData, m: DensityMetrics): string {
  return data.projects
    .map((proj) => {
      const head = `\\noindent\\textbf{${escapeLatex(proj.name || "")}}\\hfill{\\small\\itshape ${dateRange(
        proj.startDate,
        proj.endDate
      )}}\\par`
      const links: string[] = []
      if (proj.liveUrl) links.push(link(proj.liveUrl, displayUrl(proj.liveUrl)))
      if (proj.githubUrl) links.push(link(proj.githubUrl, displayUrl(proj.githubUrl)))
      const linkLine = links.length ? `{\\small ${links.join(", ")}}\\par` : ""
      const desc = proj.description ? `${escapeLatexParagraphs(proj.description)}\\par` : ""
      const tech = cleanList(proj.technologies).length
        ? `{\\small\\itshape ${escapeLatex(cleanList(proj.technologies).join(", "))}}\\par`
        : ""
      return joinNonEmpty([head, linkLine, desc, bullets(proj.highlights, m.itemSep), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function certifications(data: ResumeData, m: DensityMetrics): string {
  return data.certifications
    .map((cert) => {
      const date = cert.isLifetime ? "Lifetime" : formatDate(cert.issueDate)
      const head = `\\noindent\\textbf{${escapeLatex(cert.name || "")}}\\hfill{\\small\\itshape ${date}}\\par`
      const details: string[] = []
      if (cert.issuedBy) details.push(cert.issuedBy)
      if (cert.credentialId) details.push(`Credential ID: ${cert.credentialId}`)
      if (cert.description) details.push(cert.description)
      const detailLine = details.length ? `{\\small ${escapeLatex(details.join(". "))}}\\par` : ""
      return joinNonEmpty([head, detailLine], "\n")
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

  const body = joinNonEmpty(
    [
      section("Professional Summary", data.summary ? escapeLatexParagraphs(data.summary) : ""),
      section("Professional Experience", experience(data, m)),
      section("Education", education(data, m)),
      section("Skills", skills(data)),
      section("Projects", projects(data, m)),
      section("Certifications", certifications(data, m)),
    ],
    "\n\n"
  )

  return `\\documentclass{article}
${fontFamily("texgyretermes-regular.otf", "texgyretermes-bold.otf", "texgyretermes-italic.otf", "texgyretermes-bolditalic.otf")}
\\newfontfamily\\namefont{texgyretermes-bold.otf}[LetterSpace=8.0]
\\newfontfamily\\headingfont{texgyretermes-bold.otf}[LetterSpace=10.0]
\\usepackage[margin=${m.margin}]{geometry}
${commonPreamble(accent)}

\\titleformat{\\section}[block]{\\filcenter\\headingfont\\small\\color{accent}}{}{0em}{}[\\vspace{2pt}\\color{accent}\\titlerule]
\\titlespacing*{\\section}{0pt}{${m.sectionBefore}}{${m.sectionAfter}}

\\AtBeginDocument{\\fontsize{${fontSize}pt}{${leading}pt}\\selectfont}

\\begin{document}
${header(data)}

${body}
\\end{document}
`
}

export const classicTemplate: LatexTemplate = {
  key: "classic",
  label: "Traditional Professional",
  description: "Conservative Times serif with a ruled masthead and centred section headings.",
  matches: ["traditional professional", "traditional", "classic"],
  render,
}
