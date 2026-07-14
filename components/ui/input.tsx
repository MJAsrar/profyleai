import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input, per the design system: plain white field (not paper), hairline border,
 * 10px radius, and an accent focus ring rather than a hard outline.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-input border border-border bg-[var(--card-plain)] px-3.5 py-3 text-[15px] text-ink",
          "placeholder:text-ink-faint",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "transition-colors duration-150",
          "focus-visible:border-brand focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

/**
 * The mono field label the design puts above every input.
 */
const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint",
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

export { Input, FieldLabel }
