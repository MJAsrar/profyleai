import type { PageContent } from "./types"

/**
 * Extract the job text from the current page, injected via `chrome.scripting.executeScript`.
 * Must be FULLY self-contained (serialised into the page): no imports, no module-scope refs.
 *
 * On a two-pane LinkedIn search page, `main` begins with the filter bar and job list, so the
 * model reads it as a search page, not one posting. LinkedIn's classes are all hashed, so we
 * can't select the detail pane by class — but it keeps section headings as real text. So the
 * primary strategy anchors on a section heading ("About the job") and walks up to the largest
 * container under a size cap: that's the selected job's detail pane. `main`/body are
 * fallbacks for boards where the whole main region is already just the job.
 */
export function extractInPage(): PageContent {
  const MAX = 12_000
  const ANCESTOR_CAP = 13_000

  const clean = (t: string): string =>
    (t ?? "")
      .replace(/\s+/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
      .slice(0, MAX)

  const norm = (t: string): string => (t ?? "").replace(/\s+/g, " ").trim().toLowerCase()

  const url = location.href
  const u = url.toLowerCase()
  const source: PageContent["source"] = u.includes("linkedin.com")
    ? "linkedin"
    : u.includes("indeed.com")
      ? "indeed"
      : u.includes("glassdoor.com")
        ? "glassdoor"
        : "company-site"

  // 1) Section-heading anchor. TIGHT set — only unambiguous job-section labels, so we never
  //    latch onto a stray word in a list card or filter.
  const LABELS = new Set([
    "about the job",
    "job description",
    "about this role",
    "about this job",
    "job summary",
    "position summary",
  ])

  const anchor = Array.from(document.querySelectorAll("h1,h2,h3,h4,span,strong,div,dt")).find(
    (el) => {
      const t = norm(el.textContent ?? "")
      return t.length <= 30 && LABELS.has(t)
    }
  )

  if (anchor) {
    let best: Element = anchor
    let node: Element | null = anchor
    for (let i = 0; i < 12; i++) {
      node = node.parentElement
      if (!node) break
      if (clean(node.textContent ?? "").length > ANCESTOR_CAP) break
      best = node
    }
    const text = clean(best.textContent ?? "")
    if (text.length >= 300) return { rawPageContent: text, url, source }
  }

  // 2) Readable-class containers + the main region.
  const trySelectors = (selectors: string[], minLen: number): string => {
    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (!el) continue
      const text = clean(el.textContent ?? "")
      if (text.length >= minLen) return text
    }
    return ""
  }

  let text = ""
  if (source === "indeed") {
    text = trySelectors(["#jobDescriptionText", ".jobsearch-JobComponent"], 150)
  } else if (source === "glassdoor") {
    text = trySelectors(['[data-test="jobDescriptionContainer"]', ".jobDescriptionContent"], 150)
  }
  if (!text) text = trySelectors(["main", '[role="main"]', ".main-content", "#main", "article"], 150)

  // 3) Whole-body last resort.
  if (!text) {
    const body = document.body?.cloneNode(true) as HTMLElement | undefined
    if (body) {
      body.querySelectorAll("script, style, noscript").forEach((n) => n.remove())
      text = clean(body.textContent ?? "")
    }
  }

  return { rawPageContent: text, url, source }
}
