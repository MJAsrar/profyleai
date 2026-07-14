import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Buttons, per the design system.
 *
 * Primary is the evergreen accent (it used to resolve to pure black, because
 * --primary was a grayscale token). Radius 11px, weight 600–700.
 *
 * The hardcoded 44px minimums are gone from every size — that rule now applies
 * only under a coarse pointer (see globals.css), so dense desktop toolbars and
 * icon-only controls aren't bloated.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[11px] text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-paper hover:bg-brand-hover",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Ghost/secondary: hairline border, ink text, accent on hover
        outline:
          "border border-border bg-transparent text-ink hover:border-brand hover:text-brand",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-brand underline-offset-4 hover:underline",
        /** For use on the dark evergreen bands (CTA band, journey module, voice room). */
        onDark: "bg-paper text-brand-deep hover:bg-white",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-[9px] px-3 text-[13px]",
        lg: "h-12 rounded-[12px] px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

/**
 * The credit-cost pill that sits inside a primary button
 * ("Write cover letter  · 2 credits").
 */
function CreditCost({ credits, className }: { credits: number; className?: string }) {
  return (
    <span
      className={cn(
        "ml-1 rounded-full bg-white/16 px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.06em]",
        className
      )}
    >
      {credits} {credits === 1 ? "credit" : "credits"}
    </span>
  )
}

export { Button, buttonVariants, CreditCost }
