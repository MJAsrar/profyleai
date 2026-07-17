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
 * Tech Stack — the dense, engineer-favoured layout: tight margins, letterspaced rules, and
 * two-column entries where the role sits left and the dates flush right. Skills lead, because
 * for engineering roles they're the first thing scanned. Fits a lot on one page without
 * feeling cramped.
 *
 * Uses \entry / \project / \bullets macros defined in the preamble so the generated body stays
 * readable — the same trick the popular community templates use.
 */

const SEP = " $|$ "

/** Headings are uppercased + letterspaced rather than \scshape: the OTF faces here have no true
 *  small-caps feature, and fontspec would silently fall back to plain caps. */
function headingFeature(): string {
  return `\\newfontfamily\\headingfont{texgyreheros-bold.otf}[LetterSpace=6.0]`
}

function macros(m: DensityMetrics): string {
  return `\\newcommand{\\entry}[4]{%
  \\vspace{1pt}\\noindent
  \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & {\\small #2} \\\\
    {\\small\\itshape #3} & {\\small\\itshape #4} \\\\
  \\end{tabular*}\\vspace{-4pt}%
}
\\newcommand{\\project}[3]{%
  \\vspace{1pt}\\noindent
  \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} \\hspace{2pt} {\\small\\itshape #2} & {\\small #3} \\\\
  \\end{tabular*}\\vspace{-4pt}%
}
\\newlist{bullets}{itemize}{1}
\\setlist[bullets]{leftmargin=0.2in, itemsep=${m.itemSep}, topsep=3pt, parsep=0pt, label=$\\bullet$, font=\\small}`
}

function header(data: ResumeData): string {
  const p = data.personalInfo
  const name = escapeLatex(p.fullName || data.title || "")
  const title = p.professionalTitle
    ? `\\\\[3pt]{\\small\\color{accent}\\itshape ${escapeLatex(p.professionalTitle)}}`
    : ""
  const bits = contactBits(data)
  const contact = bits.length ? `\\\\[4pt]{\\small ${bits.join(SEP)}}` : ""
  return `\\begin{center}\n{\\LARGE\\bfseries ${name}}${title}${contact}\n\\end{center}\n\\vspace{-2pt}`
}

function bulletBlock(items: string[]): string {
  const clean = cleanList(items)
  if (!clean.length) return ""
  return `\\begin{bullets}\n${clean.map((i) => `  \\item {\\small ${escapeLatex(i)}}`).join("\n")}\n\\end{bullets}`
}

