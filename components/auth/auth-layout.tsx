import { Suspense, ReactNode } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Split auth: dark evergreen brand panel on the left, form on the right.
 *
 * Colours, sizes and copy are the design's. One line is not: the design's first bullet
 * read "Build an ATS-ready résumé for free", but POST /api/resumes charges
 * CREDIT_COSTS.RESUME_BUILDER. Selling a paid step as free on the signup page is the worst
 * possible place to do it, so the bullet says what the product actually gives you.
 */
const BENEFITS = [
  "Ten free credits the moment you sign up",
  "Tailor your résumé to any job with AI",
  "Rehearse interviews before they happen",
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1240px]">
        {/* ---- Brand panel ---- */}
        <aside className="hidden w-[48%] flex-col justify-between bg-[#22322a] px-12 py-[52px] lg:flex">
          <Link href="/" className="flex items-center gap-[11px]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#2e6a4a] font-display text-[21px] font-semibold text-[#f6f3ec]">
              P
            </span>
            <span className="text-[20px] font-bold text-[#f4efe6]">
              Profyle<span className="text-[#8fc7a3]">AI</span>
            </span>
          </Link>

          <div>
            <h1 className="mb-5 font-display text-[44px] font-medium leading-[1.1] text-[#f4efe6]">
              Ten free credits, and a plan for the whole hunt.
            </h1>

            <p className="mb-[34px] max-w-[400px] text-[17px] leading-[1.6] text-[#a9b7ad]">
              Create one profile and carry it through your résumé, cover letters, and
              interview practice.
            </p>

            <ul className="flex flex-col gap-[14px]">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-[15px] text-[#cddccf]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-[#2e6a4a] text-[12px] text-[#f4efe6]"
                  >
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-mono text-[12px] tracking-[0.04em] text-[#6f8a7a]">
            Built for people applying to their first real job
          </p>
        </aside>

        {/* ---- Form ---- */}
        <main className="flex w-full flex-col justify-center bg-[#f6f3ec] px-6 py-[52px] sm:px-14 lg:w-[52%]">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-[11px]">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#2e6a4a] font-display text-[21px] font-semibold text-[#f6f3ec]">
                  P
                </span>
                <span className="text-[20px] font-bold text-[#211f1c]">
                  Profyle<span className="text-[#2e6a4a]">AI</span>
                </span>
              </Link>
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
    </div>
  )
}
