import { api, log } from "./config"
import type {
  ApiResult,
  JobData,
  PageContent,
  PersonalInfo,
  ResumeSummary,
  TailorResult,
} from "./types"

/**
 * The API client. Every function is pure request → `ApiResult`: it never touches storage or
 * session state. The service worker owns the session and reacts to a `kind: "unauthorized"`
 * result by signing out — so there's exactly one place auth loss is handled, and no
 * component can wipe a token as a side effect (the bug that plagued the old build).
 */

const DEFAULT_TIMEOUT = 20_000

interface Ok {
  status: number
  json: any
  balance?: number
}

/** Control results shared by every endpoint; `null` means "carry on and read `Ok`". */
type Control =
  | { kind: "unauthorized" }
  | { kind: "rate-limited" }
  | { kind: "error"; message: string }

async function httpJson(
  token: string,
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT
): Promise<{ ok: Ok } | Control> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(api(path), {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    })
  } catch (err) {
    clearTimeout(timer)
    const aborted = err instanceof Error && err.name === "AbortError"
    return {
      kind: "error",
      message: aborted
        ? "That took too long. Check your connection and try again."
        : "Couldn't reach Profyle. Check your connection.",
    }
  }
  clearTimeout(timer)

  if (res.status === 401) return { kind: "unauthorized" }
  if (res.status === 429) return { kind: "rate-limited" }

  const balanceHeader = res.headers.get("X-Credit-Balance-Updated")
  const balance = balanceHeader != null ? Number(balanceHeader) : undefined

  let json: any = null
  try {
    json = await res.json()
  } catch {
    /* some errors have no body */
  }

  return { ok: { status: res.status, json, balance } }
}

function isControl(r: { ok: Ok } | Control): r is Control {
  return "kind" in r
}

/* --------------------------------------------------------------- résumés --- */

export async function listResumes(token: string): Promise<ApiResult<ResumeSummary[]>> {
  const r = await httpJson(token, "/api/resumes")
  if (isControl(r)) return r
  const { status, json } = r.ok
  if (status !== 200) return { kind: "error", message: json?.error ?? "Couldn't load your résumés." }

  const list = (json?.data ?? json?.resumes ?? []) as any[]
  const items: ResumeSummary[] = list.map((x) => ({
    id: x.id,
    title: x.title ?? "Untitled résumé",
    updatedAt: x.updatedAt,
    template: x.template,
  }))
  return { kind: "ok", data: items }
}

export async function getPersonalInfo(
  token: string,
  id: string
): Promise<ApiResult<PersonalInfo>> {
  const r = await httpJson(token, `/api/resumes/${id}`)
  if (isControl(r)) return r
  const { status, json } = r.ok
  if (status !== 200) return { kind: "error", message: json?.error ?? "Couldn't open that résumé." }

  const info = json?.resume?.personalInfo ?? {}
  return { kind: "ok", data: info as PersonalInfo }
}

/* -------------------------------------------------------------- tailoring --- */

export async function tailorResume(
  token: string,
  input: { jobTitle: string; jobDescription: string; companyName: string; baseResumeId: string }
): Promise<ApiResult<TailorResult>> {
  const r = await httpJson(
    token,
    "/api/resume-tailoring",
    { method: "POST", body: JSON.stringify(input) },
    45_000
  )
  if (isControl(r)) return r
  const { status, json, balance } = r.ok

  if (status === 402) {
    return {
      kind: "insufficient-credits",
      info: {
        currentBalance: json?.currentBalance ?? 0,
        requiredCredits: json?.requiredCredits ?? 0,
        shortfall: json?.shortfall ?? 0,
      },
    }
  }
  if (status !== 200 || !json?.tailoredResume?.id) {
    return { kind: "error", message: json?.error ?? "Tailoring didn't complete. You weren't charged." }
  }

  return {
    kind: "ok",
    balance,
    data: {
      tailoredResumeId: json.tailoredResume.id,
      matchScore: json?.tailoring?.matchScore ?? json?.tailoredResume?.matchScore ?? null,
    },
  }
}

/* ------------------------------------------------------------ job extract --- */

