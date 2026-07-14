import { Suspense, ReactNode } from "react"
import { Logo } from "@/components/ui/logo"
import { Skeleton } from "@/components/ui/skeleton"

const BENEFITS = [
  "Ten free credits — no card required.",
  "One job description powers every tool.",
  "Résumés that read like a person wrote them.",
]

/**
 * Split auth (design 1d): dark evergreen brand panel on the left, the form on the
 * right. The panel gives the page a reason to exist beyond "here is a form".
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      {/* Brand panel */}
      <aside className="hidden w-[48%] flex-col justify-between bg-brand-deep p-12 lg:flex">
        <Logo href="/" onDark />

        <div>
          <h1 className="max-w-md font-display text-[40px] leading-[1.1] text-paper">
            Everything you need for the job you actually want.
          </h1>

          <ul className="mt-9 space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-on-dark/20 text-[11px] font-bold text-brand-on-dark"
                >
                  ✓
                </span>
                <span className="text-[15px] leading-relaxed text-paper/75">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[11px] leading-relaxed tracking-[0.06em] text-paper/40">
          Built for people applying to their first real job.
        </p>
      </aside>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Logo href="/" />
          </div>

          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
