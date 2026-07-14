import { CREDIT_COSTS } from "@/lib/types/credits"

/**
 * The journey — one job description flowing through every tool.
 *
 * This is the connective tissue the product was missing. Every AI surface shows the
 * same job-context strip and stepper, and the dashboard's "continue where you left
 * off" module routes to whatever comes next. All of it derives from here, so the
 * steps can't drift out of sync between screens.
 */

export const JOURNEY_STEPS = [
  {
    key: "resume",
    label: "Résumé",
    shortLabel: "Résumé",
    href: "/dashboard/resume-builder",
    cost: 0,
    cta: "Build your résumé",
    blurb: "Start with a résumé we can tailor.",
  },
  {
    key: "tailored",
    label: "Tailored",
    shortLabel: "Tailored",
    href: "/dashboard/resume-tailoring",
    cost: CREDIT_COSTS.RESUME_TAILORING,
    cta: "Tailor it to this job",
    blurb: "Rewrite your résumé for this specific role.",
  },
  {
    key: "coverLetter",
    label: "Cover letter",
    shortLabel: "Cover",
    href: "/dashboard/cover-letter",
    cost: CREDIT_COSTS.COVER_LETTER,
    cta: "Write cover letter",
    blurb: "A letter that cites your real achievements.",
  },
  {
    key: "interviewPrep",
    label: "Interview",
    shortLabel: "Interview",
    href: "/dashboard/interview",
    cost: CREDIT_COSTS.TEXT_INTERVIEW,
    cta: "Prep for the interview",
    blurb: "Practise the questions they'll actually ask.",
  },
  {
    key: "voice",
    label: "Voice",
    shortLabel: "Voice",
    href: "/dashboard/video-interview",
    cost: CREDIT_COSTS.VIDEO_INTERVIEW,
    cta: "Run a live mock interview",
    blurb: "Speak it out loud with an AI interviewer.",
  },
] as const

export type JourneyStepKey = (typeof JOURNEY_STEPS)[number]["key"]
export type JourneyStep = (typeof JOURNEY_STEPS)[number]

export interface TargetJobSummary {
  id: string
  role: string
  company: string
  description?: string | null
  requirements: string[]
  baseResumeId?: string | null
  tailoredResumeId?: string | null
  coverLetterId?: string | null
  interviewPrepId?: string | null
  videoInterviewId?: string | null
}

/** Which artifact id proves each step is done. */
const STEP_ARTIFACT: Record<JourneyStepKey, keyof TargetJobSummary> = {
  resume: "baseResumeId",
  tailored: "tailoredResumeId",
  coverLetter: "coverLetterId",
  interviewPrep: "interviewPrepId",
  voice: "videoInterviewId",
}

export type JourneyProgress = Record<JourneyStepKey, boolean>

/**
 * Progress is derived from real artifacts, never from a stored flag — so the
 * stepper cannot claim a step is complete when nothing was produced.
 */
export function getJourneyProgress(job: TargetJobSummary | null): JourneyProgress {
  const progress = {} as JourneyProgress

  for (const step of JOURNEY_STEPS) {
    const artifactKey = STEP_ARTIFACT[step.key]
    progress[step.key] = Boolean(job?.[artifactKey])
  }

  return progress
}

/** The first incomplete step — what "Continue" should do. */
export function getNextStep(job: TargetJobSummary | null): JourneyStep {
  const progress = getJourneyProgress(job)
  return JOURNEY_STEPS.find((step) => !progress[step.key]) ?? JOURNEY_STEPS[0]
}

/** How far along the journey the user is, 0–1. Used for the mini progress rail. */
export function getJourneyCompletion(job: TargetJobSummary | null): number {
  const progress = getJourneyProgress(job)
  const done = JOURNEY_STEPS.filter((step) => progress[step.key]).length
  return done / JOURNEY_STEPS.length
}

/** True once every step has produced something. */
export function isJourneyComplete(job: TargetJobSummary | null): boolean {
  return getJourneyCompletion(job) === 1
}
