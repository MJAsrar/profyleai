import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"

import { Eye } from "lucide-react"

export function PreviewHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
            <Eye className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold">Resume Preview</h1>
            <p className="text-xs text-muted-foreground">View and export your resume</p>
          </div>
        </div>
      </div>
    </header>
  )
}
