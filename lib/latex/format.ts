import type { ResumeData } from "@/lib/resume-store"
import { escapeLatex } from "./escape"

/**
 * Shared building blocks for the résumé templates: date formatting, links, and the small
 * predicates that decide whether a section has anything worth printing.
 *
 * These are primitives, not layout. Each template composes its own markup from them, which is
 * what lets the designs actually differ rather than being one template with different fonts.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "2024-03" -> "Mar 2024"; "2024" -> "2024"; "" -> "". Output is already escaped. */
export function formatDate(value?: string): string {
  if (!value) return ""
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{4})-(\d{2})$/)
  if (!match) return escapeLatex(trimmed)
  const [, year, month] = match
  const name = MONTHS[parseInt(month, 10) - 1]
  return escapeLatex(name ? `${name} ${year}` : year)
}

/** "Jun 2023 -- Present" style range. `dash` lets a template pick its own separator. */
export function dateRange(
  start?: string,
  end?: string,
  isCurrent?: boolean,
  dash = " -- "
): string {
  const from = formatDate(start)
  const to = isCurrent ? escapeLatex("Present") : formatDate(end)
  if (from && to) return `${from}${dash}${to}`
  return from || to || ""
}

/** Clickable link with an escaped label; only '#' and '%' actually break \href targets. */
export function link(url: string, label: string): string {
  const target = url.replace(/#/g, "\\#").replace(/%/g, "\\%")
  return `\\href{${target}}{${escapeLatex(label)}}`
}

/** Strip protocol and trailing slash for a compact display label. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

export function joinNonEmpty(parts: Array<string | undefined | null>, separator: string): string {
  return parts.filter((p): p is string => !!p && p.trim() !== "").join(separator)
}

/** Contact entries for the header, already escaped/linked, in a sensible order. */
export function contactBits(data: ResumeData): string[] {
  const p = data.personalInfo
  const bits: string[] = []
  if (p.location) bits.push(escapeLatex(p.location))
  if (p.phone) bits.push(escapeLatex(p.phone))
  if (p.email) bits.push(link(`mailto:${p.email}`, p.email))
  if (p.linkedin) bits.push(link(p.linkedin, displayUrl(p.linkedin)))
  if (p.github) bits.push(link(p.github, displayUrl(p.github)))
  if (p.website) bits.push(link(p.website, displayUrl(p.website)))
  if (p.portfolio) bits.push(link(p.portfolio, displayUrl(p.portfolio)))
  return bits
}

/** Non-empty skill names for a category. */
export function skillNames(category: ResumeData["skills"][number]): string[] {
  return (category.skills || []).map((s) => s.name).filter((n): n is string => !!n && n.trim() !== "")
}

/** Drop blank strings from a user-supplied list (achievements, highlights, honors...). */
export function cleanList(items?: string[]): string[] {
  return (items || []).map((i) => (i || "").trim()).filter(Boolean)
}

/** A tight itemize block. Returns "" when there's nothing to list. */
export function bullets(items: string[], itemSep: string, leftMargin = "1.25em"): string {
  const clean = cleanList(items)
  if (clean.length === 0) return ""
  const lines = clean.map((i) => `  \\item ${escapeLatex(i)}`).join("\n")
  return `\\begin{itemize}[leftmargin=${leftMargin}, itemsep=${itemSep}, topsep=2pt, parsep=0pt]\n${lines}\n\\end{itemize}`
}

/** Shared preamble bits every template wants. */
export function commonPreamble(accent: string): string {
  return `\\usepackage{xcolor}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{microtype}
\\definecolor{accent}{HTML}{${accent}}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}
\\raggedbottom
\\raggedright`
}

/** fontspec font-family selection by FILENAME (family-name lookup needs fontconfig; see README). */
export function fontFamily(regular: string, bold: string, italic: string, boldItalic?: string): string {
  const extras = boldItalic ? `,\n  BoldItalicFont = ${boldItalic}` : ""
  return `\\usepackage{fontspec}
\\setmainfont{${regular}}[
  BoldFont = ${bold},
  ItalicFont = ${italic}${extras}
]`
}
