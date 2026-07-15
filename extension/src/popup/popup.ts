import { APP_ORIGIN, CREDIT_COSTS } from "../lib/config"
import type { AuthState } from "../lib/messaging"
import { sendToWorker } from "../lib/messaging"
import type { InsufficientCredits, JobData, ResumeSummary } from "../lib/types"

/**
 * The popup. Plain DOM (no framework). Dynamic values from the API — job titles, company
 * names — are always set via textContent, never innerHTML, so nothing a job board or the
 * model returns can inject markup.
 */

const root = document.getElementById("root") as HTMLElement

let job: JobData | null = null
let resumes: ResumeSummary[] = []
let selectedResumeId = ""

/* ---------------------------------------------------------------- helpers --- */

type Attrs = Record<string, string | ((e: Event) => void) | undefined>

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue
    if (k === "class") node.className = v as string
    else if (k === "text") node.textContent = v as string
    else if (k === "onclick") node.addEventListener("click", v as (e: Event) => void)
    else node.setAttribute(k, v as string)
  }
  for (const c of children) node.append(c)
  return node
}

function openTab(path: string) {
  chrome.tabs.create({ url: `${APP_ORIGIN}${path}` })
}

function clear() {
  root.replaceChildren()
}

function header(state: AuthState): HTMLElement {
  const right = state.signedIn
    ? [
        state.balance != null
          ? el("span", { class: "chip-credits", text: `◇ ${state.balance}` })
          : "",
        el("button", {
          class: "signout",
          text: "Sign out",
          onclick: async () => {
            await sendToWorker({ type: "SIGN_OUT" })
            boot()
          },
        }),
      ]
    : []

  return el(
    "div",
    { class: "header" },
    el(
      "div",
      { class: "brand" },
      el("span", { class: "mark", text: "P" }),
      el("span", {}, "Profyle", el("span", { class: "mark-accent", text: "AI" }))
    ),
    el("div", { style: "display:flex;align-items:center;gap:10px" }, ...right.filter(Boolean))
  )
}

/* ------------------------------------------------------------------ views --- */

function boot() {
  clear()
  root.append(el("div", { class: "body center" }, el("div", { class: "spinner" })))
  sendToWorker({ type: "GET_STATE" }).then((state) => {
    if (state.signedIn) renderSignedIn(state)
    else renderSignedOut()
  })
}

function renderSignedOut(message?: string) {
  clear()
  root.append(
    header({ signedIn: false, email: null, balance: null }),
    el(
      "div",
      { class: "body" },
      el("p", { class: "eyebrow", text: "For your job hunt" }),
      el("h1", { class: "title-serif" }, "Tailor your résumé to the job you're viewing."),
      el("p", {
        class: "muted",
        text:
          message ??
          "Sign in and Profyle will match your résumé to the posting on this page, then download it.",
      }),
      el("button", {
        class: "btn btn-primary",
        text: "Sign in to Profyle",
        onclick: onSignIn,
      }),
      el("p", { class: "foot", text: "Opens the Profyle login in a new tab." })
    )
  )
}

async function onSignIn(e?: Event) {
  const btn = e?.currentTarget as HTMLButtonElement | undefined
  if (btn) {
    btn.disabled = true
    btn.textContent = "Waiting for you to log in…"
  }
  const res = await sendToWorker({ type: "SIGN_IN" })
  if (res.ok) boot()
  else renderSignedOut(res.error ?? "Sign-in didn't complete. Try again.")
}

