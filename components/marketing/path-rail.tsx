import { cn } from "@/lib/utils"

/**
 * "Your path" — the six connected steps of the journey, on a gradient rail.
 *
 * This is the landing page's thesis made visible: one job description, every step
 * uses it. It replaces a generic feature grid that never explained how the tools
 * related to each other.
 */

const STEPS = [
  { label: "Paste the job", cost: "Free" },
  { label: "Build résumé", cost: "Free" },
  { label: "Tailor it", cost: "2" },
  { label: "Cover letter", cost: "2" },
  { label: "Interview prep", cost: "5" },
  { label: "Voice interview", cost: "50" },
]

export function PathRail({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-panel border border-border bg-[var(--card-plain)] p-8 shadow-card sm:p-10",
        className
      )}
    >
      <p className="eyebrow">Your path</p>
      <h2 className="mt-3 max-w-lg font-display text-[30px] leading-tight text-ink sm:text-[34px]">
        One job description. <em className="text-brand not-italic">Every step uses it.</em>
      </h2>

      <ol className="relative mt-10 grid grid-cols-2 gap-y-9 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
        {/* The rail itself — a gradient from pale sage into evergreen. */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-[21px] hidden h-[2px] rounded-full lg:block"
          style={{
            background: "linear-gradient(90deg, #cdd8ce 0%, #2e6a4a 100%)",
          }}
        />

        {STEPS.map((step, i) => {
          const isEndpoint = i === 0 || i === STEPS.length - 1

          return (
            <li key={step.label} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative z-10 flex h-[42px] w-[42px] items-center justify-center rounded-full border-2 font-mono text-[13px] font-bold",
                  isEndpoint
                    ? "border-brand bg-brand text-paper"
                    : "border-brand/35 bg-[var(--card-plain)] text-brand"
                )}
              >
                {i + 1}
              </span>

              <span className="mt-3 max-w-[110px] text-[13px] font-semibold leading-snug text-ink">
                {step.label}
              </span>

              <span
                className={cn(
                  "mt-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-[0.06em]",
                  step.cost === "Free"
                    ? "bg-section-tint text-ink-muted"
                    : "bg-brand-tint text-brand"
                )}
              >
                {step.cost === "Free" ? "Free" : `${step.cost} credits`}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
