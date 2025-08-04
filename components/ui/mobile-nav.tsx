"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

interface MobileNavProps {
  children: React.ReactNode
  trigger?: React.ReactNode
}

export function MobileNav({ children, trigger }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="md:hidden touch-target">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-4">
          {children}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

interface MobileNavItemProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
}

export function MobileNavItem({ href, children, onClick }: MobileNavItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center py-3 px-4 text-lg font-medium rounded-lg hover:bg-accent smooth-transition touch-target"
    >
      {children}
    </a>
  )
}