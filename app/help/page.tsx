import type { Metadata } from "next"
import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { Monogram, type MonogramTone } from "@/components/ui/monogram"
import { CREDIT_COSTS } from "@/lib/types/credits"

export const metadata: Metadata = {
  title: "Help",
  description: "Answers to the things that actually go wrong, and how to reach a person.",
}

/**
 * Help, on the prototype's layout.
 *
 * Three things in the prototype aren't here, because nothing sits behind them:
 *
 *  - The article search box. There is no article index to search.
 *  - "Popular articles" with view counts. Those articles were never written, and the
 *    counts (15.2k, 12.8k) were invented.
 *  - "Our team replies within one business day." There is no support team on a rota, so
 *    that's a promise this project cannot keep.
 *
 * Every card below points somewhere real, and the answers are underneath rather than behind
 * links to pages that don't exist.
 */

const CATEGORIES: Array<{
  code: string
  tone: MonogramTone
  title: string
  blurb: string
  href: string
}> = [
  {
    code: "GS",
    tone: "brand",
    title: "Getting started",
    blurb: "Accounts, credits, and your first résumé",
    href: "/docs#quick-start",
  },
  {
    code: "RT",
    tone: "olive",
    title: "Résumés & templates",
    blurb: "Building, editing, exporting, and ATS",
    href: "/docs#template",
  },
  {
    code: "AI",
    tone: "indigo",
    title: "AI tools",
    blurb: "Tailoring, cover letters, and interviews",
    href: "/docs#tailoring",
  },
  {
    code: "CB",
    tone: "clay",
    title: "Credits & billing",
    blurb: "Packages, checkout, and refunds",
    href: "/pricing",
  },
  {
    code: "AP",
    tone: "brand",
    title: "Account & privacy",
    blurb: "Your profile, your data, and deleting it",
    href: "/privacy",
  },
  {
    code: "TS",
    tone: "olive",
    title: "Troubleshooting",
    blurb: "Exports, sign-in, and error messages",
    href: "#answers",
  },
]

