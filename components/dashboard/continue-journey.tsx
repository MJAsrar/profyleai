"use client"

import Link from "next/link"
import {
  JOURNEY_STEPS,
  type JourneyProgress,
  type JourneyStep,
  type TargetJobSummary,
} from "@/lib/journey"
import { cn } from "@/lib/utils"

/**
 * "Continue where you left off" — the dark module that anchors the dashboard.
 *
 * The stepper is the design's: a checked circle for what's done, a filled paper circle for
 * where you are, and dimmed outlines for what's ahead, joined by short connectors.
 */

interface ContinueJourneyProps {
  job: TargetJobSummary | null
  progress: JourneyProgress
  nextStep: JourneyStep
  isComplete: boolean
}

export function ContinueJourney({
  job,
  progress,
  nextStep,
  isComplete,
}: ContinueJourneyProps) {
  // First run: no job yet. Ask for the one thing every other step depends on.
  if (!job) {
    return (
      <section className="rounded-[18px] bg-[#22322a] px-[30px] py-7">
        <p className="mb-2.5 font-mono text-[11px] tracking-[0.12em] text-[#8fc7a3]">
          START HERE
        </p>

        <h2 className="mb-1 text-[22px] font-bold text-[#f4efe6]">
          Tell us the job you&apos;re chasing.
        </h2>

        <p className="mb-5 max-w-[520px] text-[14px] text-[#a9b7ad]">
          Enter it once and it carries through every step — your résumé gets tailored to
          it, your cover letter cites it, and your interview questions come from it.
        </p>

        <Link
          href="/dashboard/resume-tailoring"
          className="inline-flex rounded-[12px] bg-[#f4efe6] px-[22px] py-4 text-[15px] font-bold text-[#22322a] hover:bg-white"
        >
          Set your target job →
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-[30px] rounded-[18px] bg-[#22322a] px-[30px] py-7">
      <div className="min-w-0 flex-1">
        <p className="mb-2.5 font-mono text-[11px] tracking-[0.12em] text-[#8fc7a3]">
          {isComplete ? "READY TO APPLY" : "CONTINUE WHERE YOU LEFT OFF"}
        </p>

        <p className="mb-1 truncate text-[22px] font-bold text-[#f4efe6]">
          {job.role} · {job.company}
        </p>

        <p className="mb-5 text-[14px] text-[#a9b7ad]">
          {isComplete
            ? "Every step is done. Your résumé, cover letter and interview prep are all tuned to this role."
            : nextStep.blurb}
        </p>

        {/* Stepper */}
        <ol className="flex flex-wrap items-center gap-y-3">
          {JOURNEY_STEPS.map((step, i) => {
            const done = progress[step.key]
            const isCurrent = step.key === nextStep.key && !isComplete

            return (
              <li key={step.key} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-2.5 h-[2px] w-[26px] bg-[#3c5346]"
                  />
                )}

                <span
                  className={cn(
                    "flex items-center gap-2",
                    !done && !isCurrent && "opacity-50"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[12px]",
                      done && "bg-[#2e6a4a] text-[#f4efe6]",
                      isCurrent &&
                        "bg-[#f4efe6] font-mono text-[11px] font-bold text-[#22322a]",
                      !done &&
                        !isCurrent &&
                        "border-[1.5px] border-[#6f8a7a] font-mono text-[11px] text-[#a9b7ad]"
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>

                  <span
                    className={cn(
                      "text-[13px]",
                      isCurrent
                        ? "font-semibold text-[#f4efe6]"
                        : done
                          ? "text-[#cddccf]"
                          : "text-[#a9b7ad]"
                    )}
                  >
                    {step.shortLabel}
                  </span>

                  <span className="sr-only">
                    {done ? "done" : isCurrent ? "next" : "not started"}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {!isComplete && (
        <Link
          href={nextStep.href}
          className="inline-flex shrink-0 flex-col items-start gap-[3px] rounded-[12px] bg-[#f4efe6] px-[22px] py-4 hover:bg-white"
        >
          <span className="text-[15px] font-bold text-[#22322a]">{nextStep.cta} →</span>
          <span className="font-mono text-[11px] text-[#4a6b57]">
            {nextStep.cost > 0 ? `costs ${nextStep.cost} credits` : "free"}
          </span>
        </Link>
      )}
    </section>
  )
}
