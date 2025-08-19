import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, FileText, Zap, Target, CheckCircle2, Chrome } from "lucide-react"
import { PageContainer, Section } from "@/components/ui/page-container"
import { StaggeredContainer } from "@/components/ui/motion-wrapper"

export function HeroSection() {
  return (
    <Section spacing="sm" className="relative overflow-hidden pt-2">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <PageContainer maxWidth="4xl" padding="sm">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center animate-bounce-in">
            <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-muted-foreground ring-1 ring-muted border hover-glow shadow-lg shadow-green-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                AI-powered resume tailoring {""}
                <span className="font-semibold text-primary">increases interviews by 73%</span>
              </div>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance animate-fade-in-up">
            Tailor Your Resume for{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Every Job
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-balance animate-fade-in-up">
            Stop sending generic resumes. Our AI analyzes job descriptions and automatically tailors your resume 
            to match exactly what employers want. Get more interviews with personalized, ATS-optimized resumes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 animate-fade-in-up w-full max-w-2xl mx-auto">
            <Link href="https://chromewebstore.google.com/detail/profyle-job-tailoring-ass/pefncjpobdnoiodnooiefjlcboblpnlf" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="text-base touch-target hover-lift w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white border-0">
                <Chrome className="mr-2 h-4 w-4" />
                Try Chrome Extension Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="text-base bg-transparent hover-glow touch-target w-full sm:w-auto">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" size="lg" className="text-base bg-transparent hover-glow touch-target w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <StaggeredContainer 
            staggerDelay={150}
            className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Target,
                title: "Smart Job Matching",
                description: "AI analyzes job descriptions and tailors your resume automatically"
              },
              {
                icon: CheckCircle2,
                title: "ATS Optimization", 
                description: "Ensure your resume passes through applicant tracking systems"
              },
              {
                icon: Sparkles,
                title: "Keyword Integration",
                description: "Automatically incorporate relevant keywords from job postings"
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
