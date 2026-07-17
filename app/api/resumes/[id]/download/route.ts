import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  createAuthError,
  checkResourceOwnership,
  createOwnershipError,
} from "@/lib/auth-utils"
import { resumeToLatex, DEFAULT_LATEX_STYLE, type LatexStyle } from "@/lib/latex/resume-template"
import { compileLatexToPdf } from "@/lib/latex/compile-client"
import type { ResumeData } from "@/lib/resume-store"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET/POST /api/resumes/[id]/download — download a résumé as a PDF, compiled from LaTeX by the
 * Tectonic service. The design follows the résumé's own template (`template.name`); an optional
 * `style` in the POST body overrides the defaults. The old pdfmake `fontConfig`/`spacingConfig`
 * body is accepted and ignored, so existing callers (My résumés, the extension) keep working.
 */
async function handleDownload(req: NextRequest, { params }: RouteParams, style: LatexStyle) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  const { id } = await params

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { template: { select: { name: true } } },
  })

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 })
  }
  if (!checkResourceOwnership(resume.userId, user.id)) {
    return createOwnershipError()
  }

  const resumeData: ResumeData = {
    id: resume.id,
    title: resume.title,
    templateId: resume.templateId,
    personalInfo: resume.personalInfo as ResumeData["personalInfo"],
    summary: resume.summary || "",
    experience: resume.experience as ResumeData["experience"],
    education: resume.education as ResumeData["education"],
    skills: resume.skills as ResumeData["skills"],
    projects: resume.projects as ResumeData["projects"],
    certifications: resume.certifications as ResumeData["certifications"],
    isPublic: resume.isPublic,
  }

  const tex = resumeToLatex(resumeData, style, resume.template?.name)
  const result = await compileLatexToPdf(tex)

  if (!result.ok || !result.pdf) {
    if (result.status === "compile_failed") {
      console.error("❌ resume download: LaTeX compile failed:", result.log?.slice(-800))
    }
    const status = result.status === "not_configured" ? 503 : result.status === "unreachable" ? 502 : 500
    return NextResponse.json({ error: "Failed to generate resume PDF" }, { status })
  }

  const safeTitle = resume.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_").substring(0, 50) || "Resume"
  return new NextResponse(result.pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}_Resume.pdf"`,
      "Content-Length": result.pdf.length.toString(),
    },
  })
}

export async function GET(req: NextRequest, ctx: RouteParams) {
  return handleDownload(req, ctx, DEFAULT_LATEX_STYLE)
}

export async function POST(req: NextRequest, ctx: RouteParams) {
  let style: LatexStyle = DEFAULT_LATEX_STYLE
  try {
    const body = await req.json().catch(() => ({}))
    if (body?.style) style = { ...DEFAULT_LATEX_STYLE, ...body.style }
  } catch {
    /* tolerate an empty/invalid body — defaults are fine */
  }
  return handleDownload(req, ctx, style)
}
