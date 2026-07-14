import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { ContactForm } from "@/components/marketing/contact-form"
import { Monogram } from "@/components/ui/monogram"

export const metadata = {
  title: "Contact",
  description: "Talk to a human at ProfyleAI — support, billing and privacy questions.",
}

const INQUIRIES = [
  {
    code: "SU",
    tone: "brand" as const,
    label: "Support",
    desc: "Something's broken, or a generation didn't come out right.",
  },
  {
    code: "BI",
    tone: "clay" as const,
    label: "Billing",
    desc: "Credits, refunds, or a charge you don't recognise.",
  },
  {
    code: "PR",
    tone: "indigo" as const,
    label: "Privacy",
    desc: "Data export, deletion, or a question about what we store.",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-20">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="mt-4 font-display text-[44px] leading-[1.06] text-ink">
              Talk to a human.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-muted">
              A real person reads every message. If something went wrong with a paid
              generation, say so — we&apos;ll make it right.
            </p>

            <ul className="mt-10 space-y-5">
              {INQUIRIES.map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <Monogram tone={item.tone}>{item.code}</Monogram>
                  <div>
                    <p className="text-[15px] font-bold text-ink">{item.label}</p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-ink-muted">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-border pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Or email us
              </p>
              <a
                href="mailto:support@profyleai.com"
                className="mt-1.5 block text-[16px] font-semibold text-brand underline-offset-4 hover:underline"
              >
                support@profyleai.com
              </a>
              <p className="mt-2 font-mono text-[11px] tracking-[0.04em] text-ink-faint">
                Replies within one working day.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
