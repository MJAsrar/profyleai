import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { TemplateCarousel } from "@/components/template-carousel"
import { ChromeExtensionBanner } from "@/components/chrome-extension-banner"
import { PricingSection } from "@/components/pricing-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"
import { MotionWrapper } from "@/components/ui/motion-wrapper"
import { generateMetadata, softwareApplicationSchema } from "@/lib/seo-config"

export const metadata = generateMetadata('home')

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="overflow-hidden">
          <MotionWrapper animation="fade-in-down" delay={0}>
            <HeroSection />
          </MotionWrapper>
          <MotionWrapper animation="fade-in-up" delay={200}>
            <FeaturesSection />
          </MotionWrapper>
          <MotionWrapper animation="fade-in-up" delay={300}>
            <TemplateCarousel />
          </MotionWrapper>
          <MotionWrapper animation="fade-in-up" delay={400}>
            <ChromeExtensionBanner />
          </MotionWrapper>
          <MotionWrapper animation="fade-in-up" delay={500}>
            <PricingSection />
          </MotionWrapper>
          <MotionWrapper animation="fade-in-up" delay={600}>
            <TestimonialsSection />
          </MotionWrapper>
        </main>
        <MotionWrapper animation="fade-in" delay={700}>
          <Footer />
        </MotionWrapper>
      </div>
    </>
  )
}
