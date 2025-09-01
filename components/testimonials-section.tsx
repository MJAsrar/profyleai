"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Sparkles, ArrowRight } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  image?: string
  rating: number
  content: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    rating: 5,
    content: "Profyle helped me land my dream job at Google! The AI suggestions made my resume stand out from hundreds of applicants. The templates are clean and professional."
  },
  {
    id: "2", 
    name: "Marcus Rodriguez",
    role: "Marketing Manager",
    company: "Spotify",
    rating: 5,
    content: "The resume tailoring feature is incredible. I could customize my resume for each job application in minutes. Got 3x more interview calls than before!"
  },
  {
    id: "3",
    name: "Emily Watson",
    role: "Product Designer",
    company: "Adobe",
    rating: 5,
    content: "As a designer, I'm picky about templates. Profyle's designs are top-notch and the customization options are perfect. Highly recommend!"
  },
  {
    id: "4",
    name: "David Kim",
    role: "Data Scientist", 
    company: "Meta",
    rating: 5,
    content: "The ATS optimization feature ensured my resume passed through screening systems. The AI content suggestions were spot-on for my field."
  },
  {
    id: "5",
    name: "Jessica Brown",
    role: "Project Manager",
    company: "Microsoft",
    rating: 5,
    content: "Saved me hours of work! The cover letter generator perfectly matched my resume style. The interview prep feature was also incredibly helpful."
  },
  {
    id: "6",
    name: "Alex Thompson",
    role: "Sales Director",
    company: "Salesforce",
    rating: 5,
    content: "Profyle transformed my career search. The professional templates and AI enhancements helped me secure a senior role with 40% salary increase!"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="content-container">
        <div className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by 50,000+ job seekers worldwide
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join professionals from Google, Microsoft, Meta, and Amazon who've transformed their careers with Profyle. 
              <span className="font-semibold text-primary">Start free today</span> and see results within minutes.
            </p>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.id} className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                      />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <blockquote className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="text-xs">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">50,000+</div>
              <div className="text-sm text-muted-foreground mt-1">Resumes Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground mt-1">User Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">3x</div>
              <div className="text-sm text-muted-foreground mt-1">More Interviews</div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Limited Time: Start with 10 FREE credits
            </div>
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30">
                <Sparkles className="mr-2 h-5 w-5" />
                Join 50,000+ Users - Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              No credit card required • Setup in 30 seconds • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}