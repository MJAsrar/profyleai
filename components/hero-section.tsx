import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, FileText, Zap, Target, CheckCircle2, Chrome, Video, MessageSquare } from "lucide-react"
import { PageContainer, Section } from "@/components/ui/page-container"
import { StaggeredContainer } from "@/components/ui/motion-wrapper"

export function HeroSection() {
  return (
    <Section spacing="sm" className="relative overflow-hidden pt-2">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <PageContainer maxWidth="full" padding="sm">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start animate-bounce-in">
              <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-muted-foreground ring-1 ring-muted border hover-glow shadow-lg shadow-green-500/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  AI-powered career platform {""}
                  <span className="font-semibold text-primary">increases interviews by 73%</span>
                </div>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance animate-fade-in-up">
              Master Your{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Job Interview
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-balance animate-fade-in-up">
              AI-powered resume tailoring, realistic video interview practice, and personalized career coaching. 
              Get job-ready with our comprehensive platform that adapts to every opportunity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 animate-fade-in-up">
              <Link href="/signup">
                <Button size="lg" className="text-base touch-target hover-lift w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/dashboard/video-interview">
                <Button variant="outline" size="lg" className="text-base bg-transparent hover-glow touch-target w-full sm:w-auto">
                  <Video className="mr-2 h-4 w-4" />
                  Try AI Interview
                </Button>
              </Link>
            </div>

            {/* Feature highlights */}
            <StaggeredContainer 
              staggerDelay={150}
              className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-1 max-w-2xl mx-auto lg:mx-0"
            >
              {[
                {
                  icon: Video,
                  title: "AI Video Interviews",
                  description: "Practice with realistic AI interviewers tailored to your specific role"
                },
                {
                  icon: Target,
                  title: "Smart Resume Tailoring",
                  description: "AI analyzes job descriptions and optimizes your resume automatically"
                },
                {
                  icon: CheckCircle2,
                  title: "ATS Optimization",
                  description: "Ensure your applications pass through applicant tracking systems"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-left group lg:justify-start justify-center">
                  <div className="rounded-full bg-primary/10 p-3 mr-4 hover-lift group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </StaggeredContainer>
          </div>

          {/* Right side - GIF placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Placeholder for GIF */}
              <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden">
                <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">AI Interview Demo</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Watch how our AI conducts realistic interviews
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    GIF Placeholder
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse delay-1000">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  )
}
