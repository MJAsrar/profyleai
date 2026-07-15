import { api, APP_ORIGIN, log } from "./config"
import { clearSession, getSession, setBalance, setSession } from "./storage"
import type { ApiResult, Session } from "./types"

/**
 * Auth, website-login only.
 *
 * The extension never handles a password (works identically for Google and email users).
 * The one source of truth is the server Bearer token and its real `expiresAt`. Everything
 * the old build did to fake this — a local 30-day expiry that auto-extended, a
 * cookie-vs-token logout check, a `sessionToken` validation POST that the current API
 * rejects — is gone. The result: no spurious logouts, no `Bearer undefined`.
 */

const POLL_INTERVAL_MS = 2000
const POLL_DEADLINE_MS = 90_000

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type SessionCheck =
  | { state: "anon" }
  | { state: "minted"; token: string; expiresAt: string; user: RawUser }
  | { state: "has-token-no-raw" }
  | { state: "error" }

interface RawUser {
  id: string
  email: string
  name: string | null
}

/** Ask the app who we are, using the browser's website cookie (no Bearer here). */
async function checkSession(): Promise<SessionCheck> {
  let res: Response
  try {
    res = await fetch(api("/api/auth/session"), { credentials: "include" })
  } catch {
    return { state: "error" }
  }

  if (res.status === 401) return { state: "anon" }
  if (!res.ok) return { state: "error" }

  const json = await res.json().catch(() => null)
  if (!json?.success || !json.user) return { state: "error" }

  if (typeof json.token === "string" && json.token.length >= 40) {
    return { state: "minted", token: json.token, expiresAt: json.expiresAt, user: json.user }
  }
  // Logged in, but the server already holds a valid token it won't re-hand-out.
  return { state: "has-token-no-raw" }
}

/** Clear the server-side token hash (via the cookie) so the next session check re-mints. */
async function forceRemint(): Promise<void> {
  try {
    await fetch(api("/api/auth/extension-logout"), { method: "POST", credentials: "include" })
  } catch {
    /* best effort */
  }
}

function persist(token: string, expiresAt: string, user: RawUser): Promise<void> {
  const session: Session = {
    token,
    expiresAt: Date.parse(expiresAt) || Date.now() + 30 * 24 * 60 * 60 * 1000,
    userId: user.id,
    email: user.email,
    name: user.name,
  }
  return setSession(session)
}

/**
 * Open the website login and wait for the user to sign in (any method), then obtain a token.
 * If a valid server token already exists that we can't read, force a re-mint once.
 */
export async function signIn(): Promise<{ ok: boolean; error?: string }> {
  await chrome.tabs.create({ url: `${APP_ORIGIN}/login?extension=true` })

  const deadline = Date.now() + POLL_DEADLINE_MS
  let triedRemint = false

  while (Date.now() < deadline) {
    const check = await checkSession()

    if (check.state === "minted") {
      await persist(check.token, check.expiresAt, check.user)
      log.debug("signed in as", check.user.email)
      return { ok: true }
    }

    if (check.state === "has-token-no-raw" && !triedRemint) {
      triedRemint = true
      await forceRemint()
      continue // re-check immediately; the next mint should return a raw token
    }

    await sleep(POLL_INTERVAL_MS)
  }

  return { ok: false, error: "We didn't detect a login. Try again once you're signed in." }
}

export async function signOut(): Promise<void> {
  const session = await getSession()
  if (session) {
    try {
      await fetch(api("/api/auth/extension-logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      })
    } catch {
      /* revoke is best-effort; we clear locally regardless */
    }
  }
  await clearSession()
}

/**
 * Run an authenticated API call. Retrieves the token, refuses early if it's missing or
 * locally expired, and — crucially — signs the user out if (and only if) the server itself
 * returns 401. Also caches any credit balance the call reported.
 */
export async function runAuthed<T>(
  fn: (token: string) => Promise<ApiResult<T>>
): Promise<ApiResult<T>> {
  const session = await getSession()
  if (!session || Date.now() > session.expiresAt) {
    if (session) await clearSession()
    return { kind: "unauthorized" }
  }

  const result = await fn(session.token)

  if (result.kind === "unauthorized") {
    await clearSession()
  } else if (result.kind === "ok" && typeof result.balance === "number") {
    await setBalance(result.balance)
  }

  return result
}
