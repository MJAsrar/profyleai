"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MotionWrapper, StaggeredContainer } from "@/components/ui/motion-wrapper"
import { useResumeStore, type ResumeTemplate } from "@/lib/resume-store"

interface TemplateSelectorProps {
  onTemplateSelect: () => void
}

export function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const { templates, loadTemplates, setSelectedTemplate, selectedTemplate, isLoading } = useResumeStore()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    if (templates.length === 0) {
      console.log('🎨 Template selector loading templates...')
      loadTemplates()
    }
  }, [templates.length, loadTemplates])

  const handleTemplateSelect = (template: ResumeTemplate) => {
    setSelectedTemplate(template)
    onTemplateSelect()
  }

  const categories = [
    { value: "all", label: "All Templates", count: templates.length },
    { 
      value: "MODERN", 
      label: "Modern", 
      count: templates.filter(t => t.category === "MODERN").length 
    },
    { 
      value: "CLASSIC", 
      label: "Classic", 
      count: templates.filter(t => t.category === "CLASSIC").length 
    },
    { 
      value: "CREATIVE", 
      label: "Creative", 
      count: templates.filter(t => t.category === "CREATIVE").length 
    },

    { 
      value: "ATS", 
      label: "ATS Friendly", 
      count: templates.filter(t => t.category === "ATS").length 
    }
  ]

  const getCategoryDescription = (category: string) => {
    switch(category) {
      case "MODERN": return "Clean, contemporary designs perfect for tech and startups"
      case "CLASSIC": return "Traditional, professional templates for corporate environments"
      case "CREATIVE": return "Bold, artistic designs for creative professionals"

      case "ATS": return "Optimized for Applicant Tracking Systems with simple, clean formatting"
      default: return "Choose from our collection of professional resume templates"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "MODERN":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      case "CLASSIC":
        return "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
      case "CREATIVE":
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      case "ATS":
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center sm:text-left">
          <h2 className="heading-2">Choose a Template</h2>
          <p className="text-muted-foreground mt-2 text-lg">Loading professional templates...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="card-elevated">
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="aspect-[3/4] rounded-lg mb-4" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-6 w-20 mb-3 rounded-full" />
                <Skeleton className="h-8 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <MotionWrapper animation="fade-in-up">
        <div className="text-center sm:text-left">
          <h2 className="heading-2">Choose a Template</h2>
          <p className="text-muted-foreground mt-2 body-large">
            Select a professional template to get started with your resume.
          </p>
        </div>
      </MotionWrapper>

      <MotionWrapper animation="scale-in" delay={200}>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value} 
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                <Badge variant="secondary" className="text-xs bg-background/20">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getCategoryDescription(category.value)}
                </p>
              </div>

              <StaggeredContainer 
                staggerDelay={100}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {(category.value === "all" ? templates : templates.filter(t => t.category === category.value))
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer card-elevated group transition-all duration-300 ${
                        selectedTemplate?.id === template.id ? "ring-2 ring-primary shadow-medium scale-[1.02]" : "hover:shadow-medium hover:scale-[1.01]"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="aspect-[3/4] bg-muted rounded-lg mb-4 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                                                  <img
                          src={template.previewUrl}
                          alt={`${template.name} resume template preview`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=400&width=300"
                            }}
                          />
                          {template.cssMetadata?.primaryColor && (
                            <div 
                              className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              className="opacity-90 backdrop-blur-sm"
                            >
                              Preview
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-base group-hover:text-primary transition-colors">
                            {template.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <Badge 
                              className={getCategoryColor(template.category)}
                              variant="secondary"
                            >
                              {template.category.toLowerCase()}
                            </Badge>
                            {template.usageCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Used by {template.usageCount}
                              </span>
                            )}
                          </div>
                          <Button 
                            className="w-full touch-target" 
                            variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                            size="sm"
                          >
                            {selectedTemplate?.id === template.id ? "✓ Selected" : "Select Template"}
                          </Button>
                          {template.features && (
                            <div className="flex flex-wrap gap-1">
                                                        {/* Gradients disabled - all templates use white background */}
                              {template.features.supportsMultiColumn && (
                                <Badge variant="secondary" className="text-xs">Multi-column</Badge>
                              )}
                              {template.features.isCreativeStyle && (
                                <Badge variant="secondary" className="text-xs">Creative</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </StaggeredContainer>

              {(category.value === "all" ? templates : templates.filter(t => t.category === category.value)).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No templates found in this category.</p>
                </div>
              )}
            </div>
          </TabsContent>
          ))}
        </Tabs>
      </MotionWrapper>
    </div>
  )
}