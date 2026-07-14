import { cn } from "@/lib/utils"

/**
 * The match score, as the design's conic ring: 118px outer, 90px well, the number in
 * Newsreader with a mono MATCH label under it.
 *
 * The number comes from the model's assessment of this résumé against this posting. It is
 * labelled a match score and nothing more — the old UI showed a hardcoded "ATS score: 95"
 * that was invented, which is worse than showing nothing.
 */
export function MatchRing({ score, className }: { score: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  const verdict =
    clamped >= 80 ? "Strong match" : clamped >= 60 ? "Decent match" : "Needs work"

  const blurb =
    clamped >= 80
      ? "Your tailored résumé hits most of the posting's keywords. It's saved as a new version — your base is untouched."
      : clamped >= 60
        ? "A reasonable fit. Look at what's still missing below before you send it."
        : "This posting is asking for things your résumé doesn't show yet. The gaps are listed below."

  const ringColor = clamped >= 80 ? "#2e6a4a" : clamped >= 60 ? "#a1633c" : "#b4472f"

  return (
    <div className={cn("flex flex-wrap items-center gap-5", className)}>
      <div
        role="img"
        aria-label={`${clamped} percent match — ${verdict}`}
        className="flex h-[118px] w-[118px] shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${ringColor} ${clamped}%, #d8d2c6 0)` }}
      >
        <div className="flex h-[90px] w-[90px] flex-col items-center justify-center rounded-full bg-[#fffdf8]">
          <span className="font-display text-[30px] leading-none text-[#211f1c]">
            {clamped}%
          </span>
          <span className="font-mono text-[9px] tracking-[0.1em] text-[#8a837a]">
            MATCH
          </span>
        </div>
      </div>

      <div className="min-w-[200px] flex-1">
        <p className="mb-1 text-[18px] font-bold text-[#211f1c]">{verdict}</p>
        <p className="text-[13.5px] leading-[1.55] text-[#5c564d]">{blurb}</p>
      </div>
    </div>
  )
}
