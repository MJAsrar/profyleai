import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError, checkResourceOwnership, createOwnershipError } from "@/lib/auth-utils"
import { generateResumePDFBlob } from "@/lib/pdf-export-utils"
import { FontSizeConfig } from "@/lib/font-config"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/resumes/[id]/download - Download resume as PDF (legacy)
 * POST /api/resumes/[id]/download - Download resume as PDF with font configuration
 */
async function handleDownload(req: NextRequest, { params }: RouteParams, fontConfig?: FontSizeConfig) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    const { id } = await params

    // Fetch resume with template information
    const resume = await prisma.resume.findUnique({
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

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    // Check ownership (user can only download their own resumes)
    if (!checkResourceOwnership(resume.userId, user.id)) {
      return createOwnershipError()
    }

    console.log(`📄 Generating PDF for resume: ${resume.title} (ID: ${resume.id})`)

    // Convert resume data to proper format
    const resumeData = {
      id: resume.id,
      title: resume.title,
      templateId: resume.templateId,
      personalInfo: resume.personalInfo as any,
      summary: resume.summary || "",
      experience: resume.experience as any,
      education: resume.education as any,
      skills: resume.skills as any,
      projects: resume.projects as any,
      certifications: resume.certifications as any,
      isPublic: resume.isPublic,
      template: resume.template
    }

    // Generate PDF using the same method as Resume Builder
    const pdfBlob = await generateResumePDFBlob(resumeData, {
      templateId: resume.template?.id || 'modern',
      pageSize: 'LETTER', // Same as Resume Builder
      margins: [40, 20, 40, 20], // Fixed: Match cover letter margins (no header gap)
      fontConfig // Pass through the user's font configuration
    })
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

    // Create a safe filename
    const safeTitle = resume.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50)
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
    console.error("API /api/resumes/[id]/download error:", error)
    return NextResponse.json(
      { error: "Failed to generate resume PDF" },
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
    console.error("POST /api/resumes/[id]/download error:", error)
    return NextResponse.json(
      { error: "Failed to generate resume PDF" },
      { status: 500 }
    )
  }
}