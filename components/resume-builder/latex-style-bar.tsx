"use client"

import {
  useLatexStyleStore,
  FONT_SIZE_OPTIONS,
  DENSITY_OPTIONS,
  ACCENT_OPTIONS,
} from "@/lib/latex/style-store"
import { cn } from "@/lib/utils"

/**
 * The style bar under the LaTeX preview. Unlike the legacy StyleBar, every control here maps to
 * a real knob in the .tex the compiler renders — font size, vertical density, and accent colour.
 */

export function LatexStyleBar() {
  const style = useLatexStyleStore((s) => s.style)
  const setFontSize = useLatexStyleStore((s) => s.setFontSize)
  const setDensity = useLatexStyleStore((s) => s.setDensity)
  const setAccent = useLatexStyleStore((s) => s.setAccent)

  const sizeIdx = FONT_SIZE_OPTIONS.indexOf(style.fontSize as (typeof FONT_SIZE_OPTIONS)[number])
  const currentSizeIdx = sizeIdx === -1 ? 2 : sizeIdx

  return (
    <div className="shrink-0 border-t border-[rgba(33,31,28,.1)] bg-[#fffdf8]">
      <div className="flex flex-wrap items-center gap-[18px] px-5 py-3.5">
        {/* Size stepper */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.06em] text-[#8a837a]">SIZE</span>
          <div className="flex items-center overflow-hidden rounded-[7px] border border-[rgba(33,31,28,.14)]">
            <button
              type="button"
              aria-label="Smaller text"
              disabled={currentSizeIdx <= 0}
              onClick={() => setFontSize(FONT_SIZE_OPTIONS[Math.max(0, currentSizeIdx - 1)])}
              className="px-[9px] py-[5px] text-[13px] text-[#4b463f] hover:bg-[#f1ede4] disabled:opacity-40"
            >
              −
            </button>
            <span className="border-x border-[rgba(33,31,28,.12)] px-2 py-[5px] text-[12px] tabular-nums text-[#211f1c]">
              {style.fontSize.toFixed(1)}pt
            </span>
            <button
              type="button"
              aria-label="Larger text"
              disabled={currentSizeIdx >= FONT_SIZE_OPTIONS.length - 1}
              onClick={() =>
                setFontSize(FONT_SIZE_OPTIONS[Math.min(FONT_SIZE_OPTIONS.length - 1, currentSizeIdx + 1)])
              }
              className="px-[9px] py-[5px] text-[13px] text-[#4b463f] hover:bg-[#f1ede4] disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* Density */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.06em] text-[#8a837a]">DENSITY</span>
          <div className="flex items-center overflow-hidden rounded-[7px] border border-[rgba(33,31,28,.14)]">
            {DENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDensity(opt.value)}
                className={cn(
                  "px-2.5 py-[5px] text-[12px] transition-colors",
                  style.density === opt.value
                    ? "bg-[#2e6a4a] text-[#f6f3ec]"
                    : "text-[#4b463f] hover:bg-[#f1ede4]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.06em] text-[#8a837a]">ACCENT</span>
          <div className="flex items-center gap-1.5">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-label={opt.label}
                aria-pressed={style.accent === opt.value}
                onClick={() => setAccent(opt.value)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-transform hover:scale-110",
                  style.accent === opt.value
                    ? "border-[#211f1c] ring-2 ring-[#211f1c]/20"
                    : "border-black/10"
                )}
                style={{ backgroundColor: `#${opt.value}` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
