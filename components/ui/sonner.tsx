"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * The toaster, to the design: warm card, hairline border, the soft card shadow, and an
 * evergreen accent on success / clay on error.
 *
 * This has to be mounted for any of it to appear. The app calls `toast()` from sonner in
 * ~30 places, but the root layout was only mounting the *other* (shadcn/radix) Toaster —
 * so every one of those toasts was being fired into a void. Saves, failures and refunds
 * were all announcing themselves to nobody.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-card group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:shadow-card group-[.toaster]:text-[14px]",
          description: "group-[.toast]:text-[13px] group-[.toast]:text-ink-muted",
          actionButton:
            "group-[.toast]:rounded-[8px] group-[.toast]:bg-brand group-[.toast]:text-paper group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:rounded-[8px] group-[.toast]:bg-section-tint group-[.toast]:text-ink-muted",
          success: "group-[.toaster]:[&_[data-icon]]:text-brand",
          error: "group-[.toaster]:[&_[data-icon]]:text-clay",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
