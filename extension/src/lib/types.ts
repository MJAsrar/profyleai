/** The stored auth session. The token is the app's 64-hex opaque API token. */
export interface Session {
  token: string
  /** Real server expiry (epoch ms), taken from the endpoint — never invented locally. */
  expiresAt: number
  userId: string
  email: string
  name: string | null
}

/** What a content script hands back for a page. Sent to the app's LLM extractor. */
export interface PageContent {
  rawPageContent: string
  url: string
  source: JobSource
}

export type JobSource =
  | "linkedin"
  | "indeed"
  | "glassdoor"
  | "company-site"
  | "unknown"

/** The structured job, as returned by `POST /api/extract-job-data`. */
export interface JobData {
  title: string
  company: string
  description: string
  location?: string
  salary?: string
  jobType?: string
  requirements?: string[]
  benefits?: string[]
  url: string
  source: JobSource
  confidence: number
}

/** A résumé from `GET /api/resumes` (only the fields the popup needs). */
export interface ResumeSummary {
  id: string
  title: string
  updatedAt?: string
  template?: { id: string; name: string; category: string }
}

/** Personal info block off a single résumé (`GET /api/resumes/[id]`). */
export interface PersonalInfo {
  fullName?: string
  email?: string
  phone?: string
  location?: string
}

export interface TailorResult {
  tailoredResumeId: string
  matchScore: number | null
}

/** The app's insufficient-credits payload (402 from credit-wrapped routes). */
export interface InsufficientCredits {
  currentBalance: number
  requiredCredits: number
  shortfall: number
}

/**
 * The single result shape every API function returns. `kind` discriminates so callers
 * handle auth loss, rate limits and insufficient credits explicitly rather than guessing
 * from a raw status code.
 */
export type ApiResult<T> =
  | { kind: "ok"; data: T; balance?: number }
  | { kind: "unauthorized" }
  | { kind: "insufficient-credits"; info: InsufficientCredits }
  | { kind: "rate-limited" }
  | { kind: "not-a-job" }
  | { kind: "error"; message: string }
