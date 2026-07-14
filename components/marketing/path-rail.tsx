import { CREDIT_COSTS } from "@/lib/types/credits"

/**
 * "Your path" — the six steps of the journey on a gradient rail.
 *
 * Sizes and colours are taken directly from the design: the rail runs from pale sage into
 * evergreen, the first and last markers are filled, the four in between are outlined.
 *
 * The credit costs are read from CREDIT_COSTS rather than typed in, so this rail cannot
 * quote a price the billing code doesn't charge. (The design labelled "Build résumé" as
 * free; POST /api/resumes charges CREDIT_COSTS.RESUME_BUILDER for it.)
 */

const cost = (n: number) => (n === 0 ? "free" : `${n} credit${n === 1 ? "" : "s"}`)

const STEPS = [
  { label: "Paste the job", note: "start here", filled: true },
  { label: "Build résumé", note: cost(CREDIT_COSTS.RESUME_BUILDER), filled: false },
  { label: "Tailor to role", note: cost(CREDIT_COSTS.RESUME_TAILORING), filled: false },
  { label: "Cover letter", note: cost(CREDIT_COSTS.COVER_LETTER), filled: false },
  { label: "Interview prep", note: cost(CREDIT_COSTS.TEXT_INTERVIEW), filled: false },
  { label: "Voice interview", note: cost(CREDIT_COSTS.VIDEO_INTERVIEW), filled: true },
]

export function PathRail() {
  return (
    <div
      className="relative rounded-[22px] border border-[rgba(33,31,28,.09)] bg-[#fffdf8] px-6 pb-[30px] pt-9 sm:px-11"
      style={{
        boxShadow:
          "0 1px 2px rgba(30,25,20,.04), 0 30px 70px -34px rgba(30,25,20,.28)",
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[12px] tracking-[0.14em] text-[#8a837a]">
          YOUR PATH
        </span>
        <span className="text-[14px] text-[#5c564d]">
          One job description · six steps · nothing re-typed
        </span>
      </div>

      <ol className="relative mt-[34px] grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-y-0">
        {/* The rail itself. */}
        <div
          aria-hidden="true"
          className="absolute left-[7%] right-[7%] top-5 hidden h-[2px] lg:block"
          style={{ background: "linear-gradient(90deg,#cdd8ce,#2e6a4a)" }}
        />

        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className="relative z-[1] flex w-full flex-col items-center gap-3 text-center lg:w-[150px]"
          >
            <span
              className={
                step.filled
                  ? "flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#2e6a4a] font-mono text-[15px] font-bold text-[#f4efe6]"
                  : "flex h-[42px] w-[42px] items-center justify-center rounded-full border-2 border-[#2e6a4a] bg-[#fffdf8] font-mono text-[15px] font-bold text-[#2e6a4a]"
              }
            >
              {i + 1}
            </span>

            <span className="text-[14px] font-semibold text-[#211f1c]">{step.label}</span>

            <span className="font-mono text-[11px] text-[#8a837a]">{step.note}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
