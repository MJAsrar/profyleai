import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CREDIT_COSTS } from "@/lib/types/credits"

export const metadata: Metadata = {
  title: "Help",
  description: "Answers to the things that actually go wrong, and how to reach a person.",
}

/**
 * Help.
 *
 * The old page listed "popular articles" with view counts — "15.2k views", "12.8k views" —
 * on articles that were never written, and offered a search box that searched nothing. It
 * also advertised a LinkedIn optimisation feature the product does not have.
 *
 * This page answers the questions people actually arrive with, and every link on it goes
 * somewhere real.
 */

const ANSWERS = [
  {
    q: "I was charged and got nothing back.",
    a: (
      <>
        You shouldn&apos;t have been. Credits are taken before the work starts and{" "}
        <strong>returned automatically if it fails</strong>, so a failed generation costs you
        nothing. If your balance looks wrong, check the activity list in{" "}
        <Link href="/dashboard/settings">Settings</Link> — every spend and refund is itemised
        there. If it still looks wrong, <Link href="/contact">tell us</Link> and we&apos;ll
        put it right.
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
        asking you for the job again, it&apos;s because no target job is set yet.
      </>
    ),
  },
  {
    q: "What does each thing cost?",
    a: (
      <>
        A new résumé costs {CREDIT_COSTS.RESUME_BUILDER} credits when you first save it (edits
        and downloads after that are free), tailoring is {CREDIT_COSTS.RESUME_TAILORING}, a
        cover letter is {CREDIT_COSTS.COVER_LETTER}, practice questions are{" "}
        {CREDIT_COSTS.TEXT_INTERVIEW}, and a live voice interview is{" "}
        {CREDIT_COSTS.VIDEO_INTERVIEW}. Credits never expire, and there&apos;s no
        subscription. The full breakdown is on <Link href="/pricing">the pricing page</Link>.
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
        speak. Headphones help: without them the interviewer can hear itself and will talk
        over you.
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
        Your text is sent to the AI provider that does the work — Google, OpenAI, or
        ElevenLabs for the voice interview — because there is no way to rewrite a résumé
        without a model reading it. We don&apos;t sell your data and we don&apos;t hand it to
        advertisers. The specifics are in the{" "}
        <Link href="/privacy">privacy policy</Link>.
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
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-[760px] px-8 py-16">
        <header>
          <h1 className="font-display text-[42px] leading-[1.1] text-ink">Help</h1>
          <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-ink-muted">
            The things that actually come up. If yours isn&apos;t here, write to us — a person
            reads it.
          </p>
        </header>

        <div className="mt-12 space-y-8">
          {ANSWERS.map((item) => (
            <section key={item.q} className="border-t border-border pt-8 first:border-t-0 first:pt-0">
              <h2 className="font-display text-[22px] leading-tight text-ink">{item.q}</h2>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-2 [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-ink">
                {item.a}
              </p>
            </section>
          ))}
        </div>

        <Card className="mt-12 bg-brand-deep p-8 text-paper">
          <h2 className="font-display text-[24px] leading-tight">Still stuck?</h2>
          <p className="mt-2 max-w-[440px] text-[15px] leading-relaxed text-paper/75">
            Tell us what happened and what you expected instead. If it&apos;s a billing
            problem, include roughly when it happened and we&apos;ll find it.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="onDark">
              <Link href="/contact">Write to us</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-paper hover:bg-paper/10 hover:text-paper"
            >
              <Link href="/docs">Read how it works</Link>
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
