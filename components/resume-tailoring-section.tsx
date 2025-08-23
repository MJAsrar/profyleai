import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Zap, CheckCircle2, ArrowRight, Sparkles, FileText, Trophy, Video } from "lucide-react"
import Link from "next/link"

export function ResumeTailoringSection() {
  const tailoringSteps = [
    {
      step: "1",
      title: "Upload Your Base Resume",
      description: "Start with your existing resume or create one using our AI-powered builder",
      icon: FileText,
      color: "blue"
    },
    {
      step: "2", 
      title: "Paste Job Description",
      description: "Copy the job posting you're applying for and paste it into our analyzer",
      icon: Target,
      color: "green"
    },
    {
      step: "3",
      title: "AI Analysis & Optimization",
      description: "Our AI identifies key requirements and optimizes your resume accordingly",
      icon: Sparkles,
      color: "purple"
    },
    {
      step: "4",
      title: "Get Your Tailored Resume",
      description: "Download your perfectly tailored resume that matches the job requirements",
      icon: Trophy,
      color: "orange"
    }
  ]

  const benefits = [
    "Increase ATS pass-through rates by 73%",
    "Match exact keywords from job descriptions",
    "Highlight relevant experience automatically",
    "Optimize for specific industries and roles",
    "Generate tailored content suggestions",
    "Ensure perfect formatting for each application"
  ]

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400", 
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      <div className="content-container">
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Target className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Tailor Your Resume for Every Job
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Stop sending generic resumes. Our AI-powered tailoring engine analyzes job descriptions and 
              optimizes your resume to match exactly what employers are looking for, dramatically increasing 
              your chances of getting interviews.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-950/20 rounded-full">
              <Zap className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                73% higher interview rate with tailored resumes
              </span>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-12">How Resume Tailoring Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tailoringSteps.map((step, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                        {step.step}
                      </div>
                      <step.icon className={`h-6 w-6 ${step.color === 'blue' ? 'text-blue-500' : step.color === 'green' ? 'text-green-500' : step.color === 'purple' ? 'text-purple-500' : 'text-orange-500'}`} />
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {index < tailoringSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <CheckCircle2 className="h-6 w-6 text-blue-600 mr-3" />
                Why Tailoring Matters
              </h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Sparkles className="h-6 w-6 text-green-600 mr-3" />
                AI-Powered Intelligence
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Smart Keyword Matching</p>
                    <p className="text-xs text-muted-foreground">Automatically identifies and incorporates relevant keywords from job postings</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Content Optimization</p>
                    <p className="text-xs text-muted-foreground">Rewrites bullet points to emphasize skills mentioned in the job description</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Trophy className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Industry Expertise</p>
                    <p className="text-xs text-muted-foreground">Trained on thousands of successful resumes across all industries</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <h3 className="text-2xl font-bold mb-4">Ready to Ace Your Next Interview?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Tailor your resume and practice with AI interviewers to dramatically increase your success rate
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Free - No Credit Card
                  </Button>
                </Link>
                <Link href="/dashboard/video-interview">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Video className="mr-2 h-4 w-4" />
                    Try AI Interview
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    <FileText className="mr-2 h-4 w-4" />
                    View Templates
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}