import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { CREDIT_COSTS, CREDIT_PACKAGES } from "@/lib/types/credits"
import { generateMetadata } from "@/lib/seo-config"
import { cn } from "@/lib/utils"

export const metadata = generateMetadata("home")

/**
 * Pricing, to the design.
 *
 * The packs are read from CREDIT_PACKAGES — the same constant the purchase API prices
 * against and Stripe charges — rather than the design's illustrative packs, which don't
 * exist in this app. The costs come from CREDIT_COSTS for the same reason.
 *
 * The design's subhead said "Building résumés is free". It isn't: POST /api/resumes charges
 * CREDIT_COSTS.RESUME_BUILDER.
 */

const LEGEND: Array<{ label: string; cost: number }> = [
  { label: "Build a résumé", cost: CREDIT_COSTS.RESUME_BUILDER },
  { label: "Tailor to a job", cost: CREDIT_COSTS.RESUME_TAILORING },
  { label: "Cover letter", cost: CREDIT_COSTS.COVER_LETTER },
  { label: "Interview prep", cost: CREDIT_COSTS.TEXT_INTERVIEW },
  { label: "Voice interview", cost: CREDIT_COSTS.VIDEO_INTERVIEW },
]

export default function PricingPage() {
  const packages = Object.values(CREDIT_PACKAGES)

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden bg-[#f6f3ec]">
        <PublicNav />

        <main>
          {/* ---- Hero ---- */}
          <section className="px-6 pb-[30px] pt-[72px] text-center sm:px-14">
            <p className="mb-5 font-mono text-[13px] tracking-[0.16em] text-[#2e6a4a]">
              PRICING
            </p>

            <h1 className="mx-auto mb-[18px] max-w-[640px] font-display text-[38px] font-medium leading-[1.04] tracking-[-0.015em] text-[#211f1c] sm:text-[52px]">
              Pay for what you use. Credits never expire.
            </h1>

            <p className="mx-auto max-w-[520px] text-[18px] leading-[1.55] text-[#5c564d]">
              No subscription. You spend credits only when the app actually does something
              for you — and you start with ten on us.
            </p>
          </section>

          {/* ---- What a credit buys ---- */}
          <section className="px-6 pb-11 pt-[14px] sm:px-14">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[rgba(33,31,28,.07)] bg-[#eef2ea] px-[26px] py-[22px]">
              <span className="whitespace-nowrap font-mono text-[12px] tracking-[0.1em] text-[#2e6a4a]">
                WHAT A CREDIT BUYS
              </span>

              <div className="flex flex-wrap items-center gap-x-[26px] gap-y-2">
                {LEGEND.map((item, i) => (
                  <span key={item.label} className="flex items-center gap-x-[26px]">
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        className="hidden h-[5px] w-[5px] rounded-full bg-[#c9c2b6] sm:block"
                      />
                    )}
                    <span className="text-[14px] text-[#3a352e]">
                      <strong className="font-bold">{item.label}</strong> —{" "}
                      {item.cost === 0 ? "free" : item.cost}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ---- Packs ---- */}
          <section className="grid gap-4 px-6 pb-[30px] sm:px-14 md:grid-cols-2 lg:grid-cols-5">
            {packages.map((pack) => {
              const popular = pack.popular
              const perCredit = pack.price / pack.credits

              return (
                <div
                  key={pack.id}
                  className={cn(
                    "relative flex flex-col rounded-[16px] border px-5 py-6",
                    popular
                      ? "border-[#22322a] bg-[#22322a] shadow-[0_24px_50px_-30px_rgba(30,25,20,.5)]"
                      : "border-[rgba(33,31,28,.1)] bg-[#fffdf8]"
                  )}
                >
                  {popular && (
                    <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2e6a4a] px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-[#eaf3ec]">
                      MOST POPULAR
                    </span>
                  )}

                  <p
                    className={cn(
                      "mb-3 text-[15px] font-bold",
                      popular ? "text-[#f4efe6]" : "text-[#211f1c]"
                    )}
                  >
                    {pack.name}
                  </p>

                  <p
                    className={cn(
                      "font-display text-[40px] leading-none",
                      popular ? "text-[#f4efe6]" : "text-[#211f1c]"
                    )}
                  >
                    {pack.credits}
                  </p>

                  <p
                    className={cn(
                      "mb-4 font-mono text-[11px] tracking-[0.05em]",
                      popular ? "text-[#8fc7a3]" : "text-[#8a837a]"
                    )}
                  >
                    CREDITS
                    {pack.bonusPercentage > 0 && ` · +${pack.bonusPercentage}% BONUS`}
                  </p>

                  <p
                    className={cn(
                      "text-[24px] font-bold",
                      popular ? "text-[#f4efe6]" : "text-[#211f1c]"
                    )}
                  >
                    ${pack.price.toFixed(0)}
                  </p>

                  <p
                    className={cn(
                      "mb-5 text-[12px]",
                      popular ? "text-[#a9b7ad]" : "text-[#8a837a]"
                    )}
                  >
                    ≈ ${perCredit.toFixed(2)} / credit
                  </p>

                  <Link
                    href="/signup"
                    className={cn(
                      "mt-auto rounded-[10px] py-[11px] text-center text-[14px]",
                      popular
                        ? "bg-[#f4efe6] font-bold text-[#22322a] hover:bg-white"
                        : "border border-[#2e6a4a] font-semibold text-[#2e6a4a] hover:bg-[#2e6a4a] hover:text-[#f4efe6]"
                    )}
                  >
                    Buy credits
                  </Link>
                </div>
              )
            })}
          </section>

          <p className="px-6 pb-[68px] text-center font-mono text-[12px] tracking-[0.04em] text-[#8a837a] sm:px-14">
            10 free credits on sign-up · credits never expire · secure checkout
          </p>
        </main>

        <div className="border-t border-[rgba(33,31,28,.08)]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
