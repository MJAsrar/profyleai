import {
  coverLetterPdf,
  downloadResumePdf,
  extractJobData,
  generateCoverLetter,
  getPersonalInfo,
  listResumes,
  saveBlob,
  tailorResume,
} from "../lib/api"
import { runAuthed, signIn, signOut } from "../lib/auth"
import { log } from "../lib/config"
import { extractInPage } from "../lib/inpage"
import type { AuthState, PopupRequest, PopupResponses } from "../lib/messaging"
import { getBalance, getCachedResumes, getSession, setCachedResumes } from "../lib/storage"
import type { ApiResult, JobData, PageContent, ResumeSummary } from "../lib/types"

/** Only one interactive sign-in at a time, no matter how many popups ask. */
let signInFlight: Promise<{ ok: boolean; error?: string }> | null = null

function safe(part: string): string {
  return (part || "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60)
}

async function getState(): Promise<AuthState> {
  const session = await getSession()
  return {
    signedIn: !!session,
    email: session?.email ?? null,
    balance: await getBalance(),
  }
}

/**
 * Read the job text off the active tab by injecting the extractor on demand, then run it
 * through the app's extractor. On-demand injection (via the activeTab grant from opening the
 * popup) is what makes this work on SPA job boards like LinkedIn — where a declared content
 * script would never be injected if you reached the job without a full page load.
 */
async function getJob(): Promise<ApiResult<JobData>> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return { kind: "error", message: "No active tab." }

  let page: PageContent | undefined
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractInPage,
    })
    page = injection?.result as PageContent | undefined
  } catch (err) {
    // chrome:// pages, the Web Store, PDFs, etc. can't be scripted.
    log.debug("injection failed:", err)
    return { kind: "not-a-job" }
  }

  if (!page || page.rawPageContent.length < 80) {
    log.debug("too little page content:", page?.rawPageContent.length ?? 0)
    return { kind: "not-a-job" }
  }

  const content = page
  const result = await runAuthed((token) => extractJobData(token, content))

  // A genuine "not a job" (the model looked and said no) — usually a list/search view.
  if (result.kind === "not-a-job") {
    return {
      kind: "error",
      message:
        "Couldn't read a single job here. Open the job in its own view (a URL like linkedin.com/jobs/view/…) and try again.",
    }
  }
  return result
}

async function getResumes(): Promise<ApiResult<ResumeSummary[]>> {
  const cached = await getCachedResumes<ResumeSummary[]>()
  if (cached) return { kind: "ok", data: cached }

  const result = await runAuthed(listResumes)
  if (result.kind === "ok") await setCachedResumes(result.data)
  return result
}

async function tailorAndDownload(
  baseResumeId: string,
  job: JobData
): Promise<ApiResult<{ tailoredResumeId: string; matchScore: number | null }>> {
  return runAuthed(async (token) => {
    const tailored = await tailorResume(token, {
      jobTitle: job.title,
      companyName: job.company,
      jobDescription: job.description,
      baseResumeId,
    })
    if (tailored.kind !== "ok") return tailored

    const pdf = await downloadResumePdf(token, tailored.data.tailoredResumeId, true)
    if (pdf.kind !== "ok") {
      // Tailoring itself succeeded and is saved online; only the file didn't come through.
      return pdf.kind === "unauthorized"
        ? pdf
        : {
            kind: "error",
            message: "Your résumé was tailored and saved — the download didn't start. Open it on Profyle.",
          }
    }

    await saveBlob(pdf.data, `${safe(job.company)}_${safe(job.title)}_Resume.pdf`)
    return { kind: "ok", data: tailored.data, balance: tailored.balance }
  })
}

async function coverLetterAndDownload(
  baseResumeId: string,
  job: JobData
): Promise<ApiResult<{ downloaded: true }>> {
  return runAuthed(async (token) => {
    const info = await getPersonalInfo(token, baseResumeId)
    if (info.kind !== "ok") return info
    if (!info.data.fullName || !info.data.email) {
      return {
        kind: "error",
        message: "That résumé is missing your name or email. Add them on Profyle first.",
      }
    }

    const personalInfo = {
      fullName: info.data.fullName,
      email: info.data.email,
      phone: info.data.phone ?? "",
      address: info.data.location ?? "",
    }

    const letter = await generateCoverLetter(token, {
      jobTitle: job.title,
      companyName: job.company,
      jobDescription: job.description,
      personalInfo,
    })
    if (letter.kind !== "ok") return letter

    const pdf = await coverLetterPdf(token, {
      jobDetails: { jobTitle: job.title, companyName: job.company, jobDescription: job.description },
      personalInfo,
      content: letter.data,
    })
    if (pdf.kind !== "ok") {
      return pdf.kind === "unauthorized"
        ? pdf
        : { kind: "error", message: "The letter was written but the PDF didn't build. Try again." }
    }

    await saveBlob(pdf.data, `${safe(personalInfo.fullName)}_Cover_Letter_${safe(job.company)}.pdf`)
    return { kind: "ok", data: { downloaded: true }, balance: letter.balance }
  })
}

async function handle<T extends PopupRequest["type"]>(
  message: PopupRequest
): Promise<PopupResponses[T]> {
  switch (message.type) {
    case "GET_STATE":
      return (await getState()) as PopupResponses[T]
    case "SIGN_IN": {
      if (!signInFlight) signInFlight = signIn().finally(() => (signInFlight = null))
      return (await signInFlight) as PopupResponses[T]
    }
    case "SIGN_OUT":
      await signOut()
      return { ok: true } as PopupResponses[T]
    case "GET_JOB":
      return (await getJob()) as PopupResponses[T]
    case "LIST_RESUMES":
      return (await getResumes()) as PopupResponses[T]
    case "TAILOR":
      return (await tailorAndDownload(message.baseResumeId, message.job)) as PopupResponses[T]
    case "COVER_LETTER":
      return (await coverLetterAndDownload(message.baseResumeId, message.job)) as PopupResponses[T]
  }
}

chrome.runtime.onMessage.addListener((message: PopupRequest, _sender, sendResponse) => {
  handle(message)
    .then(sendResponse)
    .catch((err) => {
      log.error("handler failed:", err)
      sendResponse({ kind: "error", message: "Something went wrong. Try again." })
    })
  return true // async response
})

log.debug("service worker ready")
