"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "@/components/ui/page-container"
import { MotionWrapper } from "@/components/ui/motion-wrapper"
import { Eye, Download, Star, Users, ArrowRight, Filter } from "lucide-react"

interface Template {
  id: string
  name: string
  category: "MODERN" | "CLASSIC" | "CREATIVE" | "ATS"
  previewUrl: string
  isActive: boolean
  usageCount: number
  cssMetadata?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    primaryFont?: string
    layoutType?: string
  }
  features?: {
    supportsMultiColumn: boolean
    hasGradients: boolean
    hasCustomFonts: boolean
    isCreativeStyle: boolean
  }
}

const categoryDescriptions = {
  MODERN: {
    title: "Modern Templates",
    description: "Clean, contemporary designs perfect for tech, startups, and forward-thinking companies. These templates feature minimalist layouts, subtle colors, and modern typography that appeal to innovative employers.",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  CLASSIC: {
    title: "Classic Templates", 
    description: "Traditional, professional templates for corporate environments, finance, law, and established industries. These templates emphasize professionalism with conservative layouts and proven design principles.",
    color: "bg-gray-100 text-gray-800 border-gray-200"
  },
  CREATIVE: {
    title: "Creative Templates",
    description: "Bold, artistic designs for creative professionals in design, marketing, media, and arts. These templates showcase your creativity while maintaining readability and professional standards.",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  ATS: {
    title: "ATS-Friendly Templates",
    description: "Specifically optimized for Applicant Tracking Systems used by most large companies. These templates ensure your resume passes automated screening while maintaining professional appearance and clear formatting.",
    color: "bg-green-100 text-green-800 border-green-200"
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates')
        if (!response.ok) throw new Error('Failed to fetch templates')
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const categories = [
    { value: "all", label: "All Templates", count: templates.length },
    ...Object.entries(categoryDescriptions).map(([key, desc]) => ({
      value: key,
      label: desc.title.replace(" Templates", ""),
      count: templates.filter(t => t.category === key).length
    }))
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
          <PageContainer maxWidth="full" padding="lg">
            <MotionWrapper animation="fade-in-up">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance">
                    Professional Resume{" "}
                    <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Templates
                    </span>
                  </h1>
                  <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-balance mb-4">
                    Choose from our collection of professionally designed, ATS-friendly resume templates. 
                    Start building your perfect resume in minutes.
                  </p>
                  <div className="max-w-3xl mx-auto text-center">
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Our resume templates are crafted by design experts and tested with hiring managers across various industries. Each template is optimized for Applicant Tracking Systems (ATS) while maintaining visual appeal and professional formatting. Whether you're a recent graduate, experienced professional, or career changer, find the perfect template that showcases your unique qualifications and helps you stand out in today's competitive job market.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Start Building Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/resume-builder">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      <Eye className="mr-2 h-5 w-5" />
                      Preview Templates
                    </Button>
                  </Link>
                </div>
              </div>
            </MotionWrapper>
          </PageContainer>
        </section>

        {/* Template Gallery */}
        <section className="py-20">
          <PageContainer maxWidth="full" padding="lg">
            <div className="space-y-12">
              {/* Category Filter */}
              <MotionWrapper animation="fade-in-up">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Browse Templates</h2>
                    <p className="text-muted-foreground">
                      {templates.length} professional templates designed for success
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="text-sm"
                      >
                        {category.label}
                        {category.count > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {category.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </MotionWrapper>

              {/* Category Description */}
              {selectedCategory !== "all" && (
                <MotionWrapper animation="fade-in">
                  <div className="text-center py-8">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full border ${categoryDescriptions[selectedCategory as keyof typeof categoryDescriptions]?.color}`}>
                      <h3 className="font-medium">
                        {categoryDescriptions[selectedCategory as keyof typeof categoryDescriptions]?.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                      {categoryDescriptions[selectedCategory as keyof typeof categoryDescriptions]?.description}
                    </p>
                  </div>
                </MotionWrapper>
              )}

              {/* Templates Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted h-64 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="bg-muted h-4 rounded"></div>
                        <div className="bg-muted h-3 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <MotionWrapper animation="fade-in" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template, index) => (
                    <MotionWrapper
                      key={template.id}
                      animation="fade-in-up"
                      delay={index * 100}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                        <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                          <Image
                            src={template.previewUrl}
                            alt={`${template.name} resume template preview`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=400&width=300"
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Link href={`/dashboard/resume-builder?template=${template.id}`}>
                              <Button size="sm" className="bg-white text-black hover:bg-white/90">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </Button>
                            </Link>
                          </div>
                          
                          {/* Popular badge */}
                          {template.usageCount > 100 && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-yellow-500 text-yellow-900 border-yellow-400">
                                <Star className="mr-1 h-3 w-3" />
                                Popular
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold line-clamp-1">
                              {template.name}
                            </CardTitle>
                            <Badge 
                              variant="outline" 
                              className={categoryDescriptions[template.category]?.color}
                            >
                              {template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <Users className="mr-1 h-4 w-4" />
                            {template.usageCount.toLocaleString()} users
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/dashboard/resume-builder?template=${template.id}`} className="flex-1">
                              <Button size="sm" className="w-full">
                                Use Template
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </MotionWrapper>
                  ))}
                </MotionWrapper>
              )}

              {/* No templates found */}
              {!isLoading && filteredTemplates.length === 0 && (
                <MotionWrapper animation="fade-in">
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No templates found in this category.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCategory("all")}
                    >
                      View All Templates
                    </Button>
                  </div>
                </MotionWrapper>
              )}
            </div>
          </PageContainer>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <PageContainer maxWidth="full" padding="lg">
            <MotionWrapper animation="fade-in-up">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Ready to Build Your Resume?</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose a template and start building your professional resume with AI assistance. 
                    Get hired faster with our expert-designed templates.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/resume-builder">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      Browse All Templates
                    </Button>
                  </Link>
                </div>
              </div>
            </MotionWrapper>
          </PageContainer>
        </section>
      </main>
      <Footer />
    </div>
  )
}