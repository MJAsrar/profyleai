import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { TemplateGallery } from "@/components/marketing/template-gallery"

export const metadata = {
  title: "Templates",
  description:
    "ATS-safe résumé templates that survive applicant tracking systems — modern, classic, creative and ATS-optimised.",
}

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <main>
        <section className="px-6 pb-10 pt-20 text-center">
          <p className="eyebrow">Templates</p>
          <h1 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[44px] leading-[1.06] text-ink">
            Templates that survive the <em className="not-italic text-brand">robots</em>.
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink-muted">
            Every one is parseable by applicant tracking systems — no columns that scramble,
            no graphics that vanish. Pick one; you can switch any time.
          </p>
        </section>

        <TemplateGallery />
      </main>

      <SiteFooter />
    </div>
  )
}
