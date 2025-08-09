"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Chrome, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ChromeExtensionBanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Chrome className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        Available Now
                      </span>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Chrome Extension Now Available!
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                    Tailor your resume instantly while browsing job postings on LinkedIn, Indeed, and other job boards. 
                    Our AI analyzes the job description and creates a perfectly matched resume in seconds.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link href="https://chromewebstore.google.com/detail/profyle-job-tailoring-ass/pefncjpobdnoiodnooiefjlcboblpnlf" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white hover-lift">
                        <Chrome className="mr-2 h-4 w-4" />
                        Try Chrome Extension Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard">
                      <Button variant="outline" size="lg" className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20">
                        Try Web Version
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {/* Visual Element */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-48 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg border border-blue-200 dark:border-blue-800 p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Chrome className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Browser Extension</div>
                        <div className="text-xs text-muted-foreground">One-Click Tailoring</div>
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}