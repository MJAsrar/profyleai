import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, FileText, Zap } from "lucide-react"
import { PageContainer, Section } from "@/components/ui/page-container"
import { StaggeredContainer } from "@/components/ui/motion-wrapper"

export function HeroSection() {
  return (
    <Section spacing="lg" className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <PageContainer maxWidth="4xl" padding="lg">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center animate-bounce-in">
            <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-muted-foreground ring-1 ring-muted border hover-glow">
              AI-powered resume building {""}
              <span className="font-semibold text-primary">now available</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance animate-fade-in-up">
            Build Your Perfect Resume with{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI Assistance
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-balance animate-fade-in-up">
            Create professional resumes, cover letters, and optimize your LinkedIn profile with our AI-powered platform.
            Get hired faster with personalized content and beautiful templates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up">
            <Link href="/signup">
              <Button size="lg" className="text-base touch-target hover-lift w-full sm:w-auto">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base bg-transparent hover-glow touch-target w-full sm:w-auto">
                See Features
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <StaggeredContainer 
            staggerDelay={150}
            className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Sparkles,
                title: "AI-Enhanced Content",
                description: "Generate compelling content with AI assistance"
              },
              {
                icon: FileText,
                title: "Professional Templates", 
                description: "Choose from dozens of ATS-friendly templates"
              },
              {
                icon: Zap,
                title: "Real-time Preview",
                description: "See changes instantly as you build"
              }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="rounded-full bg-primary/10 p-4 mb-4 hover-lift group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </PageContainer>
    </Section>
  )
}