function renderSignedIn(state: AuthState) {
  clear()
  const main = el("div", { class: "body" }, el("div", { class: "center" }, el("div", { class: "spinner" })))
  root.append(header(state), main)

  // Job detection and the résumé list load in parallel.
  Promise.all([sendToWorker({ type: "GET_JOB" }), sendToWorker({ type: "LIST_RESUMES" })]).then(
    ([jobRes, resumeRes]) => {
      if (jobRes.kind === "unauthorized" || resumeRes.kind === "unauthorized") {
        renderSignedOut("Your session expired — please sign in again.")
        return
      }

      if (resumeRes.kind === "ok") resumes = resumeRes.data

      if (jobRes.kind === "ok") {
        job = jobRes.data
        renderJobView(main)
      } else if (jobRes.kind === "not-a-job") {
        renderNoJob(main)
      } else if (jobRes.kind === "rate-limited") {
        renderMain(main, notice("error", "You've done that a lot just now — wait a moment and reopen."))
      } else {
        const msg = jobRes.kind === "error" ? jobRes.message : "Couldn't read the job on this page."
        renderMain(main, notice("error", msg))
      }
    }
  )
}

function renderNoJob(main: HTMLElement) {
  renderMain(
    main,
    el("p", { class: "eyebrow", text: "No job on this page" }),
    el("h1", { class: "title-serif" }, "Open a job posting to tailor your résumé."),
    el("p", {
      class: "muted",
      text: "Go to a job on LinkedIn, Indeed, or any supported board, then reopen this.",
    })
  )
}

function renderJobView(main: HTMLElement) {
  if (!job) return

  if (resumes.length === 0) {
    renderMain(
      main,
      jobCard(job),
      notice(
        "error",
        "You don't have a résumé yet. Build one on Profyle, then come back to tailor it."
      ),
      el("button", { class: "btn btn-ghost", text: "Build a résumé", onclick: () => openTab("/dashboard/resume-builder") })
    )
    return
  }

  if (!selectedResumeId) selectedResumeId = resumes[0].id

  const select = el("select") as HTMLSelectElement
  for (const r of resumes) {
    const opt = el("option", { value: r.id, text: r.title })
    if (r.id === selectedResumeId) opt.selected = true
    select.append(opt)
  }
  select.addEventListener("change", () => (selectedResumeId = select.value))

  const actions = el("div", { style: "display:flex;flex-direction:column;gap:10px" })
  const tailorBtn = el(
    "button",
    { class: "btn btn-primary", onclick: () => onTailor(main) },
    "Tailor & download",
    el("span", { class: "cost", text: `${CREDIT_COSTS.RESUME_TAILORING} credits` })
  )
  const coverBtn = el(
    "button",
    { class: "btn btn-ghost", onclick: () => onCover(main) },
    "Cover letter",
    el("span", { class: "cost", text: `${CREDIT_COSTS.COVER_LETTER} credits` })
  )
  actions.append(tailorBtn, coverBtn)

  renderMain(
    main,
    jobCard(job),
    el("div", {}, el("label", { class: "field-label", text: "Base résumé" }), select),
    actions,
    el("div", { class: "result" })
  )
}

function jobCard(j: JobData): HTMLElement {
  const reqs = (j.requirements ?? []).slice(0, 4)
  return el(
    "div",
    { class: "card job-card" },
    el("p", { class: "eyebrow", text: "Job on this page" }),
    el("p", { class: "role", text: j.title || "This role" }),
    el("p", { class: "company", text: j.company || "" }),
    reqs.length
      ? el("div", { class: "reqs" }, ...reqs.map((r) => el("span", { class: "req", text: r })))
      : ""
  )
}

/* ---------------------------------------------------------------- actions --- */

async function onTailor(main: HTMLElement) {
  if (!job) return
  const resultBox = main.querySelector(".result") as HTMLElement
  setBusy(main, true)
  resultBox.replaceChildren(progress("Tailoring your résumé and preparing the download…"))

  const res = await sendToWorker({ type: "TAILOR", baseResumeId: selectedResumeId, job })
  setBusy(main, false)

  if (res.kind === "ok") {
    resultBox.replaceChildren(matchRing(res.data.matchScore), downloaded("Résumé downloaded."))
    refreshBalance()
  } else {
    handleFailure(res, resultBox)
  }
}