export async function extractJobData(
  token: string,
  page: PageContent
): Promise<ApiResult<JobData>> {
  const r = await httpJson(
    token,
    "/api/extract-job-data",
    { method: "POST", body: JSON.stringify({ rawPageContent: page.rawPageContent, url: page.url }) },
    30_000
  )
  if (isControl(r)) return r
  const { status, json } = r.ok

  if (status === 400 && json?.code === "NOT_A_JOB_POSTING") return { kind: "not-a-job" }
  if (status !== 200 || !json?.jobData) {
    return { kind: "error", message: json?.error ?? "Couldn't read the job from this page." }
  }
  return { kind: "ok", data: json.jobData as JobData }
}

/* ----------------------------------------------------------- cover letter --- */

export async function generateCoverLetter(
  token: string,
  input: {
    jobTitle: string
    companyName: string
    jobDescription: string
    personalInfo: { fullName: string; email: string; phone?: string; address?: string }
  }
): Promise<ApiResult<{ opening: string; body: string; closing: string }>> {
  const r = await httpJson(
    token,
    "/api/cover-letter-generation",
    { method: "POST", body: JSON.stringify({ ...input, tone: "professional" }) },
    45_000
  )
  if (isControl(r)) return r
  const { status, json, balance } = r.ok

  if (status === 402) {
    return {
      kind: "insufficient-credits",
      info: {
        currentBalance: json?.currentBalance ?? 0,
        requiredCredits: json?.requiredCredits ?? 0,
        shortfall: json?.shortfall ?? 0,
      },
    }
  }
  if (status !== 200 || !json?.data) {
    return { kind: "error", message: json?.error ?? "The letter didn't generate. You weren't charged." }
  }

  const d = json.data
  const body = Array.isArray(d.body) ? d.body.join("\n\n") : String(d.body ?? "")
  return {
    kind: "ok",
    balance,
    data: {
      opening: String(d.opening ?? "").trim() || "Dear Hiring Team,",
      body: body.trim() || "—",
      closing: String(d.closing ?? "").trim() || "Sincerely,",
    },
  }
}

/* --------------------------------------------------------------- PDF/blob --- */

/** POST a JSON body and expect a PDF back. Errors come back as JSON, so branch on type. */
async function httpPdf(
  token: string,
  path: string,
  body: unknown
): Promise<ApiResult<Blob>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 45_000)
  let res: Response
  try {
    res = await fetch(api(path), {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    clearTimeout(timer)
    return { kind: "error", message: "Couldn't reach Profyle to build the PDF." }
  }
  clearTimeout(timer)

  if (res.status === 401) return { kind: "unauthorized" }
  if (res.ok && res.headers.get("Content-Type")?.includes("pdf")) {
    return { kind: "ok", data: await res.blob() }
  }
  let message = "The PDF didn't generate."
  try {
    message = (await res.json())?.error ?? message
  } catch {
    /* ignore */
  }
  return { kind: "error", message }
}

export function downloadResumePdf(
  token: string,
  id: string,
  isTailored: boolean
): Promise<ApiResult<Blob>> {
  const path = isTailored
    ? `/api/tailored-resumes/${id}/download`
    : `/api/resumes/${id}/download`
  return httpPdf(token, path, {})
}

export function coverLetterPdf(
  token: string,
  body: {
    jobDetails: { jobTitle: string; companyName: string; jobDescription?: string }
    personalInfo: { fullName: string; email: string; phone?: string; address?: string }
    content: { opening: string; body: string; closing: string }
  }
): Promise<ApiResult<Blob>> {
  return httpPdf(token, "/api/cover-letter-pdf", { ...body, tone: "professional" })
}

/**
 * Save a PDF blob via `chrome.downloads`. Uses a FileReader data URL — `URL.createObjectURL`
 * is unavailable in an MV3 service worker, which is exactly why the old cover-letter download
 * (which used it) failed.
 */
export async function saveBlob(blob: Blob, filename: string): Promise<void> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
  await chrome.downloads.download({ url: dataUrl, filename, saveAs: false })
  log.debug("download saved:", filename)
}
