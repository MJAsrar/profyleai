"use client"

import { useResumeStore } from "@/lib/resume-store"
import {
  RESUME_SECTIONS,
  completionPercent,
  isSectionComplete,
  type SectionKey,
} from "@/lib/resume-sections"
import { cn } from "@/lib/utils"

/**
 * The sections rail, to the design.
 *
 * Replaces the old seven-step next/back wizard: a résumé isn't a linear form. Every
 * section is one click away, and its state is visible without clicking into it —
 * a check when it's done, its ordinal when it isn't.
 *
 * Completion is DERIVED from the data on every render. A stored flag would drift the
 * moment someone deleted their last job, and the bar would keep claiming otherwise.
 *
 * The design's "+ Add section" button isn't here: the résumé schema is fixed, so there is
 * no such thing as a custom section to add.
 */
export function SectionsRail({
  active,
  onSelect,
}: {
  active: SectionKey
  onSelect: (key: SectionKey) => void
}) {
  const resumeData = useResumeStore((s) => s.resumeData)
  const percent = completionPercent(resumeData)

  return (
    <nav
      aria-label="Résumé sections"
      className="flex w-full shrink-0 flex-col border-b border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-3.5 py-[18px] lg:w-[236px] lg:border-b-0 lg:border-r"
    >
      <p className="px-2.5 pb-2.5 pt-1.5 font-mono text-[10px] tracking-[0.14em] text-[#a79f93]">
        SECTIONS
      </p>

      <ul>
        {RESUME_SECTIONS.map((section, i) => {
          const done = isSectionComplete(resumeData, section.key)
          const isActive = section.key === active

          return (
            <li key={section.key}>
              <button
                type="button"
                onClick={() => onSelect(section.key)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-[11px] rounded-[9px] p-2.5 text-left text-[14px] transition-colors",
                  isActive
                    ? "bg-[#e7efe8] font-semibold text-[#22322a]"
                    : done
                      ? "text-[#3a352e] hover:bg-[#f1ede4]"
                      : "text-[#4b463f] hover:bg-[#f1ede4]"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] text-[11px]",
                    done || isActive
                      ? "bg-[#2e6a4a] font-mono font-bold text-[#f4efe6]"
                      : "border-[1.5px] border-[#c9c2b6] font-mono text-[#a79f93]"
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>

                <span className="min-w-0 flex-1 truncate">{section.label}</span>

                {!section.required && (
                  <span className="shrink-0 font-mono text-[10px] text-[#a79f93]">opt</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto px-2.5 pb-1 pt-3">
        <div className="mb-[7px] flex items-center justify-between font-mono text-[11px] text-[#8a837a]">
          <span>COMPLETION</span>
          <span>{percent}%</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Résumé completion"
          className="h-[5px] overflow-hidden rounded-full bg-[rgba(33,31,28,.1)]"
        >
          <div
            className="h-full rounded-full bg-[#2e6a4a] transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </nav>
  )
}
