import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AnswerFeedback } from "@/lib/services/interview-service"

/**
 * STAR breakdown for a scored answer.
 *
 * Every number here comes from the model's evaluation of the actual answer — the
 * score, the per-dimension quality, and the suggested rewrite. Nothing is invented.
 */

const DIMENSIONS = [
  { key: "situation", letter: "S", label: "Situation" },
  { key: "task", letter: "T", label: "Task" },
  { key: "action", letter: "A", label: "Action" },
  { key: "result", letter: "R", label: "Result" },
] as const

const QUALITY_STYLE = {
  excellent: { chip: "bg-brand-tint text-brand", note: "Strong" },
  good: { chip: "bg-brand-tint text-brand", note: "Solid" },
  poor: { chip: "bg-clay-tint text-clay", note: "Needs work" },
} as const

export function StarFeedback({ feedback }: { feedback: AnswerFeedback }) {
  const outOfTen = (feedback.score / 10).toFixed(1)

  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Overall
        </p>
        <p className="font-display text-[30px] leading-none text-ink">
          {outOfTen}
          <span className="ml-0.5 text-[16px] text-ink-faint">/10</span>
        </p>
      </div>

      {/* Per-dimension */}
      <ul className="mt-6 space-y-3">
        {DIMENSIONS.map((dim) => {
          const result = feedback.starAnalysis?.[dim.key]
          const quality = result?.present ? result.quality : "poor"
          const style = QUALITY_STYLE[quality]

          return (
            <li key={dim.key} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-section-tint font-mono text-[11px] font-bold text-ink-muted"
              >
                {dim.letter}
              </span>

              <span className="flex-1 text-[14px] text-ink-2">{dim.label}</span>

              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] tracking-[0.06em]",
                  style.chip
                )}
              >
                {result?.present ? style.note : "Missing"}
              </span>
            </li>
          )
        })}
      </ul>

      {feedback.improvements?.length > 0 && (
        <div className="mt-6 rounded-[10px] bg-clay-tint p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-clay">
            Do this next
          </p>
          <ul className="mt-2 space-y-1.5">
            {feedback.improvements.slice(0, 3).map((item, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-ink-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.strengths?.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            What landed
          </p>
          <ul className="mt-2 space-y-1.5">
            {feedback.strengths.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-2">
                <span aria-hidden="true" className="mt-0.5 text-[11px] text-brand">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
