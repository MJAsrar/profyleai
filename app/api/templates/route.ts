import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for filtering and sorting
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "name" // name, category, createdAt
    const sortOrder = searchParams.get("sortOrder") || "asc" // asc, desc
    const includeInactive = searchParams.get("includeInactive") === "true"

    // Build where clause
    const where: any = {}
    
    if (!includeInactive) {
      where.isActive = true
    }
    
    if (category && ["MODERN", "CLASSIC", "CREATIVE", "ATS"].includes(category.toUpperCase())) {
      where.category = category.toUpperCase()
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === "name") orderBy.name = sortOrder
    else if (sortBy === "category") orderBy.category = sortOrder
    else if (sortBy === "createdAt") orderBy.createdAt = sortOrder
    else orderBy.name = "asc" // default

    // Fetch templates
    const templates = await prisma.template.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            resumes: true // Count how many resumes use this template
          }
        }
      }
    })

    // Return templates with enhanced metadata
    const enhancedTemplates = templates.map(template => {
      const cssData = template.cssData as any
      
      return {
        id: template.id,
        name: template.name,
        category: template.category,
        previewUrl: template.previewUrl,
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        usageCount: template._count.resumes,
        
        // Include full cssData for proper rendering
        cssData: cssData,
        
        // CSS metadata for preview and selection
        cssMetadata: cssData ? {
          hasLayout: !!cssData.layout,
          hasTypography: !!cssData.typography,
          hasColors: !!cssData.colors,
          hasSections: !!cssData.sections,
          hasElements: !!cssData.elements,
          
          // Extract key styling info for preview
          primaryColor: cssData.colors?.primary,
          secondaryColor: cssData.colors?.secondary,
          accentColor: cssData.colors?.accent,
          primaryFont: cssData.typography?.primaryFont,
          layoutType: cssData.layout?.columns,
          pageSize: cssData.layout?.pageSize
        } : null,
        
        hasCssData: !!template.cssData
      }
    })

    // Group by category for easier frontend handling
    const templatesByCategory = enhancedTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    }, {} as Record<string, typeof enhancedTemplates>)

    // Get category statistics
    const categoryStats = Object.entries(templatesByCategory).map(([category, templates]) => ({
      category,
      count: templates.length,
      totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0)
    }))

    return NextResponse.json({
      templates: enhancedTemplates,
      templatesByCategory,
      categoryStats,
      totalCount: templates.length,
      metadata: {
        availableCategories: ["MODERN", "CLASSIC", "CREATIVE", "ATS"],
        sortOptions: ["name", "category", "createdAt"],
        filters: { category, sortBy, sortOrder, includeInactive }
      }
    })
  } catch (error) {
    console.error("Templates API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}