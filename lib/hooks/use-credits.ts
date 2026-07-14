"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

/**
 * The user's credit balance.
 *
 * Backed by a tiny module-level store so every mounted display (sidebar card, top-bar
 * chip, dashboard stat…) shares ONE fetch and ONE poll, rather than each firing its
 * own request. It also means a spend anywhere updates every display at once.
 *
 * The old flow only refreshed on a 30-second poll — the "real-time" refresh path was
 * dead code that nothing imported — so the balance could visibly lag a spend the user
 * had just made.
 */

type State = {
  balance: number | null
  isLoading: boolean
  error: string | null
}

let state: State = { balance: null, isLoading: true, error: null }
const listeners = new Set<() => void>()

let inFlight: Promise<void> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

function emit() {
  for (const listener of listeners) listener()
}

function setState(next: Partial<State>) {
  state = { ...state, ...next }
  emit()
}

/** Fetch the balance. Concurrent callers share the same request. */
export function refreshCredits(): Promise<void> {
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const res = await fetch("/api/credits/balance")

      if (res.status === 401) {
        setState({ balance: null, isLoading: false, error: null })
        return
      }
      if (!res.ok) throw new Error("Failed to load credits")

      const body = await res.json()
      setState({
        balance: body?.data?.currentBalance ?? 0,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load credits",
      })
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

/** Call after any action that changes the balance — every display updates at once. */
export function notifyCreditsChanged() {
  void refreshCredits()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  // First subscriber starts the shared fetch + poll.
  if (listeners.size === 1) {
    void refreshCredits()
    pollTimer = setInterval(() => void refreshCredits(), 60_000)
  }

  return () => {
    listeners.delete(listener)

    // Last one out stops the poll.
    if (listeners.size === 0 && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }
}

const getSnapshot = () => state
const getServerSnapshot = (): State => ({ balance: null, isLoading: true, error: null })

export function useCredits() {
  const shared = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const refresh = useCallback(() => refreshCredits(), [])

  return { ...shared, refresh }
}

/**
 * Kept for surfaces that want to react to a balance change without rendering it.
 */
export function useOnCreditsChanged(handler: () => void) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  useEffect(() => {
    if (!ready) return
    listeners.add(handler)
    return () => {
      listeners.delete(handler)
    }
  }, [handler, ready])
}
