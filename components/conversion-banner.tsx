"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight, CheckCircle2, Clock, Target, Users } from "lucide-react"

export function ConversionBanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
      <div className="content-container">
        <Card className="p-8 md:p-12 bg-background/80 backdrop-blur-sm border-primary/20 shadow-xl">
          <div className="text-center max-w-4xl mx-auto">
            {/* Urgency indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium mb-6">
              <Clock className="h-4 w-4" />
              Limited Time: Get 10 Credits FREE
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Land Your Dream Job?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 50,000+ professionals who've transformed their careers with our AI-powered platform. 
              Start free today and see results within minutes.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 text-left">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold">3x More Interviews</div>
                  <div className="text-sm text-muted-foreground">Proven results</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">85% Success Rate</div>
                  <div className="text-sm text-muted-foreground">Industry leading</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">50,000+ Users</div>
                  <div className="text-sm text-muted-foreground">Trusted globally</div>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free - No Credit Card
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <div className="text-sm text-muted-foreground">
                ✓ 10 free credits • ✓ Setup in 30 seconds • ✓ No commitments
              </div>
            </div>

            {/* Social proof */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">
                Join professionals from top companies:
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-medium text-muted-foreground/70">
                <span>Google</span>
                <span>•</span>
                <span>Microsoft</span>
                <span>•</span>
                <span>Meta</span>
                <span>•</span>
                <span>Amazon</span>
                <span>•</span>
                <span>Apple</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
