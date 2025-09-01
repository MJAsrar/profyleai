"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, FileText, Zap, Target, CheckCircle2, Chrome, Video, MessageSquare } from "lucide-react"
import { PageContainer, Section } from "@/components/ui/page-container"
import { StaggeredContainer } from "@/components/ui/motion-wrapper"
import { useSession } from "next-auth/react"

export function HeroSection() {
  const { data: session } = useSession()
  return (
    <Section spacing="sm" className="relative overflow-hidden pt-2">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <PageContainer maxWidth="full" padding="sm">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center animate-bounce-in">
            <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-muted-foreground ring-1 ring-muted border hover-glow shadow-lg shadow-green-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                ✨ Free to start • No credit card required {""}
                <span className="font-semibold text-primary">• 10 credits included</span>
              </div>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance animate-fade-in-up max-w-5xl mx-auto">
            Your Complete{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Career Success
            </span>
            {" "}Platform
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-8 text-muted-foreground max-w-3xl mx-auto text-balance animate-fade-in-up">
            From crafting the perfect resume to acing your dream interview - we handle it all. 
            Build ATS-beating resumes, tailor them for every job, practice with AI interviewers, 
            and get the personalized coaching you need to land your next role.
          </p>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full border">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>3x more interviews</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full border">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>85% success rate</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full border">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>50,000+ users</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full border">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>ATS-optimized</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up">
            <Link href={session ? "/dashboard" : "/signup"}>
              <Button size="lg" className="text-base touch-target hover-lift w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
                <Sparkles className="mr-2 h-4 w-4" />
                {session ? "Go to Dashboard" : "Start Free Today"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/dashboard/video-interview">
              <Button variant="outline" size="lg" className="text-base bg-transparent hover-glow touch-target w-full sm:w-auto">
                <Video className="mr-2 h-4 w-4" />
                Try AI Interview Free
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="text-center text-xs text-muted-foreground animate-fade-in-up">
            <p>✓ No credit card required • ✓ 10 free credits • ✓ Cancel anytime</p>
          </div>

          {/* Feature highlights - Grid layout */}
          <StaggeredContainer 
            staggerDelay={150}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16"
          >
            {[
              {
                icon: FileText,
                title: "Resume Builder",
                description: "Create professional, ATS-optimized resumes that get noticed by recruiters"
              },
              {
                icon: Target,
                title: "Smart Tailoring",
                description: "AI customizes your resume for each specific job posting automatically"
              },
              {
                icon: Video,
                title: "AI Interview Practice",
                description: "Practice with realistic AI interviewers and get personalized feedback"
              },
              {
                icon: CheckCircle2,
                title: "Job Landing Success",
                description: "Complete preparation from first application to final job offer"
              }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 bg-background/50 rounded-xl border hover-glow group">
                <div className="rounded-full bg-primary/10 p-4 mb-4 hover-lift group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
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