const ANSWERS = [
  {
    q: "I was charged and got nothing back.",
    a: (
      <>
        You shouldn&apos;t have been. Credits are taken before the work starts and{" "}
        <strong>returned automatically if it fails</strong>, so a failed generation costs you
        nothing. If your balance looks wrong, the activity list in{" "}
        <Link href="/dashboard/settings">Settings</Link> itemises every spend and refund. If
        it still looks wrong, <Link href="/contact">tell us</Link> and we&apos;ll put it
        right.
      </>
    ),
  },
  {
    q: "Do I have to paste the job description into every tool?",
    a: (
      <>
        No — that&apos;s the whole point. Paste it once when you{" "}
        <Link href="/dashboard/resume-tailoring">tailor your résumé</Link>, and it carries
        into the cover letter, the practice questions and the voice interview. If a tool is
        asking for the job again, it&apos;s because no target job is set yet.
      </>
    ),
  },
  {
    q: "What does each thing cost?",
    a: (
      <>
        A new résumé is {CREDIT_COSTS.RESUME_BUILDER} credits, charged when you first save it
        — editing and exporting it afterwards is free. Tailoring is{" "}
        {CREDIT_COSTS.RESUME_TAILORING}, a cover letter {CREDIT_COSTS.COVER_LETTER}, practice
        questions {CREDIT_COSTS.TEXT_INTERVIEW}, and a live voice interview{" "}
        {CREDIT_COSTS.VIDEO_INTERVIEW}. Credits never expire and there&apos;s no subscription.
        The full breakdown is on <Link href="/pricing">the pricing page</Link>.
      </>
    ),
  },
  {
    q: "The voice interview can't hear me.",
    a: (
      <>
        Your browser has to be allowed to use the microphone — look for the blocked-mic icon
        in the address bar and allow it for this site. The setup screen tests your mic{" "}
        <strong>before</strong> you&apos;re charged, and the level bar should move when you
        speak. Headphones help: without them the interviewer hears itself and talks over you.
      </>
    ),
  },
  {
    q: "Will the AI write my résumé for me?",
    a: (
      <>
        It will rewrite what you give it, and it&apos;s good at that. It can&apos;t know what
        you actually did, so it can&apos;t invent your history — and you shouldn&apos;t let it
        try. <strong>Read everything before you send it to an employer.</strong> Your name is
        the one on it.
      </>
    ),
  },
  {
    q: "Is my résumé used to train an AI model?",
    a: (
      <>
        Your text is sent to the provider doing the work — Google, OpenAI, or ElevenLabs for
        the voice interview — because there is no way to rewrite a résumé without a model
        reading it. We don&apos;t sell your data and we don&apos;t hand it to advertisers. The
        specifics are in the <Link href="/privacy">privacy policy</Link>.
      </>
    ),
  },
  {
    q: "How do I get my data out, or delete my account?",
    a: (
      <>
        Both live in <Link href="/dashboard/settings">Settings</Link>, under &ldquo;Your
        data&rdquo;. You can download everything you&apos;ve written as a single file, and you
        can delete the account outright. Deletion is permanent and unspent credits aren&apos;t
        refunded, so export first if you want a copy.
      </>
    ),
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden bg-[#f6f3ec]">
        <PublicNav />

        <main>
          {/* ---- Hero ---- */}
          <section className="px-6 pb-10 pt-16 text-center sm:px-14">
            <p className="mb-[18px] font-mono text-[13px] tracking-[0.16em] text-[#2e6a4a]">
              HELP CENTRE
            </p>

            <h1 className="font-display text-[36px] font-medium leading-[1.04] tracking-[-0.015em] text-[#211f1c] sm:text-[48px]">
              How can we help?
            </h1>
          </section>

          {/* ---- Categories ---- */}
          <section className="grid gap-4 px-6 pb-14 sm:px-14 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.code}
                href={cat.href}
                className="flex items-center gap-[13px] rounded-[14px] border border-[rgba(33,31,28,.08)] bg-[#fffdf8] p-5 transition-colors hover:border-[#2e6a4a] hover:shadow-[0_16px_40px_-30px_rgba(30,25,20,.4)]"
              >
                <Monogram tone={cat.tone}>{cat.code}</Monogram>

                <span className="min-w-0">
                  <span className="block text-[16px] font-bold text-[#211f1c]">
                    {cat.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[1.5] text-[#6f685f]">
                    {cat.blurb}
                  </span>
                </span>
              </Link>
            ))}
          </section>

          {/* ---- The answers themselves ---- */}
          <section
            id="answers"
            className="mx-auto max-w-[760px] scroll-mt-8 px-6 pb-14 sm:px-14"
          >
            <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a837a]">
              The things that actually come up
            </p>

            {ANSWERS.map((item) => (
              <div key={item.q} className="border-t border-[rgba(33,31,28,.1)] py-6">
                <h2 className="mb-2.5 text-[17px] font-semibold text-[#211f1c]">{item.q}</h2>
                <p className="text-[15px] leading-[1.7] text-[#5c564d] [&_a]:font-semibold [&_a]:text-[#2e6a4a] [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-[#211f1c]">
                  {item.a}
                </p>
              </div>
            ))}
          </section>

          {/* ---- Still stuck ---- */}
          <section className="px-6 pb-16 sm:px-14">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-[#22322a] px-[30px] py-7">
              <div>
                <p className="text-[18px] font-bold text-[#f4efe6]">Still stuck?</p>
                <p className="mt-1 text-[14px] text-[#a9b7ad]">
                  Tell us what happened and what you expected instead. A person reads it.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex shrink-0 rounded-[12px] bg-[#f4efe6] px-[22px] py-3.5 text-[15px] font-bold text-[#22322a] hover:bg-white"
              >
                Contact support
              </Link>
            </div>
          </section>
        </main>

        <div className="border-t border-[rgba(33,31,28,.08)]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
