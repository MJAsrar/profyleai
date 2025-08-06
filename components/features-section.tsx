import Link from "next/link"
import { FileText, Linkedin, MessageSquare, Users, Download, Sparkles, Target, CheckCircle2 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Resume Tailoring",
      description: "Automatically customize your resume for each job application using AI analysis of job descriptions.",
      link: "/signup",
      linkText: "Start Tailoring",
      featured: true
    },
    {
      icon: CheckCircle2,
      title: "ATS Optimization",
      description: "Ensure your resume passes applicant tracking systems with keyword optimization and formatting.",
    },
    {
      icon: FileText,
      title: "Resume Builder",
      description: "Create professional resumes with step-by-step guidance and real-time preview.",
      link: "/templates",
      linkText: "Browse Templates"
    },
    {
      icon: MessageSquare,
      title: "Cover Letter Generator",
      description: "Generate personalized cover letters that match your resume and target job.",
    },
    {
      icon: Linkedin,
      title: "LinkedIn Optimizer",
      description: "Optimize your LinkedIn profile to attract recruiters and opportunities.",
    },
    {
      icon: Sparkles,
      title: "AI Enhancement",
      description: "Improve your content with AI suggestions and industry best practices.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to land your dream job</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform tailors your resume for each application, dramatically increasing your chances of getting interviews.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature: any) => (
            <div
              key={feature.title}
              className={`relative rounded-lg border bg-background p-6 hover:shadow-md transition-shadow ${
                feature.featured 
                  ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg' 
                  : ''
              }`}
            >
              {feature.featured && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    FEATURED
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`rounded-md p-2 ${feature.featured ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
              {feature.link && (
                <Link href={feature.link} className="text-sm text-primary hover:underline font-medium">
                  {feature.linkText} →
                </Link>
              )}
            </div>
                      ))}
          </div>
        </div>
      </div>
    </section>
  )
}
