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
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden bg-[#f6f3ec]">
        <PublicNav />

        <main>
          <section className="px-6 pb-10 pt-16 text-center sm:px-12">
            <p className="mb-[18px] font-mono text-[13px] tracking-[0.16em] text-[#2e6a4a]">
              FAQ
            </p>

            <h1 className="mb-[14px] font-display text-[36px] font-medium leading-[1.04] tracking-[-0.015em] text-[#211f1c] sm:text-[48px]">
              Questions, answered.
            </h1>

            <p className="text-[17px] text-[#5c564d]">
              Everything about credits, privacy, and how the tools fit together.
            </p>
          </section>

          <section className="mx-auto max-w-[900px] px-6 pb-5 sm:px-12">
            {GROUPS.map((group, gi) => (
              <div key={group.label}>
                <p
                  className={`mb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a837a] ${
                    gi === 0 ? "mt-2" : "mt-[26px]"
                  }`}
                >
                  {group.label}
                </p>

                {group.items.map((item, i) => (
                  <details
                    key={item.q}
                    open={gi === 0 && i === 0}
                    className={`group border-t border-[rgba(33,31,28,.1)] ${
                      gi === GROUPS.length - 1 && i === group.items.length - 1
                        ? "border-b"
                        : ""
                    }`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-1 py-5 text-[17px] font-semibold text-[#211f1c] [&::-webkit-details-marker]:hidden">
                      {item.q}

                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#e7efe8] text-[16px] text-[#2e6a4a]"
                      >
                        <span className="group-open:hidden">+</span>
                        <span className="hidden group-open:inline">−</span>
                      </span>
                    </summary>

                    <p className="max-w-[760px] px-1 pb-[22px] text-[15px] leading-[1.6] text-[#5c564d]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            ))}
          </section>

          <p className="px-6 pb-14 pt-[14px] text-center sm:px-12">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#2e6a4a] hover:text-[#26583d]"
            >
              Still have a question? Contact us →
            </Link>
          </p>
        </main>

        <div className="border-t border-[rgba(33,31,28,.08)]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
