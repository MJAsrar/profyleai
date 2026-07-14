import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { TemplateGallery } from "@/components/marketing/template-gallery"

export const metadata = {
  title: "Templates",
  description:
    "Résumé templates tuned for applicant tracking systems — pick one and edit it in the builder.",
}

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] overflow-hidden bg-[#f6f3ec]">
        <PublicNav />

        <main>
          <section className="px-6 pb-[34px] pt-[72px] text-center sm:px-14">
            <p className="mb-5 font-mono text-[13px] tracking-[0.16em] text-[#2e6a4a]">
              TEMPLATES
            </p>

            <h1 className="mx-auto mb-[18px] max-w-[760px] font-display text-[38px] font-medium leading-[1.04] tracking-[-0.015em] text-[#211f1c] sm:text-[52px]">
              Résumé templates recruiters actually open.
            </h1>

            <p className="mx-auto max-w-[560px] text-[18px] leading-[1.55] text-[#5c564d]">
              Layouts tuned for applicant-tracking systems. Pick one and edit it in the
              builder — or start from a blank page.
            </p>
          </section>

          <TemplateGallery />
        </main>

        <div className="border-t border-[rgba(33,31,28,.08)]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
