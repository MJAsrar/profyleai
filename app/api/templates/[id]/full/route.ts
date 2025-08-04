import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/templates/[id]/full - Get template with full cssData
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const template = await prisma.template.findUnique({
      where: { 
        id, 
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        cssData: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or inactive" },
        { status: 404 }
      )
    }

    if (!template.cssData) {
      return NextResponse.json(
        { error: "Template has no CSS data" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      cssData: template.cssData
    })

  } catch (error) {
    console.error("Error fetching template data:", error)
    return NextResponse.json(
      { error: "Failed to fetch template data" },
      { status: 500 }
    )
  }
}