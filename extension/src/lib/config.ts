/** The app origin. Every API call and the login tab target this. */
export const APP_ORIGIN = "https://www.profyleai.com"

export const api = (path: string) => `${APP_ORIGIN}${path}`

/** Credit costs, mirrored from the app's `lib/types/credits.ts`. Shown on buttons. */
export const CREDIT_COSTS = {
  RESUME_TAILORING: 2,
  COVER_LETTER: 2,
} as const

declare const __DEV__: boolean

/** Quiet by default; noisy only in a watch build. Replaces the old emoji log spam. */
export const log = {
  debug: (...args: unknown[]) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) console.log("[Profyle]", ...args)
  },
  error: (...args: unknown[]) => console.error("[Profyle]", ...args),
}
