import { cn } from "@/lib/utils"

/**
 * The match score, as a conic-gradient ring.
 *
 * The number comes from the model's assessment of this résumé against this posting.
 * It is deliberately labelled as a match score and nothing more — the old UI showed a
 * hardcoded "ATS score: 95" that was invented, which is worse than showing nothing.
 */
export function MatchRing({ score, className }: { score: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  const verdict =
    clamped >= 80 ? "Strong match" : clamped >= 60 ? "Decent match" : "Needs work"

  const tone =
    clamped >= 80 ? "text-brand" : clamped >= 60 ? "text-clay" : "text-danger"

  const ringColor =
    clamped >= 80 ? "var(--brand)" : clamped >= 60 ? "var(--clay)" : "var(--danger)"

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className="relative flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${clamped * 3.6}deg, var(--section-tint) 0deg)`,
        }}
        role="img"
        aria-label={`${clamped} percent match — ${verdict}`}
      >
        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-card">
          <span className="font-display text-[24px] leading-none text-ink">{clamped}%</span>
        </div>
      </div>

      <div>
        <p className={cn("font-sans text-[16px] font-bold", tone)}>{verdict}</p>
        <p className="mt-1 max-w-[260px] text-[13px] leading-relaxed text-ink-muted">
          How closely this résumé lines up with the posting you gave us.
        </p>
      </div>
    </div>
  )
}
