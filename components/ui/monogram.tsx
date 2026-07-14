import { cn } from "@/lib/utils"

/**
 * Geometric monogram chip.
 *
 * The design system deliberately avoids illustrative icons: each tool is
 * identified by a rounded square filled with a muted tint, containing a two-letter
 * mono monogram in that tint's darker hue.
 *
 * The secondary hues (indigo / clay / olive) exist ONLY here, to differentiate
 * tools at a glance. They are never brand accents.
 */

export type MonogramTone = "brand" | "indigo" | "clay" | "olive" | "neutral"

const tones: Record<MonogramTone, string> = {
  brand: "bg-brand-tint text-brand",
  indigo: "bg-indigo-tint text-indigo",
  clay: "bg-clay-tint text-clay",
  olive: "bg-olive-tint text-olive",
  neutral: "bg-section-tint text-ink-muted",
}

const sizes = {
  sm: "h-8 w-8 rounded-[9px] text-[10px]",
  md: "h-[38px] w-[38px] rounded-[10px] text-[13px]",
  lg: "h-[42px] w-[42px] rounded-[11px] text-[13px]",
}

interface MonogramProps {
  /** Two letters, e.g. "TL" for Tailor. */
  children: string
  tone?: MonogramTone
  size?: keyof typeof sizes
  className?: string
}

export function Monogram({
  children,
  tone = "brand",
  size = "md",
  className,
}: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-mono font-bold tracking-[0.04em]",
        tones[tone],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * The canonical monogram for each tool, so a given tool always reads the same way
 * across the dashboard, the sidebar and the journey stepper.
 */
export const TOOL_MONOGRAMS = {
  resumeBuilder: { code: "RB", tone: "brand", label: "Résumé builder" },
  myResumes: { code: "MR", tone: "olive", label: "My résumés" },
  tailor: { code: "TL", tone: "indigo", label: "Tailor to a job" },
  coverLetter: { code: "CL", tone: "clay", label: "Cover letter" },
  interviewPrep: { code: "IP", tone: "clay", label: "Interview prep" },
  voice: { code: "VI", tone: "indigo", label: "Voice interview" },
} as const satisfies Record<
  string,
  { code: string; tone: MonogramTone; label: string }
>
