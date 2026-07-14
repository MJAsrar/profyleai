"use client"

import { useState } from "react"
import { FontSizeControls } from "./font-size-controls"
import { SpacingControls } from "./spacing-controls"
import {
  useApplyPreset,
  useFontConfig,
  getPresetName,
} from "@/lib/font-config-store"
import { useApplySpacingPreset, useSpacingPresetName } from "@/lib/spacing-config-store"
import { cn } from "@/lib/utils"

/**
 * The style bar under the preview, to the design.
 *
 * Every control here changes what actually comes out of the PDF — it writes to the same
 * font and spacing config the export reads.
 *
 * The design also showed four accent-colour swatches. The renderer has no accent-colour
 * input — nothing downstream of a swatch would change — so they aren't here. A control that
 * does nothing is a lie told in pixels.
 */

const FONT_PRESETS = ["compact", "normal", "large"] as const
const SPACING_PRESETS = ["compact", "normal", "spacious"] as const

const SIZE_INDEX: Record<string, number> = { compact: 0, normal: 1, large: 2 }
const SPACING_INDEX: Record<string, number> = { compact: 0, normal: 1, spacious: 2 }

export function StyleBar() {
  const [showFineTune, setShowFineTune] = useState(false)

  const fontConfig = useFontConfig()
  const applyFontPreset = useApplyPreset()
  const fontPreset = getPresetName(fontConfig)

  const applySpacingPreset = useApplySpacingPreset()
  const spacingPreset = useSpacingPresetName()

  const sizeIdx = fontPreset ? (SIZE_INDEX[fontPreset] ?? 1) : 1
  const spacingIdx = spacingPreset ? (SPACING_INDEX[spacingPreset] ?? 1) : 1

  return (
    <div className="shrink-0 border-t border-[rgba(33,31,28,.1)] bg-[#fffdf8]">
      <div className="flex flex-wrap items-center gap-[18px] px-5 py-3.5">
        {/* Size stepper */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.06em] text-[#8a837a]">
            SIZE
          </span>

          <div className="flex items-center overflow-hidden rounded-[7px] border border-[rgba(33,31,28,.14)]">
            <button
              type="button"
              aria-label="Smaller text"
              disabled={sizeIdx <= 0}
              onClick={() => applyFontPreset(FONT_PRESETS[Math.max(0, sizeIdx - 1)])}
              className="px-[9px] py-[5px] text-[13px] text-[#4b463f] hover:bg-[#f1ede4] disabled:opacity-40"
            >
              −
            </button>

            <span className="border-x border-[rgba(33,31,28,.12)] px-2 py-[5px] text-[12px] capitalize text-[#211f1c]">
              {fontPreset ?? "custom"}
            </span>

            <button
              type="button"
              aria-label="Larger text"
              disabled={sizeIdx >= FONT_PRESETS.length - 1}
              onClick={() =>
                applyFontPreset(FONT_PRESETS[Math.min(FONT_PRESETS.length - 1, sizeIdx + 1)])
              }
              className="px-[9px] py-[5px] text-[13px] text-[#4b463f] hover:bg-[#f1ede4] disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* Spacing slider */}
        <div className="flex min-w-[180px] flex-1 items-center gap-2">
          <label
            htmlFor="spacing"
            className="font-mono text-[10px] tracking-[0.06em] text-[#8a837a]"
          >
            SPACING
          </label>

          <input
            id="spacing"
            type="range"
            min={0}
            max={2}
            step={1}
            value={spacingIdx}
            onChange={(e) => applySpacingPreset(SPACING_PRESETS[Number(e.target.value)])}
            className="flex-1 accent-[#2e6a4a]"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFineTune((v) => !v)}
          aria-expanded={showFineTune}
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
            showFineTune ? "text-[#2e6a4a]" : "text-[#8a837a] hover:text-[#2e6a4a]"
          )}
        >
          {showFineTune ? "▾ Hide fine-tuning" : "▸ Fine-tune"}
        </button>
      </div>

      {showFineTune && (
        <div className="max-h-[280px] space-y-4 overflow-auto border-t border-[rgba(33,31,28,.1)] p-4">
          <FontSizeControls />
          <SpacingControls />
        </div>
      )}
    </div>
  )
}
