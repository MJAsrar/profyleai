import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { PathRail } from "@/components/marketing/path-rail"
import { Button } from "@/components/ui/button"
import { TemplateCarousel } from "@/components/template-carousel"
import { generateMetadata, softwareApplicationSchema } from "@/lib/seo-config"

export const metadata = generateMetadata('home')

/** What the shared job profile actually captures — shown as a real artifact. */
const JOB_PROFILE = [
  { label: "Role", value: "Product Analyst" },
  { label: "Company", value: "Northwind Labs" },
  { label: "Must have", value: "SQL · Dashboards · Stakeholder comms" },
]

const USES = [
  "Your résumé is rewritten against this exact posting.",
  "Your cover letter cites the company, not a template.",
  "Your practice questions come from this role, not a generic list.",
  "Your mock interviewer knows what you applied for.",
]

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />

      <div className="min-h-screen bg-paper">
        <PublicNav announcement />

        <main>
          {/* ---- Hero ---- */}
          <section className="px-6 pb-16 pt-20 sm:pt-24">
            <div className="mx-auto max-w-[800px] text-center">
              <p className="eyebrow">For your first real job</p>

              <h1 className="mt-5 text-balance font-display text-[44px] leading-[1.04] tracking-[-0.015em] text-ink sm:text-[60px]">
                Everything you need to be{" "}
                <em className="font-medium italic text-brand">ready</em>.
              </h1>

              <p className="mx-auto mt-6 max-w-[560px] text-[19px] leading-relaxed text-ink-muted">
                Paste the job you want. ProfyleAI writes the résumé, the cover letter and
                the interview prep around that one posting — so every piece actually fits.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">Start free — 10 credits</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/docs">See how it works</Link>
                </Button>
              </div>

              <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-ink-faint">
                No card required · Credits never expire
              </p>
            </div>
          </section>

          {/* ---- Your path ---- */}
          <section className="px-6 pb-20">
            <div className="mx-auto max-w-[1100px]">
              <PathRail />
            </div>
          </section>

          {/* ---- One job description ---- */}
          <section className="border-y border-border bg-section-tint px-6 py-20">
            <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="eyebrow">Captured once</p>
                <h2 className="mt-3 max-w-md font-display text-[36px] leading-tight text-ink">
                  Stop re-typing the same job into five different tools.
                </h2>

                <ul className="mt-7 space-y-3.5">
                  {USES.map((use) => (
                    <li key={use} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-bold text-brand"
                      >
                        ✓
                      </span>
                      <span className="text-[15px] leading-relaxed text-ink-2">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The job profile as a tangible object. */}
              <div className="rounded-panel border border-border bg-[var(--card-plain)] p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    Job profile
                  </p>
                  <span className="rounded-full bg-brand-tint px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] text-brand">
                    Captured once
                  </span>
                </div>

                <dl className="mt-6 space-y-5">
                  {JOB_PROFILE.map((row) => (
                    <div key={row.label}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-[16px] font-semibold text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 border-t border-border pt-5">
                  <p className="font-mono text-[11px] leading-relaxed tracking-[0.04em] text-ink-faint">
                    → flows into résumé, cover letter, prep &amp; mock interview
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---- Templates ---- */}
          <TemplateCarousel />

          {/* ---- CTA band ---- */}
          <section className="bg-brand-deep px-6 py-20">
            <div className="mx-auto max-w-[720px] text-center">
              <h2 className="text-balance font-display text-[38px] leading-tight text-paper">
                Your next job starts with one posting.
              </h2>
              <p className="mx-auto mt-4 max-w-[480px] text-[17px] leading-relaxed text-paper/70">
                Ten credits free when you sign up — enough to tailor a résumé, write a
                cover letter and prep for the interview.
              </p>

              <Button asChild size="lg" variant="onDark" className="mt-8">
                <Link href="/signup">Start free — 10 credits</Link>
              </Button>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
