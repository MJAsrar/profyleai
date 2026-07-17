/**
 * LaTeX escaping. Every user-supplied string that lands in the .tex document must go through
 * `escapeLatex`, otherwise a stray `&`, `%`, `$`, `#`, `_`, `{`, `}`, `~`, `^`, or `\` breaks
 * the compile (or, worse, silently changes the output).
 */

// A placeholder standing in for the input's backslashes while we escape the other specials, so
// the braces in the `\textbackslash{}` we ultimately emit are not themselves re-escaped. It
// must be a character that never appears in real input; a NUL is safe.
const BACKSLASH_SENTINEL = String.fromCharCode(0)

/** Escape a single run of text for use in LaTeX. Collapses nothing; newlines are left as-is. */
export function escapeLatex(input: string | null | undefined): string {
  if (!input) return ""
  return input
    .replace(/\\/g, BACKSLASH_SENTINEL)
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(new RegExp(BACKSLASH_SENTINEL, "g"), "\\textbackslash{}")
}

/**
 * Escape multi-line text into LaTeX where blank lines become paragraph breaks and single
 * newlines become spaces. Suitable for free-text fields (summary, descriptions).
 */
export function escapeLatexParagraphs(input: string | null | undefined): string {
  if (!input) return ""
  return input
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((para) => escapeLatex(para.replace(/\n/g, " ").trim()))
    .filter((para) => para !== "")
    .join("\n\n")
}
