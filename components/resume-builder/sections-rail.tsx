"use client"

import { useResumeStore } from "@/lib/resume-store"
import {
  RESUME_SECTIONS,
  completionPercent,
  isSectionComplete,
  sectionCount,
  type SectionKey,
} from "@/lib/resume-sections"
import { cn } from "@/lib/utils"

/**
 * The sections rail.
 *
 * Replaces the old seven-step next/back wizard. A résumé isn't a linear form — people
 * fill in what they remember, in the order they remember it, and jump back constantly.
 * Every section is reachable in one click, and the state of each one is visible without
 * clicking into it.
 */
export function SectionsRail({
  active,
  onSelect,
}: {
  active: SectionKey
  onSelect: (key: SectionKey) => void
}) {
  // Narrow selector: this rail re-renders on résumé edits (it has to — it shows
  // completion), but nothing else in the store can wake it.
  const resumeData = useResumeStore((s) => s.resumeData)
  const percent = completionPercent(resumeData)

  return (
    <nav aria-label="Résumé sections" className="w-full lg:w-[236px] lg:shrink-0">
      <div className="rounded-card border border-border bg-card shadow-card">
        {/* Completion */}
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Complete
            </p>
            <p className="font-display text-[18px] leading-none text-ink">{percent}%</p>
          </div>

          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Résumé completion"
            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-section-tint"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <ul className="p-2">
          {RESUME_SECTIONS.map((section, i) => {
            const done = isSectionComplete(resumeData, section.key)
            const count = sectionCount(resumeData, section.key)
            const isActive = section.key === active

            return (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => onSelect(section.key)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2.5 text-left transition-colors",
                    isActive ? "bg-brand-tint" : "hover:bg-section-tint"
                  )}
                >
                  {/* Check when done, ordinal when not — the chip carries the state. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] font-mono text-[11px] font-bold",
                      done
                        ? "bg-brand text-paper"
                        : isActive
                          ? "bg-card text-brand"
                          : "bg-section-tint text-ink-faint"
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[14px]",
                        isActive ? "font-semibold text-brand-deep" : "text-ink-2"
                      )}
                    >
                      {section.label}
                    </span>

                    {!done && (
                      <span className="block truncate font-mono text-[10px] tracking-[0.06em] text-ink-faint">
                        {section.hint}
                      </span>
                    )}
                  </span>

                  {count !== null && count > 0 && (
                    <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                      {count}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="mt-3 px-1 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-ink-faint">
        Projects and certifications are optional — they don&apos;t count against you.
      </p>
    </nav>
  )
}
