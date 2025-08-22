"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { FileText, Eye, MessageSquare, Users, Settings, Sparkles, User, Target, FolderOpen, Video } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreditBalance } from "@/components/credits/credit-balance"
import { CREDIT_COSTS } from "@/lib/types/credits"

const resumeTools = [
  {
    title: "Resume Builder",
    url: "/dashboard/resume-builder",
    icon: FileText,
    description: "Create & edit resumes",
    credits: CREDIT_COSTS.RESUME_BUILDER
  },
  {
    title: "Resume Tailoring",
    url: "/dashboard/resume-tailoring",
    icon: Target,
    description: "Optimize for jobs",
    credits: CREDIT_COSTS.RESUME_TAILORING
  },
  {
    title: "View Resumes",
    url: "/dashboard/view-resumes",
    icon: FolderOpen,
    description: "Manage your resumes",
    credits: null // Free action
  },
  {
    title: "Preview & Export",
    url: "/dashboard/preview",
    icon: Eye,
    description: "View & download",
    credits: null // Free action
  },
]

const additionalTools = [
  {
    title: "Cover Letter",
    url: "/dashboard/cover-letter",
    icon: MessageSquare,
    description: "Generate cover letters",
    credits: CREDIT_COSTS.COVER_LETTER
  },
  {
    title: "Interview Prep",
    url: "/dashboard/interview",
    icon: Users,
    description: "Practice interviews",
    credits: CREDIT_COSTS.TEXT_INTERVIEW
  },
  {
    title: "Video Interview",
    url: "/dashboard/video-interview",
    icon: Video,
    description: "AI video interview practice",
    credits: CREDIT_COSTS.VIDEO_INTERVIEW
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Account & preferences",
    credits: null // Free action
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="py-4 px-2 hover:bg-sidebar-accent/50">
              <Link href="/dashboard">
                <div className="flex items-center justify-center w-full">
                  <img src="/logo.png" alt="Profyle AI Resume Builder Dashboard" className="h-8 w-auto max-w-[160px]" />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* Credit Balance */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 pb-2">
              <CreditBalance 
                showDetails={false}
                showPurchaseButton={true}
                autoRefresh={true}
                refreshInterval={15000}
                className="border-0 shadow-none bg-sidebar-accent/20 text-xs"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Core Resume Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2">
            Resume Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {resumeTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="px-3 py-2 rounded-md hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.credits !== null && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                              {item.credits}c
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sidebar-foreground/50 leading-tight">{item.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Additional Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2">
            Additional Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {additionalTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="px-3 py-2 rounded-md hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.credits !== null && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                              {item.credits}c
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sidebar-foreground/50 leading-tight">{item.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="p-3 hover:bg-sidebar-accent/50 rounded-md">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {session?.user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {session?.user?.email || "user@example.com"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] mb-2">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  // Notify extension about logout before signing out
                  try {
                    await fetch('/api/auth/extension-logout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: session?.user?.id })
                    })
                  } catch (error) {
                    console.error('Failed to notify extension about logout:', error)
                  }
                  
                  // Also set a logout flag that extension can check
                  try {
                    localStorage.setItem('profyle-extension-logout', Date.now().toString())
                  } catch (error) {
                    console.error('Failed to set logout flag:', error)
                  }
                  
                  // Proceed with regular logout
                  signOut({ callbackUrl: "/" })
                }} className="cursor-pointer text-red-600 focus:text-red-600">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
