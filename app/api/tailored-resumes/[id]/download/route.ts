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
 * GET/POST /api/tailored-resumes/[id]/download — download a tailored résumé as a PDF, compiled
 * from LaTeX by the Tectonic service. Mirrors /api/resumes/[id]/download but reads the
 * tailoredResume model. The legacy `fontConfig`/`spacingConfig` body is accepted and ignored.
 */
async function handleDownload(req: NextRequest, { params }: RouteParams, style: LatexStyle) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tailoredResume = await (prisma as any).tailoredResume.findUnique({
    where: { id },
    include: { template: { select: { name: true } } },
  })

  if (!tailoredResume) {
    return NextResponse.json({ error: "Tailored resume not found" }, { status: 404 })
  }
  if (!checkResourceOwnership(tailoredResume.userId, user.id)) {
    return createOwnershipError()
  }

  const resumeData: ResumeData = {
    id: tailoredResume.id,
    title: tailoredResume.title,
    templateId: tailoredResume.templateId,
    personalInfo: tailoredResume.personalInfo as ResumeData["personalInfo"],
    summary: tailoredResume.summary || "",
    experience: tailoredResume.experience as ResumeData["experience"],
    education: tailoredResume.education as ResumeData["education"],
    skills: tailoredResume.skills as ResumeData["skills"],
    projects: tailoredResume.projects as ResumeData["projects"],
    certifications: tailoredResume.certifications as ResumeData["certifications"],
    isPublic: false,
  }

  const tex = resumeToLatex(resumeData, style, tailoredResume.template?.name)
  const result = await compileLatexToPdf(tex)

  if (!result.ok || !result.pdf) {
    if (result.status === "compile_failed") {
      console.error("❌ tailored resume download: LaTeX compile failed:", result.log?.slice(-800))
    }
    const status = result.status === "not_configured" ? 503 : result.status === "unreachable" ? 502 : 500
    return NextResponse.json({ error: "Failed to generate tailored resume PDF" }, { status })
  }

  const safeTitle =
    tailoredResume.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_").substring(0, 50) || "Resume"
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
    /* tolerate an empty/invalid body */
  }
  return handleDownload(req, ctx, style)
}
