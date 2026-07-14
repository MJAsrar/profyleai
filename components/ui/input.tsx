import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The field, exactly as the design specifies it: white, 10px radius, a slightly stronger
 * hairline than the rest of the UI, and an evergreen focus ring rather than a hard outline.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[10px] border border-[rgba(33,31,28,.16)] bg-white px-[14px] py-[13px] text-[15px] text-[#211f1c]",
          "placeholder:text-[#a79f93]",
          "transition-colors duration-150",
          "focus-visible:border-[#2e6a4a] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(46,106,74,.12)]",
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

/** The mono label the design puts above every field. */
const FieldLabel = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "mb-[7px] block font-mono text-[11px] uppercase tracking-[0.08em] text-[#8a837a]",
        className
      )}
      {...props}
    />
  )
)
FieldLabel.displayName = "FieldLabel"

export { Input, FieldLabel }
