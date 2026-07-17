import { escapeLatex, escapeLatexParagraphs } from "./escape"

/**
 * LaTeX cover letter — a serif business letter (TeX Gyre Termes, a Times face) matching the
 * builder's cover-letter design: a centred name under a rule, contact on the left with the date
 * on the right, an "RE:" subject line, a salutation, justified body paragraphs, and a signature
 * block. Compiled by the same Tectonic service as the résumé templates.
 */

export interface CoverLetterInput {
  jobDetails: {
    jobTitle?: string
    companyName?: string
    hiringManager?: string
    jobDescription?: string
  }
  personalInfo: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
  }
  content: {
    opening?: string
    body?: string
    closing?: string
  }
  /** The letter's date, formatted by the caller (scripts can't call Date at generation time). */
  dateLabel?: string
}

function paragraph(text?: string): string {
  const escaped = escapeLatexParagraphs(text)
  if (!escaped) return ""
  // escapeLatexParagraphs already splits blank-line paragraphs with \n\n; keep them spaced.
  return escaped
    .split("\n\n")
    .map((p) => `${p}\\par\\vspace{9pt}`)
    .join("\n")
}

export function coverLetterToLatex(data: CoverLetterInput): string {
  const p = data.personalInfo
  const name = escapeLatex((p.fullName || "").toUpperCase())

  const leftContact = [p.email, p.phone].filter(Boolean).map((v) => escapeLatex(v as string)).join("\\\\")
  const rightContact = [p.address, data.dateLabel]
    .filter(Boolean)
    .map((v) => escapeLatex(v as string))
    .join("\\\\")

  const header = `\\begin{center}
{\\namefont\\LARGE ${name}}
\\end{center}
\\vspace{3pt}
\\hrule height 0.6pt
\\vspace{8pt}
\\noindent
\\begin{minipage}[t]{0.55\\textwidth}\\raggedright\\small ${leftContact}\\end{minipage}%
\\hfill
\\begin{minipage}[t]{0.4\\textwidth}\\raggedleft\\small ${rightContact}\\end{minipage}
\\vspace{16pt}`

  const subject =
    data.jobDetails.jobTitle || data.jobDetails.companyName
      ? `\\noindent\\textbf{RE:}\\ \\itshape Application for ${escapeLatex(
          data.jobDetails.jobTitle || "the position"
        )}${data.jobDetails.companyName ? ` at ${escapeLatex(data.jobDetails.companyName)}` : ""}\\upshape\\par\\vspace{12pt}`
      : ""

  const greeting = data.jobDetails.hiringManager && data.jobDetails.hiringManager.trim()
    ? `Dear ${escapeLatex(data.jobDetails.hiringManager)},`
    : "Dear Hiring Manager,"
  const salutation = `\\noindent ${greeting}\\par\\vspace{12pt}`

  const bodyBlocks = [data.content.opening, data.content.body, data.content.closing]
    .map((b) => paragraph(b))
    .filter(Boolean)
    .join("\n")

  const signature = `\\vspace{6pt}
\\noindent Sincerely,\\par\\vspace{2pt}
\\noindent ${escapeLatex(p.fullName || "")}`

  return `\\documentclass{article}
\\usepackage{fontspec}
\\setmainfont{texgyretermes-regular.otf}[
  BoldFont = texgyretermes-bold.otf,
  ItalicFont = texgyretermes-italic.otf,
  BoldItalicFont = texgyretermes-bolditalic.otf
]
\\newfontfamily\\namefont{texgyretermes-bold.otf}[LetterSpace=6.0]
\\usepackage[margin=1in]{geometry}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}
\\usepackage{microtype}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}
\\AtBeginDocument{\\fontsize{11pt}{15.5pt}\\selectfont}

\\begin{document}
${header}

${subject}${salutation}
${bodyBlocks}

${signature}
\\end{document}
`
}
