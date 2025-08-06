"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Template {
  id: string
  name: string
  category: string
  previewUrl: string
}

// Static template data based on the preview images we found
const TEMPLATE_DATA: Template[] = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    category: "MODERN",
    previewUrl: "/templates/previews/modern-professional.jpg"
  },
  {
    id: "executive-classic",
    name: "Executive Classic", 
    category: "CLASSIC",
    previewUrl: "/templates/previews/executive-classic.jpg"
  },
  {
    id: "tech-stack",
    name: "Tech Stack",
    category: "MODERN",
    previewUrl: "/templates/previews/tech-stack.jpg"
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    category: "CREATIVE", 
    previewUrl: "/templates/previews/creative-designer.jpg"
  },
  {
    id: "artistic-portfolio",
    name: "Artistic Portfolio",
    category: "CREATIVE",
    previewUrl: "/templates/previews/artistic-portfolio.jpg"
  },
  {
    id: "bold-modern",
    name: "Bold Modern",
    category: "MODERN",
    previewUrl: "/templates/previews/bold-modern.jpg"
  },
  {
    id: "clean-minimalist",
    name: "Clean Minimalist", 
    category: "MODERN",
    previewUrl: "/templates/previews/clean-minimalist.jpg"
  },
  {
    id: "traditional-professional",
    name: "Traditional Professional",
    category: "CLASSIC",
    previewUrl: "/templates/previews/traditional-professional.jpg"
  },
  {
    id: "ats-friendly",
    name: "ATS Friendly",
    category: "ATS",
    previewUrl: "/templates/previews/ats-friendly.jpg"
  }
]

export function TemplateCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Duplicate templates for seamless loop
  const duplicatedTemplates = [...TEMPLATE_DATA, ...TEMPLATE_DATA]
  
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    
    let position = 0 // Start from the beginning
    
    const move = () => {
      position -= 1 // Move 1px per frame for smooth motion
      carousel.style.transform = `translateX(${position}px)`
      
      // When we've moved one full set width, reset to 0 for seamless loop
      if (position <= -(TEMPLATE_DATA.length * 280)) {
        position = 0
      }
      
      requestAnimationFrame(move)
    }
    
    move()
  }, [])
  

  
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Professional Resume Templates
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our collection of professionally designed templates. All templates are ATS-friendly and customizable.
            </p>
          </div>
          
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div 
              ref={carouselRef}
              className="flex"
              style={{
                width: `${duplicatedTemplates.length * 280}px`
              }}
            >
              {duplicatedTemplates.map((template, index) => (
                <div
                  key={`${template.id}-${index}`}
                  className="flex-shrink-0 w-64 mx-2"
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <div className="aspect-[3/4] w-full relative overflow-hidden rounded-lg">
                      <img
                        src={template.previewUrl}
                        alt={`${template.name} resume template`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=400&width=300"
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link href="/templates">
                          <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                            View Template
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {template.category.toLowerCase()} Style
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-8">
            <Link href="/templates">
              <Button size="lg" className="text-base">
                Browse All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}