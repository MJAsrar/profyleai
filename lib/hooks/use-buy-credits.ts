"use client"

import { useSyncExternalStore } from "react"
import type { CreditPackageId } from "@/lib/types/credits"

/**
 * A tiny shared controller for the "buy credits" modal.
 *
 * Every "Buy credits" / "Buy more" / credit-chip surface across the dashboard calls
 * `openBuyCredits()`, and a single `<BuyCreditsHost/>` mounted in the dashboard layout
 * renders one purchase modal. Previously these surfaces just linked to /pricing, whose
 * pack buttons linked to /signup — so a logged-in user could never actually reach checkout
 * except from Settings.
 */

interface BuyCreditsState {
  isOpen: boolean
  suggested?: CreditPackageId
}

let state: BuyCreditsState = { isOpen: false }
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export function openBuyCredits(suggested?: CreditPackageId) {
  state = { isOpen: true, suggested }
  emit()
}

export function closeBuyCredits() {
  state = { isOpen: false }
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

const serverState: BuyCreditsState = { isOpen: false }

export function useBuyCredits(): BuyCreditsState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState
  )
}
