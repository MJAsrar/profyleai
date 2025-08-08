import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"

export function InterviewHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b overflow-hidden">
      <div className="flex items-center gap-2 px-2 sm:px-3 min-w-0 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
        <div className="min-w-0 flex-1">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-xs sm:text-sm">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs sm:text-sm truncate">Interview Prep</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  )
}
