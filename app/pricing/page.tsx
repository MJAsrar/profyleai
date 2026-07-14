import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { CREDIT_COSTS, CREDIT_PACKAGES } from "@/lib/types/credits"
import { generateMetadata } from "@/lib/seo-config"
import { cn } from "@/lib/utils"

export const metadata = generateMetadata('home')

/** What a credit actually buys — so the packs below mean something. */
const LEGEND = [
  { label: "Build a résumé", cost: CREDIT_COSTS.RESUME_BUILDER },
  { label: "Tailor to a job", cost: CREDIT_COSTS.RESUME_TAILORING },
  { label: "Cover letter", cost: CREDIT_COSTS.COVER_LETTER },
  { label: "Interview prep", cost: CREDIT_COSTS.TEXT_INTERVIEW },
  { label: "Voice interview", cost: CREDIT_COSTS.VIDEO_INTERVIEW },
]

/** The pack we point most people at. */
const POPULAR_ID = "value"

export default function PricingPage() {
  const packages = Object.values(CREDIT_PACKAGES)

  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <main>
        <section className="px-6 pb-14 pt-20 text-center">
          <p className="eyebrow">Pricing</p>
          <h1 className="mx-auto mt-4 max-w-[640px] text-balance font-display text-[44px] leading-[1.06] text-ink">
            Pay for what you use. <em className="not-italic text-brand">Credits never expire.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink-muted">
            No subscription. Buy a pack, spend it whenever you&apos;re applying — there&apos;s
            no clock running.
          </p>
        </section>

        {/* What a credit buys */}
        <section className="px-6 pb-14">
          <div className="mx-auto max-w-[1000px] rounded-panel border border-border bg-card p-6 shadow-card">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              What a credit buys
            </p>

            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
              {LEGEND.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-border bg-[var(--card-plain)] px-3.5 py-2"
                >
                  <span className="text-[13px] text-ink-2">{item.label}</span>
                  {/* No action costs a single credit, so "credits" is always correct. */}
                  <span className="rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-brand">
                    {item.cost} credits
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Packs */}
        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-[1200px] gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {packages.map((pkg) => {
              const popular = pkg.id === POPULAR_ID
              const perCredit = pkg.price / pkg.credits

              return (
                <div
                  key={pkg.id}
                  className={cn(
                    "flex flex-col rounded-card border p-6 shadow-card transition-colors",
                    popular
                      ? "border-transparent bg-brand-deep text-paper"
                      : "border-border bg-card hover:border-brand"
                  )}
                >
                  {popular && (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-brand-on-dark/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-brand-on-dark">
                      Most popular
                    </span>
                  )}

                  <h2
                    className={cn(
                      "font-sans text-[15px] font-bold",
                      popular ? "text-paper" : "text-ink"
                    )}
                  >
                    {pkg.name}
                  </h2>

                  <p
                    className={cn(
                      "mt-3 font-display text-[36px] leading-none",
                      popular ? "text-paper" : "text-ink"
                    )}
                  >
                    ${pkg.price}
                  </p>

                  <p
                    className={cn(
                      "mt-2 font-mono text-[11px] tracking-[0.06em]",
                      popular ? "text-brand-on-dark" : "text-brand"
                    )}
                  >
                    {pkg.credits} credits
                  </p>

                  <p
                    className={cn(
                      "mt-1 font-mono text-[10px] tracking-[0.06em]",
                      popular ? "text-paper/50" : "text-ink-faint"
                    )}
                  >
                    ≈ {perCredit.toFixed(2)}¢ per credit
                  </p>

                  <Button
                    asChild
                    size="sm"
                    variant={popular ? "onDark" : "outline"}
                    className="mt-6 w-full"
                  >
                    <Link href="/signup">Get {pkg.credits}</Link>
                  </Button>
                </div>
              )
            })}
          </div>

          <p className="mx-auto mt-8 max-w-[560px] text-center font-mono text-[11px] leading-relaxed tracking-[0.04em] text-ink-faint">
            Every new account starts with 10 free credits. Credits never expire, and you
            can buy more at any time.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-brand-deep px-6 py-16">
          <div className="mx-auto max-w-[640px] text-center">
            <h2 className="font-display text-[32px] leading-tight text-paper">
              Try it before you pay anything.
            </h2>
            <Button asChild size="lg" variant="onDark" className="mt-6">
              <Link href="/signup">Start free — 10 credits</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
