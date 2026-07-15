import type { ApiResult, JobData, ResumeSummary, TailorResult } from "./types"

/** Public (non-secret) view of auth state the popup is allowed to see. */
export interface AuthState {
  signedIn: boolean
  email: string | null
  balance: number | null
}

/**
 * Messages from the popup to the service worker. Each carries its own response type so the
 * popup and worker can't drift out of sync.
 */
export type PopupRequest =
  | { type: "GET_STATE" }
  | { type: "SIGN_IN" }
  | { type: "SIGN_OUT" }
  | { type: "GET_JOB" }
  | { type: "LIST_RESUMES" }
  | { type: "TAILOR"; baseResumeId: string; job: JobData }
  | { type: "COVER_LETTER"; baseResumeId: string; job: JobData }

export interface PopupResponses {
  GET_STATE: AuthState
  SIGN_IN: { ok: boolean; error?: string }
  SIGN_OUT: { ok: true }
  GET_JOB: ApiResult<JobData>
  LIST_RESUMES: ApiResult<ResumeSummary[]>
  TAILOR: ApiResult<TailorResult>
  COVER_LETTER: ApiResult<{ downloaded: true }>
}

/** Typed send from the popup to the worker. */
export function sendToWorker<T extends PopupRequest["type"]>(
  message: Extract<PopupRequest, { type: T }>
): Promise<PopupResponses[T]> {
  return chrome.runtime.sendMessage(message) as Promise<PopupResponses[T]>
}
