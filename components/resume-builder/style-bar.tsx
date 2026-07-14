"use client"

import { useState } from "react"
import { FontSizeControls } from "./font-size-controls"
import { SpacingControls } from "./spacing-controls"
import { useApplyPreset, useFontConfig } from "@/lib/font-config-store"
import { getPresetName } from "@/lib/font-config-store"
import { useApplySpacingPreset, useSpacingPresetName } from "@/lib/spacing-config-store"
import { cn } from "@/lib/utils"

/**
 * The style bar under the preview.
 *
 * Everything here changes what actually comes out of the PDF — the same font and spacing
 * config the export reads. Nothing on this bar is decorative.
 */

const FONT_PRESETS = ["compact", "normal", "large"] as const
const SPACING_PRESETS = ["compact", "normal", "spacious"] as const

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: string | null
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>

      <div className="mt-1.5 flex rounded-input border border-border bg-card p-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={cn(
              "flex-1 rounded-[7px] px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
              value === opt
                ? "bg-brand-tint text-brand"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export function StyleBar() {
  const [showFineTune, setShowFineTune] = useState(false)

  const fontConfig = useFontConfig()
  const applyFontPreset = useApplyPreset()
  const fontPreset = getPresetName(fontConfig)

  const applySpacingPreset = useApplySpacingPreset()
  const spacingPreset = useSpacingPresetName()

  return (
    <div className="rounded-card border border-border bg-card shadow-card">
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Segmented
          label="Text size"
          options={FONT_PRESETS}
          value={fontPreset}
          onChange={applyFontPreset}
        />
        <Segmented
          label="Spacing"
          options={SPACING_PRESETS}
          value={spacingPreset}
          onChange={applySpacingPreset}
        />
      </div>

      <div className="border-t border-border px-4 py-2.5">
        <button
          type="button"
          onClick={() => setShowFineTune((v) => !v)}
          aria-expanded={showFineTune}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-brand"
        >
          {showFineTune ? "▾ Hide fine-tuning" : "▸ Fine-tune every size"}
        </button>
      </div>

      {showFineTune && (
        <div className="space-y-4 border-t border-border p-4">
          <FontSizeControls />
          <SpacingControls />
        </div>
      )}
    </div>
  )
}
