import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/templates/categories - Get template categories with statistics
 */
export async function GET() {
  try {
    // Get all templates with category grouping
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      select: {
        category: true,
        id: true,
        name: true,
        _count: {
          select: {
            resumes: true
          }
        }
      }
    })

    // Calculate category statistics
    const categoryStats = templates.reduce((acc, template) => {
      const category = template.category
      
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalUsage: 0,
          templates: [],
          description: getCategoryDescription(category),
          features: getCategoryFeatures(category)
        }
      }
      
      acc[category].count += 1
      acc[category].totalUsage += template._count.resumes
      acc[category].templates.push({
        id: template.id,
        name: template.name,
        usageCount: template._count.resumes
      })
      
      return acc
    }, {} as Record<string, any>)

    // Sort templates within each category by usage
    Object.values(categoryStats).forEach((category: any) => {
      category.templates.sort((a: any, b: any) => b.usageCount - a.usageCount)
    })

    // Convert to array and sort by total usage
    const categoriesArray = Object.values(categoryStats)
      .sort((a: any, b: any) => b.totalUsage - a.totalUsage)

    return NextResponse.json({
      categories: categoriesArray,
      totalCategories: categoriesArray.length,
      totalTemplates: templates.length,
      metadata: {
        availableCategories: ["MODERN", "CLASSIC", "CREATIVE"],
        sortedByPopularity: true
      }
    })
  } catch (error) {
    console.error("Template categories API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch template categories" },
      { status: 500 }
    )
  }
}

/**
 * Get description for template category
 */
function getCategoryDescription(category: string): string {
  switch (category) {
    case "MODERN":
      return "Clean, contemporary designs with modern typography and layouts. Perfect for tech, startup, and creative industries."
    case "CLASSIC":
      return "Traditional, professional templates suitable for corporate environments, law, finance, and established industries."
    case "CREATIVE":
      return "Bold, artistic designs with unique layouts and color schemes. Ideal for designers, artists, and creative professionals."

    default:
      return "Professional resume templates"
  }
}

/**
 * Get features for template category
 */
function getCategoryFeatures(category: string): string[] {
  switch (category) {
    case "MODERN":
      return [
        "Clean typography",
        "Minimalist design",
        "ATS-friendly",
        "Modern color schemes",
        "Flexible layouts"
      ]
    case "CLASSIC":
      return [
        "Traditional formatting",
        "Professional appearance",
        "Conservative design",
        "Corporate-friendly",
        "Time-tested layouts"
      ]
    case "CREATIVE":
      return [
        "Unique layouts",
        "Bold color schemes",
        "Creative typography",
        "Visual elements",
        "Portfolio-style design"
      ]

    default:
      return []
  }
}