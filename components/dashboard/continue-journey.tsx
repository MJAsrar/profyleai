"use client"

import Link from "next/link"
import { Button, CreditCost } from "@/components/ui/button"
import { JOURNEY_STEPS, type JourneyProgress, type JourneyStep, type TargetJobSummary } from "@/lib/journey"
import { cn } from "@/lib/utils"

/**
 * "Continue where you left off" — the dark evergreen module that anchors the
 * dashboard.
 *
 * This is the answer to the old home screen: six identical grey cards and a
 * nameless "Welcome back!", where a brand-new user and a power user saw exactly the
 * same thing. Now the dashboard leads with the specific job you're chasing and the
 * one action that moves it forward.
 */

interface ContinueJourneyProps {
  job: TargetJobSummary | null
  progress: JourneyProgress
  nextStep: JourneyStep
  isComplete: boolean
}

export function ContinueJourney({ job, progress, nextStep, isComplete }: ContinueJourneyProps) {
  // First run: no job yet. Ask for the one thing everything else depends on.
  if (!job) {
    return (
      <section className="rounded-panel bg-brand-deep p-7 text-paper">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-on-dark">
          Start here
        </p>

        <h2 className="mt-3 max-w-xl font-display text-[30px] leading-tight text-paper">
          Tell us the job you&apos;re chasing.
        </h2>

        <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed text-paper/70">
          Enter it once and it carries through every step — your résumé gets tailored to
          it, your cover letter cites it, and your interview questions come from it.
        </p>

        <Button asChild variant="onDark" size="lg" className="mt-6">
          <Link href="/dashboard/resume-tailoring">Set your target job →</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="rounded-panel bg-brand-deep p-7 text-paper">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-on-dark">
            {isComplete ? "Ready to apply" : "Continue where you left off"}
          </p>

          <h2 className="mt-2.5 font-display text-[28px] leading-tight text-paper">
            {job.role}
            <span className="mx-2 font-normal text-paper/40">·</span>
            <span className="font-normal text-paper/75">{job.company}</span>
          </h2>

          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-paper/70">
            {isComplete
              ? "Every step is done. Your résumé, cover letter and interview prep are all tuned to this role."
              : nextStep.blurb}
          </p>
        </div>

        {!isComplete && (
          <Button asChild variant="onDark" size="lg" className="shrink-0">
            <Link href={nextStep.href}>
              {nextStep.cta}
              {nextStep.cost > 0 && (
                <CreditCost credits={nextStep.cost} className="bg-brand-deep/10 text-brand-deep" />
              )}
            </Link>
          </Button>
        )}
      </div>

      {/* Mini stepper — five dots, one per step. */}
      <ol className="mt-7 flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {JOURNEY_STEPS.map((step, i) => {
          const done = progress[step.key]
          const isNext = step.key === nextStep.key && !isComplete

          return (
            <li key={step.key} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true" className="text-paper/25">—</span>}

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] transition-colors",
                  done && "text-brand-on-dark",
                  isNext && "bg-paper/12 font-medium text-paper",
                  !done && !isNext && "text-paper/40"
                )}
              >
                <span aria-hidden="true" className="text-[9px]">
                  {done ? "●" : "○"}
                </span>
                {step.shortLabel}
                <span className="sr-only">
                  {done ? " (done)" : isNext ? " (next)" : " (not started)"}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
