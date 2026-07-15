"use client"

import { useSyncExternalStore } from "react"

/**
 * Lets a focused page (the résumé builder's editing view) hide the main app sidebar so it
 * can use the full width, then restore it on the way out. A shared flag rather than a
 * layout-per-route so the page decides *when* — the builder keeps the sidebar on its
 * selection/template screens and only hides it once you're editing the résumé itself.
 */

let hideSidebar = false
const listeners = new Set<() => void>()

export function setHideSidebar(value: boolean) {
  if (hideSidebar === value) return
  hideSidebar = value
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useHideSidebar(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hideSidebar,
    () => false
  )
}
