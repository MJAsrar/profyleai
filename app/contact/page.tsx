import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { ContactForm, CONTACT_EMAIL } from "@/components/marketing/contact-form"

export const metadata = {
  title: "Contact",
  description: "Get in touch with ProfyleAI.",
}

/**
 * Contact, to the design.
 *
 * The design promised "we reply within one business day" and printed support hours of
 * Mon–Fri 9–6 ET. Neither is a thing this project can honour, so neither is claimed.
 */
const ROUTES = [
  {
    code: "GE",
    title: "General questions",
    blurb: "About the product or your account",
  },
  {
    code: "BI",
    title: "Billing & credits",
    blurb: "Payments, refunds, credit balance",
  },
  {
    code: "TE",
    title: "Technical support",
    blurb: "Something isn't working right",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden bg-[#f6f3ec]">
        <PublicNav />

        <main className="grid gap-14 px-6 py-16 sm:px-[52px] lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="mb-[18px] font-mono text-[13px] tracking-[0.16em] text-[#2e6a4a]">
              CONTACT
            </p>

            <h1 className="mb-4 font-display text-[36px] font-medium leading-[1.05] tracking-[-0.015em] text-[#211f1c] sm:text-[44px]">
              Talk to a human.
            </h1>

            <p className="mb-[30px] max-w-[400px] text-[17px] leading-[1.6] text-[#5c564d]">
              Say what your message is about so it reaches the right person faster. A person
              reads every one of these.
            </p>

            <ul className="mb-[30px] flex flex-col gap-[14px]">
              {ROUTES.map((route) => (
                <li key={route.code} className="flex items-center gap-[13px]">
                  <span
                    aria-hidden="true"
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#e7efe8] font-mono text-[12px] font-bold text-[#2e6a4a]"
                  >
                    {route.code}
                  </span>

                  <span>
                    <span className="block text-[15px] font-semibold text-[#211f1c]">
                      {route.title}
                    </span>
                    <span className="block text-[13px] text-[#8a837a]">{route.blurb}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-[rgba(33,31,28,.1)] pt-5">
              <p className="mb-1.5 font-mono text-[11px] tracking-[0.08em] text-[#8a837a]">
                EMAIL US DIRECTLY
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[16px] font-semibold text-[#2e6a4a] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <ContactForm />
        </main>

        <div className="border-t border-[rgba(33,31,28,.08)]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