function experience(data: ResumeData, m: DensityMetrics): string {
  return data.experience
    .map((exp) => {
      const entry = `\\entry{${escapeLatex(exp.position || "")}}{${dateRange(
        exp.startDate,
        exp.endDate,
        exp.isCurrent
      )}}{${escapeLatex(exp.company || "")}}{${escapeLatex(exp.location || "")}}`
      const desc = exp.description ? `{\\small ${escapeLatexParagraphs(exp.description)}}\\par` : ""
      const tech = cleanList(exp.technologies).length
        ? `{\\small\\textbf{Stack:} ${escapeLatex(cleanList(exp.technologies).join(", "))}}\\par`
        : ""
      return joinNonEmpty([entry, desc, bulletBlock(exp.achievements), tech], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function projects(data: ResumeData, m: DensityMetrics): string {
  return data.projects
    .map((proj) => {
      const stack = cleanList(proj.technologies).join(", ")
      const entry = `\\project{${escapeLatex(proj.name || "")}}{${escapeLatex(stack)}}{${dateRange(
        proj.startDate,
        proj.endDate
      )}}`
      const links: string[] = []
      if (proj.liveUrl) links.push(link(proj.liveUrl, displayUrl(proj.liveUrl)))
      if (proj.githubUrl) links.push(link(proj.githubUrl, displayUrl(proj.githubUrl)))
      const linkLine = links.length ? `{\\small ${links.join(SEP)}}\\par` : ""
      const desc = proj.description ? `{\\small ${escapeLatexParagraphs(proj.description)}}\\par` : ""
      return joinNonEmpty([entry, linkLine, desc, bulletBlock(proj.highlights)], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function education(data: ResumeData, m: DensityMetrics): string {
  return data.education
    .map((edu) => {
      const degree = joinNonEmpty([edu.degree, edu.field], ", ")
      const entry = `\\entry{${escapeLatex(degree)}}{${dateRange(edu.startDate, edu.endDate)}}{${escapeLatex(
        edu.institution || ""
      )}}{${escapeLatex(edu.location || "")}}`
      const extras: string[] = []
      if (edu.gpa) extras.push(`GPA: ${edu.gpa}`)
      if (cleanList(edu.honors).length) extras.push(cleanList(edu.honors).join("; "))
      if (cleanList(edu.relevantCourses).length)
        extras.push(`Coursework: ${cleanList(edu.relevantCourses).join(", ")}`)
      return joinNonEmpty([entry, bulletBlock(extras)], "\n")
    })
    .filter(Boolean)
    .join(`\n\\vspace{${m.entryGap}}\n`)
}

function skills(data: ResumeData): string {
  const rows = data.skills
    .map((cat) => {
      const names = skillNames(cat)
      if (!names.length) return ""
      const label = cat.category ? `\\textbf{${escapeLatex(cat.category)}:} ` : ""
      return `  \\item {\\small ${label}${escapeLatex(names.join(", "))}}`
    })
    .filter(Boolean)
  if (!rows.length) return ""
  return `\\begin{itemize}[leftmargin=0.1in, label={}, itemsep=1pt, topsep=2pt, parsep=0pt]\n${rows.join(
    "\n"
  )}\n\\end{itemize}`
}

function certifications(data: ResumeData): string {
  const rows = data.certifications
    .map((cert) => {
      const bits = joinNonEmpty(
        [
          cert.name ? `\\textbf{${escapeLatex(cert.name)}}` : "",
          cert.issuedBy ? escapeLatex(cert.issuedBy) : "",
          cert.isLifetime ? "" : formatDate(cert.issueDate),
          cert.credentialId ? `ID: ${escapeLatex(cert.credentialId)}` : "",
        ],
        " --- "
      )
      return bits ? `  \\item {\\small ${bits}}` : ""
    })
    .filter(Boolean)
  if (!rows.length) return ""
  return `\\begin{itemize}[leftmargin=0.1in, label={}, itemsep=1pt, topsep=2pt, parsep=0pt]\n${rows.join(
    "\n"
  )}\n\\end{itemize}`
}

function section(title: string, body: string): string {
  if (!body.trim()) return ""
  return `\\section*{${escapeLatex(title.toUpperCase())}}\n${body}`
}

function render(data: ResumeData, style: LatexStyle): string {
  const { m, fontSize, leading, accent } = resolveStyle(style)
  // This design is deliberately tighter than the shared scale.
  const margin = style.density === "compact" ? "0.4in" : style.density === "relaxed" ? "0.7in" : "0.55in"

  const body = joinNonEmpty(
    [
      section("Summary", data.summary ? `{\\small ${escapeLatexParagraphs(data.summary)}}` : ""),
      section("Technical Skills", skills(data)),
      section("Experience", experience(data, m)),
      section("Projects", projects(data, m)),
      section("Education", education(data, m)),
      section("Certifications", certifications(data)),
    ],
    "\n\n"
  )

  return `\\documentclass{article}
${fontFamily("texgyreheros-regular.otf", "texgyreheros-bold.otf", "texgyreheros-italic.otf", "texgyreheros-bolditalic.otf")}
${headingFeature()}
\\usepackage[margin=${margin}]{geometry}
${commonPreamble(accent)}
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\headingfont\\normalsize\\color{accent}}{}{0em}{}[\\vspace{-3pt}\\color{accent}\\titlerule\\vspace{-2pt}]
\\titlespacing*{\\section}{0pt}{${m.sectionBefore}}{${m.sectionAfter}}

${macros(m)}

\\AtBeginDocument{\\fontsize{${fontSize}pt}{${leading}pt}\\selectfont}

\\begin{document}
${header(data)}

${body}
\\end{document}
`
}

export const techTemplate: LatexTemplate = {
  key: "tech",
  label: "Tech Stack",
  description: "Dense engineering layout: skills first, roles left, dates flush right.",
  matches: ["tech stack", "tech", "technical"],
  render,
}
