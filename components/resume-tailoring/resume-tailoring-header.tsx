import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { RotateCcw, Target, Sparkles } from "lucide-react"

interface ResumeTailoringHeaderProps {
  onReset?: () => void
  showReset?: boolean
}

export function ResumeTailoringHeader({ onReset, showReset = false }: ResumeTailoringHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Streamlined Header */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold">Resume Tailoring</h1>
              <p className="text-xs text-muted-foreground">Optimize for specific job postings</p>
            </div>
          </div>
        </div>

        {showReset && (
          <div className="ml-auto mr-4">
            <Button variant="outline" onClick={onReset} size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          </div>
        )}
      </header>

      {/* Simplified Info Section */}
      <div className="px-4">
        <div className="rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 p-4 border border-muted/50">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm">AI-Powered Tailoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Provide job details and our AI will optimize your resume to highlight relevant skills, 
                experience, and keywords that match employer requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}