async function onCover(main: HTMLElement) {
  if (!job) return
  const resultBox = main.querySelector(".result") as HTMLElement
  setBusy(main, true)
  resultBox.replaceChildren(progress("Writing your cover letter and preparing the download…"))

  const res = await sendToWorker({ type: "COVER_LETTER", baseResumeId: selectedResumeId, job })
  setBusy(main, false)

  if (res.kind === "ok") {
    resultBox.replaceChildren(downloaded("Cover letter downloaded."))
    refreshBalance()
  } else {
    handleFailure(res, resultBox)
  }
}

function handleFailure(
  res: { kind: "unauthorized" } | { kind: "insufficient-credits"; info: InsufficientCredits } | { kind: "rate-limited" } | { kind: "not-a-job" } | { kind: "error"; message: string },
  box: HTMLElement
) {
  if (res.kind === "unauthorized") {
    renderSignedOut("Your session expired — please sign in again.")
  } else if (res.kind === "insufficient-credits") {
    box.replaceChildren(insufficient(res.info))
  } else if (res.kind === "rate-limited") {
    box.replaceChildren(notice("error", "Too many requests just now — wait a moment and try again."))
  } else if (res.kind === "not-a-job") {
    box.replaceChildren(notice("error", "Couldn't read this job. Reopen the posting and try again."))
  } else {
    box.replaceChildren(notice("error", res.message))
  }
}

/* -------------------------------------------------------------- fragments --- */

function renderMain(main: HTMLElement, ...children: (Node | string)[]) {
  main.replaceChildren(...children.filter(Boolean) as (Node | string)[])
}

function notice(kind: "error" | "credits", text: string): HTMLElement {
  return el("div", { class: `notice notice-${kind === "error" ? "error" : "credits"}`, text })
}

function progress(text: string): HTMLElement {
  return el("div", { class: "center" }, el("div", { class: "spinner" }), el("p", { class: "muted", text }))
}

function downloaded(text: string): HTMLElement {
  return el("p", { class: "muted", style: "margin-top:10px", text: `✓ ${text}` })
}

function matchRing(score: number | null): HTMLElement {
  const s = score == null ? null : Math.max(0, Math.min(100, Math.round(score)))
  const color = s == null ? "var(--ink-faint-2)" : s >= 80 ? "var(--brand)" : s >= 60 ? "var(--clay)" : "var(--danger)"
  const verdict = s == null ? "Tailored" : s >= 80 ? "Strong match" : s >= 60 ? "Decent match" : "Needs work"

  const ring = el("div", { class: "ring", style: `background:conic-gradient(${color} ${(s ?? 0) * 3.6}deg, var(--brand-tint) 0)` })
  ring.append(el("span", { text: s == null ? "—" : `${s}%` }))

  return el(
    "div",
    { class: "match" },
    ring,
    el(
      "div",
      {},
      el("p", { class: `verdict ${s != null && s >= 80 ? "good" : "ok"}`, text: verdict }),
      el("p", { class: "muted", text: "Saved as a new version on Profyle." })
    )
  )
}

function insufficient(info: InsufficientCredits): HTMLElement {
  const box = el(
    "div",
    { class: "notice notice-credits" },
    el("div", {
      text: `You're ${info.shortfall} credit${info.shortfall === 1 ? "" : "s"} short — this needs ${info.requiredCredits} and you have ${info.currentBalance}.`,
    }),
    el("button", { class: "btn btn-primary", text: "Buy credits", onclick: () => openTab("/pricing") })
  )
  return box
}

function setBusy(main: HTMLElement, busy: boolean) {
  main.querySelectorAll("button, select").forEach((n) => {
    ;(n as HTMLButtonElement).disabled = busy
  })
}

async function refreshBalance() {
  const state = await sendToWorker({ type: "GET_STATE" })
  const chip = root.querySelector(".chip-credits")
  if (chip && state.balance != null) chip.textContent = `◇ ${state.balance}`
  else if (!chip && state.balance != null) {
    // header had no chip yet (balance unknown at open) — rebuild the header.
    const old = root.querySelector(".header")
    if (old) old.replaceWith(header(state))
  }
}

boot()
