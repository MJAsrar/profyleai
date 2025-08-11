import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, createAuthError, checkResourceOwnership, createOwnershipError } from "@/lib/auth-utils"
import { generateResumePDFBlob } from "@/lib/pdf-export-utils"
import { FontSizeConfig } from "@/lib/font-config"
import { SpacingConfig } from "@/lib/spacing-config"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/tailored-resumes/[id]/download - Download tailored resume as PDF (legacy)
 * POST /api/tailored-resumes/[id]/download - Download tailored resume as PDF with font configuration
 */
async function handleDownload(req: NextRequest, { params }: RouteParams, fontConfig?: FontSizeConfig, spacingConfig?: SpacingConfig) {
  try {
    console.log('🔍 Starting tailored resume download process...')
    
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      console.log('❌ Authentication failed - no user found')
      return createAuthError()
    }

    const { id } = await params
    console.log('📋 Download request details:', {
      userId: user.id,
      tailoredResumeId: id,
      hasFontConfig: !!fontConfig
    })

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
      console.log('❌ Tailored resume not found:', id)
      return NextResponse.json(
        { error: "Tailored resume not found" },
        { status: 404 }
      )
    }

    console.log('✅ Tailored resume found:', {
      id: tailoredResume.id,
      title: tailoredResume.title,
      userId: tailoredResume.userId,
      templateId: tailoredResume.templateId,
      hasTemplate: !!tailoredResume.template,
      templateName: tailoredResume.template?.name
    })

    // Check ownership (user can only download their own resumes)
    if (!checkResourceOwnership(tailoredResume.userId, user.id)) {
      console.log('❌ Ownership check failed:', {
        resumeUserId: tailoredResume.userId,
        requestUserId: user.id
      })
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

    console.log('🎨 Resume data prepared for PDF generation:', {
      hasPersonalInfo: !!resumeData.personalInfo,
      hasTemplate: !!resumeData.template,
      templateId: resumeData.templateId,
      summaryLength: resumeData.summary?.length || 0,
      experienceCount: Array.isArray(resumeData.experience) ? resumeData.experience.length : 0,
      skillsCount: Array.isArray(resumeData.skills) ? resumeData.skills.length : 0
    })

    // Generate PDF using the same method as Resume Builder
    console.log('🔧 Starting PDF generation with options:', {
      templateId: tailoredResume.template?.id || 'modern',
      pageSize: 'LETTER',
      margins: [40, 20, 40, 20],
      hasFontConfig: !!fontConfig
    })
    
    const pdfBlob = await generateResumePDFBlob(resumeData, {
      templateId: tailoredResume.template?.id || 'modern',
      pageSize: 'LETTER', // Same as Resume Builder
      margins: [40, 20, 40, 20], // Fixed: Match cover letter margins (no header gap)
      fontConfig, // Pass through the user's font configuration
      spacingConfig // Pass through the user's spacing configuration
    })
    
    console.log('📄 PDF blob generated:', {
      size: pdfBlob.size,
      type: pdfBlob.type
    })
    
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())
    console.log('💾 PDF buffer created:', {
      bufferSize: pdfBuffer.length
    })

    // Create a safe filename with job info
    const safeTitle = tailoredResume.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50)
    const filename = `${safeTitle}_Resume.pdf`
    
    console.log('✅ Sending PDF response:', {
      filename,
      contentLength: pdfBuffer.length,
      contentType: 'application/pdf'
    })

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
    const spacingConfig = body.spacingConfig as SpacingConfig | undefined
    
    return handleDownload(req, { params }, fontConfig, spacingConfig)
  } catch (error) {
    console.error("POST /api/tailored-resumes/[id]/download error:", error)
    return NextResponse.json(
      { error: "Failed to generate tailored resume PDF" },
      { status: 500 }
    )
  }
}