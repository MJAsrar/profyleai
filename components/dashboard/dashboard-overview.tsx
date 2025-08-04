import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Eye, MessageSquare, Linkedin, Users, Plus, Target } from "lucide-react"
import Link from "next/link"

export function DashboardOverview() {
  const tools = [
    {
      title: "Resume Builder",
      description: "Create and edit your professional resume",
      icon: FileText,
      href: "/dashboard/resume-builder",
      gradient: "from-slate-600 to-slate-700",
    },
    {
      title: "Resume Tailoring",
      description: "Tailor your resume for specific job postings",
      icon: Target,
      href: "/dashboard/resume-tailoring",
      gradient: "from-slate-600 to-slate-700",
    },
    {
      title: "Resume Preview",
      description: "View and export your resume as PDF",
      icon: Eye,
      href: "/dashboard/preview",
      gradient: "from-slate-600 to-slate-700",
    },
    {
      title: "Cover Letter",
      description: "Generate personalized cover letters",
      icon: MessageSquare,
      href: "/dashboard/cover-letter",
      gradient: "from-slate-600 to-slate-700",
    },
    {
      title: "LinkedIn Optimizer",
      description: "Optimize your LinkedIn profile",
      icon: Linkedin,
      href: "/dashboard/linkedin",
      gradient: "from-slate-600 to-slate-700",
    },
    {
      title: "Interview Prep",
      description: "Practice with AI-generated questions",
      icon: Users,
      href: "/dashboard/interview",
      gradient: "from-slate-600 to-slate-700",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-lg text-muted-foreground">Continue building your perfect resume with AI assistance.</p>
      </div>

      {/* Tools Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Resume Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Card key={tool.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 bg-gradient-to-br ${tool.gradient} shadow-sm`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold leading-none">{tool.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                  <Link href={tool.href} className="block">
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Open Tool
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/resume-builder">
                  <Button variant="outline" className="h-11 px-6 bg-background hover:bg-muted/50 transition-colors">
                    <Plus className="mr-2 h-4 w-4" />
                    New Resume
                  </Button>
                </Link>
                <Link href="/dashboard/cover-letter">
                  <Button variant="outline" className="h-11 px-6 bg-background hover:bg-muted/50 transition-colors">
                    <Plus className="mr-2 h-4 w-4" />
                    New Cover Letter
                  </Button>
                </Link>
                <Link href="/dashboard/preview">
                  <Button variant="outline" className="h-11 px-6 bg-background hover:bg-muted/50 transition-colors">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Resume
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
