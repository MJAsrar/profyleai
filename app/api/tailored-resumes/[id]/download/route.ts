import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError, checkResourceOwnership, createOwnershipError } from "@/lib/auth-utils"
import { generateResumePDFBlob } from "@/lib/pdf-export-utils"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/tailored-resumes/[id]/download - Download tailored resume as PDF (legacy)
 * POST /api/tailored-resumes/[id]/download - Download tailored resume as PDF with font configuration
 */
async function handleDownload(req: NextRequest, { params }: RouteParams, fontConfig?: FontSizeConfig) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id } = await params

    // Fetch tailored resume with template information
    const tailoredResume = await (prisma as any).tailoredResume.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            previewUrl: true,
            cssData: true
          }
        }
      }
    })

    if (!tailoredResume) {
      return NextResponse.json(
        { error: "Tailored resume not found" },
        { status: 404 }
      )
    }

    // Check ownership (user can only download their own resumes)
    if (!checkResourceOwnership(tailoredResume.userId, user.id)) {
      return createOwnershipError()
    }

    console.log(`📄 Generating PDF for tailored resume: ${tailoredResume.title} (ID: ${tailoredResume.id})`)

    // Convert tailored resume data to proper format
    const resumeData = {
      id: tailoredResume.id,
      title: tailoredResume.title,
      templateId: tailoredResume.templateId,
      personalInfo: tailoredResume.personalInfo as any,
      summary: tailoredResume.summary || "",
      experience: tailoredResume.experience as any,
      education: tailoredResume.education as any,
      skills: tailoredResume.skills as any,
      projects: tailoredResume.projects as any,
      certifications: tailoredResume.certifications as any,
      isPublic: false,
      template: tailoredResume.template
    }

    // Generate PDF using the same method as Resume Builder
    const pdfBlob = await generateResumePDFBlob(resumeData, {
      templateId: tailoredResume.template?.id || 'modern',
      pageSize: 'LETTER', // Same as Resume Builder
      margins: [40, 60, 40, 60], // Same as Resume Builder
      fontConfig // Pass through the user's font configuration
    })
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    // Create a safe filename with job info
    const safeTitle = tailoredResume.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50)
    const filename = `${safeTitle}_Resume.pdf`

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("API /api/tailored-resumes/[id]/download error:", error)
    return NextResponse.json(
      { error: "Failed to generate tailored resume PDF" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  return handleDownload(req, { params })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json()
    const fontConfig = body.fontConfig as FontSizeConfig | undefined
    
    return handleDownload(req, { params }, fontConfig)
  } catch (error) {
    console.error("POST /api/tailored-resumes/[id]/download error:", error)
    return NextResponse.json(
      { error: "Failed to generate tailored resume PDF" },
      { status: 500 }
    )
  }
}