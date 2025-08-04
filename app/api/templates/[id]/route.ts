import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/templates/[id] - Get specific template with full CSS data
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate template ID format (basic check)
    if (!id || id.length < 10) {
      return NextResponse.json(
        { error: "Invalid template ID format" },
        { status: 400 }
      )
    }

    // Fetch template with usage statistics
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            resumes: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    // Parse CSS data for detailed response
    const cssData = template.cssData as any
    
    // Build comprehensive template response
    const templateResponse = {
      id: template.id,
      name: template.name,
      category: template.category,
      previewUrl: template.previewUrl,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      usageCount: template._count.resumes,
      
      // Full CSS data for template rendering
      cssData: cssData,
      
      // Parsed CSS metadata for easier frontend consumption
      styling: cssData ? {
        layout: {
          pageSize: cssData.layout?.pageSize || "letter",
          margins: cssData.layout?.margins || "1in",
          columns: cssData.layout?.columns || "single",
          spacing: cssData.layout?.spacing || "1.5em",
          columnGap: cssData.layout?.columnGap
        },
        
        typography: {
          primaryFont: cssData.typography?.primaryFont || "Arial, sans-serif",
          secondaryFont: cssData.typography?.secondaryFont || "Arial, sans-serif",
          baseFontSize: cssData.typography?.baseFontSize || "8pt", // Further reduced from 9pt
          lineHeight: cssData.typography?.lineHeight || "1.4"
        },
        
        colors: {
          primary: cssData.colors?.primary || "#000000",
          secondary: cssData.colors?.secondary || "#333333",
          accent: cssData.colors?.accent || "#666666",
          text: cssData.colors?.text || "#000000",
          muted: cssData.colors?.muted || "#666666",
          background: cssData.colors?.background || "#ffffff",
          // Additional colors specific to some templates
          highlight: cssData.colors?.highlight,
          gradientStart: cssData.colors?.gradientStart,
          gradientEnd: cssData.colors?.gradientEnd
        },
        
        // Section-specific styling
        sections: cssData.sections || {},
        
        // Element-specific styling
        elements: cssData.elements || {}
      } : null,
      
      // Template capabilities and features
      features: {
        supportsMultiColumn: cssData?.layout?.columns !== "single",
        hasGradients: !!(cssData?.colors?.gradientStart || cssData?.sections?.header?.background?.includes("gradient")),
        hasCustomFonts: !!(cssData?.typography?.primaryFont?.includes("'") || cssData?.typography?.primaryFont?.includes('"')),
        hasAdvancedLayout: !!(cssData?.sections?.sidebar || cssData?.sections?.leftColumn || cssData?.layout?.columns === "asymmetric"),
        supportsTechnicalContent: cssData?.typography?.primaryFont?.includes("mono") || template.name.toLowerCase().includes("tech"),
        isCreativeStyle: template.category === "CREATIVE",
        isMinimalist: template.name.toLowerCase().includes("minimal") || template.name.toLowerCase().includes("clean")
      },
      
      // Compatibility information
      compatibility: {
        printOptimized: cssData?.layout?.pageSize === "letter" || cssData?.layout?.pageSize === "a4",
        mobileResponsive: true, // All our templates should be responsive
        atsCompatible: template.category === "CLASSIC" || template.category === "MODERN", // Creative templates might not be ATS-friendly
        pdfExportReady: !!cssData
      }
    }

    return NextResponse.json({ template: templateResponse })
  } catch (error) {
    console.error("GET /api/templates/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    )
  }
}