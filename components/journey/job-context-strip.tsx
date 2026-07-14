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
      className={cn(
        "flex items-center gap-1.5 font-mono text-[11px] tracking-[0.06em]",
        className
      )}
      aria-label="Your progress on this job"
    >
      {JOURNEY_STEPS.map((step, i) => {
        const isDone = progress[step.key]
        const isCurrent = step.key === current

        return (
          <li key={step.key} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-[#c9c2b6]">
                —
              </span>
            )}

            <span
              className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 transition-colors",
                isCurrent && "bg-[#2e6a4a] font-medium text-[#f4efe6]",
                !isCurrent && isDone && "text-[#2e6a4a]",
                !isCurrent && !isDone && "text-[#a79f93]"
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
          "flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(33,31,28,.07)] bg-[#eef2ea] px-6 py-[13px]",
          className
        )}
      >
        <p className="text-[13px] text-[#5c564d]">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#2e6a4a]">
            No job set
          </span>{" "}
          — add the role you&apos;re chasing and it will carry through every step.
        </p>
        <Link
          href="/dashboard/resume-tailoring"
          className="rounded-full border border-[#2e6a4a] px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-[#2e6a4a] transition-colors hover:bg-[#e7efe8]"
        >
          Set target job →
        </Link>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-[rgba(33,31,28,.07)] bg-[#eef2ea] px-6 py-[13px]",
        className
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#2e6a4a]">
          Job
        </span>

        <span className="truncate text-[14px] font-bold text-[#211f1c]">
          {job.role} · {job.company}
        </span>

        {job.requirements.slice(0, 3).map((req) => (
          <span
            key={req}
            className="rounded-full border border-[rgba(33,31,28,.1)] bg-[#fffdf8] px-[9px] py-[3px] text-[12px] text-[#5c564d]"
          >
            {req}
          </span>
        ))}
      </div>

      <JourneyStepper progress={progress} current={current} />
    </div>
  )
}
