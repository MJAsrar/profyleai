import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * Brand mark: a rounded evergreen square containing a Newsreader "P" in paper.
 * Wordmark: "Profyle" in ink + "AI" in accent.
 *
 * Replaces the previous <img> logo, which cost a network request and tripped the
 * no-img-element lint on every page it appeared.
 */

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-brand font-display text-[17px] font-medium leading-none text-paper",
        className
      )}
    >
      P
    </span>
  )
}

interface LogoProps {
  /** Render the wordmark next to the mark. */
  withWordmark?: boolean
  /** Where the logo links to. Omit to render a non-interactive mark. */
  href?: string
  className?: string
  /** Use the light-on-dark treatment (dark evergreen bands, voice room). */
  onDark?: boolean
}

export function Logo({
  withWordmark = true,
  href = "/",
  className,
  onDark = false,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={onDark ? "bg-brand-on-dark text-brand-deep" : undefined} />
      {withWordmark && (
        <span className="font-sans text-[17px] font-bold tracking-tight">
          <span className={onDark ? "text-paper" : "text-ink"}>Profyle</span>
          <span className={onDark ? "text-brand-on-dark" : "text-brand"}>AI</span>
        </span>
      )}
      <span className="sr-only">ProfyleAI</span>
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} className="rounded-[9px]">
      {content}
    </Link>
  )
}
