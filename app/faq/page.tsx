import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { CREDIT_COSTS } from "@/lib/types/credits"

export const metadata = {
  title: "FAQ",
  description: "Answers about credits, billing, privacy and how ProfyleAI works.",
}

const GROUPS = [
  {
    label: "General",
    items: [
      {
        q: "What actually is ProfyleAI?",
        a: "You paste the job you're going for, once. We then build everything around that one posting: a résumé tailored to it, a cover letter that cites the company, interview questions drawn from the role, and a live mock interview with an AI. It's one thread, not five disconnected tools.",
      },
      {
        q: "Do I need to be a good writer?",
        a: "No. You give us the raw material — where you worked, what you did — and the AI turns it into something a hiring manager will actually read. You stay in control of every word; nothing is published without you.",
      },
      {
        q: "Will my résumé get through an ATS?",
        a: "Our templates are built to be machine-parseable: no multi-column layouts that scramble, no graphics that vanish, no text trapped in images. The ATS-tagged template is the safest choice if you're applying through a big company's portal.",
      },
    ],
  },
  {
    label: "Credits & billing",
    items: [
      {
        q: "How do credits work?",
        a: `You buy a pack and spend it as you go. Building a résumé costs ${CREDIT_COSTS.RESUME_BUILDER}, tailoring it ${CREDIT_COSTS.RESUME_TAILORING}, a cover letter ${CREDIT_COSTS.COVER_LETTER}, interview prep ${CREDIT_COSTS.TEXT_INTERVIEW}, and a live voice interview ${CREDIT_COSTS.VIDEO_INTERVIEW}. There's no subscription.`,
      },
      {
        q: "Do credits expire?",
        a: "No. There's no clock running. Buy a pack now, use it across a job hunt that takes six months if that's how long it takes.",
      },
      {
        q: "What if an AI generation fails?",
        a: "You aren't charged. Credits are reserved before the work runs and refunded automatically if it doesn't deliver — you'll never pay for something you didn't receive.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes. Contact us and we'll refund unused credits. If we refund a purchase, the credits it bought are removed from your balance.",
      },
    ],
  },
  {
    label: "Privacy & data",
    items: [
      {
        q: "Who can see my résumé?",
        a: "Only you. Your résumés, cover letters and interview transcripts are private to your account and are never shown to other users.",
      },
      {
        q: "Do you train AI models on my data?",
        a: "No. Your content is sent to the model to generate your output and is not used to train anything.",
      },
      {
        q: "Can I delete everything?",
        a: "Yes — Settings → Data lets you export everything you've given us, or delete your account and its contents outright.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <main className="mx-auto max-w-[1000px] px-6 pb-20 pt-20">
        <div className="text-center">
          <p className="eyebrow">FAQ</p>
          <h1 className="mt-4 font-display text-[44px] leading-[1.06] text-ink">
            Questions, answered plainly.
          </h1>
        </div>

        <div className="mt-14 space-y-12">
          {GROUPS.map((group) => (
            <section key={group.label}>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand">
                {group.label}
              </h2>

              <div className="mt-4 divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
                {group.items.map((item, i) => (
                  <details
                    key={item.q}
                    className="group"
                    open={group.label === "General" && i === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-ink transition-colors hover:bg-section-tint/50 [&::-webkit-details-marker]:hidden">
                      {item.q}

                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-section-tint font-mono text-[13px] text-ink-muted transition-colors group-open:bg-brand-tint group-open:text-brand"
                      >
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:inline">−</span>
                      </span>
                    </summary>

                    <div className="px-5 pb-5 pr-14">
                      <p className="text-[15px] leading-relaxed text-ink-muted">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-center text-[15px] text-ink-muted">
          Still stuck?{" "}
          <Link href="/contact" className="font-semibold text-brand underline-offset-4 hover:underline">
            Contact us →
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
