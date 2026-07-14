"use client"

import Link from "next/link"
import { JOURNEY_STEPS, type JourneyStepKey, type JourneyProgress, type TargetJobSummary } from "@/lib/journey"
import { cn } from "@/lib/utils"

/**
 * The journey glue.
 *
 * Sits on top of every AI tool: on the left, the job you're chasing; on the right,
 * where you are in the journey. This is what turns eight separate tools into one
 * thread — the job is entered once and every tool shows it.
 */

interface JourneyStepperProps {
  progress: JourneyProgress
  current: JourneyStepKey
  className?: string
}

export function JourneyStepper({ progress, current, className }: JourneyStepperProps) {
  return (
    <ol
      className={cn("flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em]", className)}
      aria-label="Your progress on this job"
    >
      {JOURNEY_STEPS.map((step, i) => {
        const isDone = progress[step.key]
        const isCurrent = step.key === current

        return (
          <li key={step.key} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-ink-faint-2">
                —
              </span>
            )}

            <span
              className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 transition-colors",
                isCurrent && "bg-brand-tint font-medium text-brand",
                !isCurrent && isDone && "text-brand",
                !isCurrent && !isDone && "text-ink-faint-2"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone && !isCurrent && (
                <span aria-hidden="true" className="text-[9px]">
                  ●
                </span>
              )}
              {step.shortLabel}
              <span className="sr-only">
                {isDone ? " (done)" : isCurrent ? " (current step)" : " (not started)"}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

interface JobContextStripProps {
  job: TargetJobSummary | null
  progress: JourneyProgress
  /** Which step this screen represents. */
  current: JourneyStepKey
  className?: string
}

export function JobContextStrip({ job, progress, current, className }: JobContextStripProps) {
  // No job yet — prompt to set one, since every tool downstream depends on it.
  if (!job) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-border bg-section-tint px-6 py-3",
          className
        )}
      >
        <p className="text-[13px] text-ink-muted">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
            No job set
          </span>{" "}
          — add the role you&apos;re chasing and it will carry through every step.
        </p>
        <Link
          href="/dashboard"
          className="rounded-full border border-brand px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-brand transition-colors hover:bg-brand-tint"
        >
          Set target job →
        </Link>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border bg-section-tint px-6 py-2.5",
        className
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          Job
        </span>

        <span className="truncate text-[14px] font-semibold text-ink">
          {job.role}
          <span className="mx-1.5 font-normal text-ink-faint-2">·</span>
          <span className="font-normal text-ink-muted">{job.company}</span>
        </span>

        {job.requirements.slice(0, 3).map((req) => (
          <span
            key={req}
            className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand"
          >
            {req}
          </span>
        ))}
      </div>

      <JourneyStepper progress={progress} current={current} />
    </div>
  )
}
