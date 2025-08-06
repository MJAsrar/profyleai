"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, User, Settings, LogOut, LayoutDashboard, Sparkles, Crown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      
      // Determine active section based on scroll position
      const sections = ["features", "pricing"]
      const currentSection = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      setActiveSection(currentSection || "")
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Templates", href: "/templates", id: "templates" },
    { name: "Features", href: "/#features", id: "features" },
    { name: "Pricing", href: "/#pricing", id: "pricing" },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? 'h-14 border-b bg-background/98 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/80' 
        : 'h-16 border-b bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
    }`}>
      <div className="container flex items-center justify-between px-6 h-full">
        <Link href="/" className="flex items-center group relative">
          <img 
            src="/logo.png" 
            alt="Profyle AI Resume Builder - Home" 
            className={`transition-all duration-300 w-auto group-hover:scale-105 bg-transparent ${
              isScrolled ? 'h-8 max-w-[160px]' : 'h-10 max-w-[200px]'
            }`}
            style={{ backgroundColor: 'transparent' }}
          />
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const isActive = activeSection === item.id || (item.href.startsWith('/') && pathname === item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                  isActive ? 'w-6' : 'w-0 group-hover:w-4'
                }`} />
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="transition-all duration-300 hover:scale-105 hover:bg-primary/10">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative group">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name || "User"}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer p-3">
                      <LayoutDashboard className="mr-3 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer p-3 text-red-600 focus:text-red-600">
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="transition-all duration-300 hover:scale-105 hover:bg-muted/70">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300">
                  <span className="relative z-10 flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="relative group">
              <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                <img src="/logo.png" alt="Profyle" className="h-8 w-auto bg-transparent" style={{ backgroundColor: 'transparent' }} />
              </div>
              
              {/* Navigation */}
              <div className="flex-1 p-6">
                <div className="space-y-2 mb-8">
                  {navigation.map((item) => {
                    const isActive = activeSection === item.id || (item.href.startsWith('/') && pathname === item.href)
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href} 
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="ml-3">{item.name}</span>
                        {isActive && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                      </Link>
                    )
                  })}
                </div>

                {/* User Section */}
                <div className="space-y-3 pt-4 border-t">
                  {session ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.user?.name || "User"}</p>
                          <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                      
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start h-12 text-sm">
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-12 text-sm text-red-600 hover:text-red-600 hover:bg-red-50" 
                        onClick={() => {
                          setIsOpen(false)
                          handleSignOut()
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full h-12 text-sm">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full h-12 text-sm bg-gradient-to-r from-primary to-primary/90">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
