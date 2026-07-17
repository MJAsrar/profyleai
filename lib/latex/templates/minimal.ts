import type { ResumeData } from "@/lib/resume-store"
import { escapeLatex, escapeLatexParagraphs } from "../escape"
import {
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
 * Clean Minimalist — an airy, editorial design: left-aligned masthead, no rules anywhere, and
 * quiet letterspaced headings. Whitespace does the separating that rules do elsewhere, so it
 * reads calm and modern. Best for people with focused, high-signal content rather than those
 * cramming three pages onto one.
 */

const SEP = "  ·  "

function header(data: ResumeData): string {
  const p = data.personalInfo
  const name = escapeLatex(p.fullName || data.title || "")
  const title = p.professionalTitle
    ? `\\\\[4pt]{\\color{accent}\\large ${escapeLatex(p.professionalTitle)}}`
    : ""
  const bits = contactBits(data)
  const contact = bits.length ? `\\\\[8pt]{\\small\\color{muted} ${bits.join(escapeLatex(SEP))}}` : ""
  return `\\noindent{\\namefont\\huge ${name}}${title}${contact}\n\\vspace{6pt}`
}

/** Position / company on the left, dates quietly right. No rules, no bold shouting. */
function entryHead(left: string, right: string): string {
  return `\\noindent ${left}\\hfill{\\small\\color{muted} ${right}}\\par`
}

function dashList(items: string[], m: DensityMetrics): string {
  const clean = cleanList(items)
  if (!clean.length) return ""
  const lines = clean.map((i) => `  \\item ${escapeLatex(i)}`).join("\n")
  return `\\begin{itemize}[leftmargin=1em, itemsep=${m.itemSep}, topsep=4pt, parsep=0pt, label={\\color{accent}\\textendash}]\n${lines}\n\\end{itemize}`
}

function experience(data: ResumeData, m: DensityMetrics): string {
  return data.experience
    .map((exp) => {
      const head = entryHead(
        `\\textbf{${escapeLatex(exp.position || "")}}`,
        dateRange(exp.startDate, exp.endDate, exp.isCurrent, " \\textendash\\ ")
      )
      const sub = joinNonEmpty([exp.company, exp.location], ", ")
      const subLine = sub ? `\\noindent{\\small\\color{muted} ${escapeLatex(sub)}}\\par` : ""
      const desc = exp.description ? `\\vspace{3pt}${escapeLatexParagraphs(exp.description)}\\par` : ""
      const tech = cleanList(exp.technologies).length
        ? `\\vspace{2pt}{\\small\\color{muted} ${escapeLatex(cleanList(exp.technologies).join(SEP))}}\\par`
        : ""
      return joinNonEmpty([head, subLine, desc, dashList(exp.achievements, m), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function education(data: ResumeData, m: DensityMetrics): string {
  return data.education
    .map((edu) => {
      const degree = joinNonEmpty([edu.degree, edu.field], ", ")
      const head = entryHead(
        `\\textbf{${escapeLatex(degree)}}`,
        dateRange(edu.startDate, edu.endDate, false, " \\textendash\\ ")
      )
      const sub = joinNonEmpty([edu.institution, edu.location], ", ")
      const subLine = sub ? `\\noindent{\\small\\color{muted} ${escapeLatex(sub)}}\\par` : ""
      const details: string[] = []
      if (edu.gpa) details.push(`GPA ${edu.gpa}`)
      if (cleanList(edu.honors).length) details.push(cleanList(edu.honors).join(", "))
      if (cleanList(edu.relevantCourses).length) details.push(cleanList(edu.relevantCourses).join(", "))
      const detailLine = details.length
        ? `{\\small\\color{muted} ${escapeLatex(details.join(SEP))}}\\par`
        : ""
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
      const label = cat.category
        ? `{\\small\\color{muted} ${escapeLatex(cat.category)}}\\par\\vspace{1pt}`
        : ""
      return `\\noindent ${label}${escapeLatex(names.join(SEP))}\\par`
    })
    .filter(Boolean)
    .join("\n\\vspace{5pt}\n")
}

function projects(data: ResumeData, m: DensityMetrics): string {
  return data.projects
    .map((proj) => {
      const head = entryHead(
        `\\textbf{${escapeLatex(proj.name || "")}}`,
        dateRange(proj.startDate, proj.endDate, false, " \\textendash\\ ")
      )
      const links: string[] = []
      if (proj.liveUrl) links.push(link(proj.liveUrl, displayUrl(proj.liveUrl)))
      if (proj.githubUrl) links.push(link(proj.githubUrl, displayUrl(proj.githubUrl)))
      const linkLine = links.length ? `\\noindent{\\small ${links.join(escapeLatex(SEP))}}\\par` : ""
      const desc = proj.description ? `\\vspace{2pt}${escapeLatexParagraphs(proj.description)}\\par` : ""
      const tech = cleanList(proj.technologies).length
        ? `\\vspace{2pt}{\\small\\color{muted} ${escapeLatex(cleanList(proj.technologies).join(SEP))}}\\par`
        : ""
      return joinNonEmpty([head, linkLine, desc, dashList(proj.highlights, m), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function certifications(data: ResumeData, m: DensityMetrics): string {
  return data.certifications
    .map((cert) => {
      const head = entryHead(
        `\\textbf{${escapeLatex(cert.name || "")}}`,
        cert.isLifetime ? "" : formatDate(cert.issueDate)
      )
      const details: string[] = []
      if (cert.issuedBy) details.push(cert.issuedBy)
      if (cert.credentialId) details.push(`ID ${cert.credentialId}`)
      if (cert.description) details.push(cert.description)
      const detailLine = details.length
        ? `\\noindent{\\small\\color{muted} ${escapeLatex(details.join(SEP))}}\\par`
        : ""
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
  // Minimalism needs air: widen the margins beyond the shared scale.
  const margin = style.density === "compact" ? "0.7in" : style.density === "relaxed" ? "1.05in" : "0.9in"
  const before = style.density === "compact" ? "13pt" : style.density === "relaxed" ? "20pt" : "16pt"

  const body = joinNonEmpty(
    [
      section("Profile", data.summary ? escapeLatexParagraphs(data.summary) : ""),
      section("Experience", experience(data, m)),
      section("Projects", projects(data, m)),
      section("Skills", skills(data)),
      section("Education", education(data, m)),
      section("Certifications", certifications(data, m)),
    ],
    "\n\n"
  )

  return `\\documentclass{article}
${fontFamily("texgyreheros-regular.otf", "texgyreheros-bold.otf", "texgyreheros-italic.otf", "texgyreheros-bolditalic.otf")}
\\newfontfamily\\namefont{texgyreadventor-bold.otf}[LetterSpace=-2.0]
\\newfontfamily\\headingfont{texgyreadventor-bold.otf}[LetterSpace=18.0]
\\usepackage[margin=${margin}]{geometry}
${commonPreamble(accent)}
\\definecolor{muted}{HTML}{6F6F6F}

\\titleformat{\\section}{\\headingfont\\scriptsize\\color{accent}}{}{0em}{}
\\titlespacing*{\\section}{0pt}{${before}}{6pt}

\\AtBeginDocument{\\fontsize{${fontSize}pt}{${leading}pt}\\selectfont}

\\begin{document}
${header(data)}

${body}
\\end{document}
`
}

export const minimalTemplate: LatexTemplate = {
  key: "minimal",
  label: "Clean Minimalist",
  description: "Airy editorial layout with a left-aligned masthead and no rules.",
  matches: ["clean minimalist", "minimalist", "minimal", "clean"],
  render,
}
