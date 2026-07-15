import type { Session } from "./types"

/**
 * Typed `chrome.storage.local` access. Everything the extension persists lives under these
 * keys — the session, the last known credit balance, and a short-lived résumé-list cache.
 */

const SESSION_KEY = "session"
const BALANCE_KEY = "creditBalance"
const RESUME_CACHE_KEY = "resumeCache"

const RESUME_CACHE_TTL_MS = 5 * 60 * 1000

export async function getSession(): Promise<Session | null> {
  const { [SESSION_KEY]: session } = await chrome.storage.local.get(SESSION_KEY)
  return (session as Session | undefined) ?? null
}

export async function setSession(session: Session): Promise<void> {
  await chrome.storage.local.set({ [SESSION_KEY]: session })
}

export async function clearSession(): Promise<void> {
  await chrome.storage.local.remove([SESSION_KEY, RESUME_CACHE_KEY])
}

export async function getBalance(): Promise<number | null> {
  const { [BALANCE_KEY]: balance } = await chrome.storage.local.get(BALANCE_KEY)
  return typeof balance === "number" ? balance : null
}

export async function setBalance(balance: number): Promise<void> {
  await chrome.storage.local.set({ [BALANCE_KEY]: balance })
}

interface ResumeCache<T> {
  at: number
  items: T
}

export async function getCachedResumes<T>(): Promise<T | null> {
  const { [RESUME_CACHE_KEY]: cache } = await chrome.storage.local.get(RESUME_CACHE_KEY)
  const typed = cache as ResumeCache<T> | undefined
  if (!typed) return null
  if (Date.now() - typed.at > RESUME_CACHE_TTL_MS) return null
  return typed.items
}

export async function setCachedResumes<T>(items: T): Promise<void> {
  await chrome.storage.local.set({
    [RESUME_CACHE_KEY]: { at: Date.now(), items } satisfies ResumeCache<T>,
  })
}
