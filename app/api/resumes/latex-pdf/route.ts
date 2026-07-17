import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { rateLimit, rateLimitKey, rateLimitResponse } from "@/lib/rate-limit"
import { createResumeSchema } from "@/lib/validations/resume"
import { resumeToLatex, DEFAULT_LATEX_STYLE, type LatexStyle } from "@/lib/latex/resume-template"
import { compileLatexToPdf, warmCompiler, isCompilerConfigured } from "@/lib/latex/compile-client"
import type { ResumeData } from "@/lib/resume-store"

/**
 * Compiles the builder's résumé JSON to a PDF via the Tectonic compile service on Cloud Run.
 *
 * The app owns the LaTeX template (generated here from the résumé JSON) and holds the shared
 * secret (in `@/lib/latex/compile-client`); the Cloud Run service only ever sees `.tex`. This
 * route backs the builder's live preview and its "Download PDF" button.
 */

const styleSchema = z.object({
  fontSize: z.number().min(8).max(14).optional(),
  density: z.enum(["compact", "normal", "relaxed"]).optional(),
  accent: z.string().regex(/^[0-9a-fA-F]{6}$/).optional(),
})

const bodySchema = z.object({
  resumeData: createResumeSchema,
  style: styleSchema.optional(),
  // The seeded Template.name the user picked; selects the LaTeX design. Unknown names fall
  // back to Modern, so this can never fail a compile.
  templateName: z.string().max(120).optional(),
})

function notConfigured() {
  return NextResponse.json(
    { error: "The PDF compiler isn't configured yet.", code: "COMPILER_NOT_CONFIGURED" },
    { status: 503 }
  )
}

/** GET /api/resumes/latex-pdf?warm=1 — warm the Cloud Run instance ahead of the first compile. */
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  if (!isCompilerConfigured()) return notConfigured()

  const ok = await warmCompiler()
  return NextResponse.json({ ok })
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  const limit = rateLimit(rateLimitKey(req, "latex-pdf", user.id), 60, 60_000)
  if (!limit.ok) return rateLimitResponse(limit)

  if (!isCompilerConfigured()) return notConfigured()

  let parsed
  try {
    const json = await req.json()
    parsed = bodySchema.parse(json)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid résumé data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const style: LatexStyle = { ...DEFAULT_LATEX_STYLE, ...(parsed.style ?? {}) }
  const tex = resumeToLatex(parsed.resumeData as ResumeData, style, parsed.templateName)

  const result = await compileLatexToPdf(tex)

  if (result.ok && result.pdf) {
    return new NextResponse(result.pdf, {
      status: 200,
      headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
    })
  }

  switch (result.status) {
    case "not_configured":
      return notConfigured()
    case "compile_failed":
      // Surface the Tectonic log so the preview can show what went wrong.
      return NextResponse.json(
        { error: "The résumé couldn't be compiled.", log: result.log ?? "", code: "COMPILE_FAILED" },
        { status: 422 }
      )
    case "unreachable":
      return NextResponse.json(
        { error: "The PDF compiler is unavailable right now. Please try again.", code: "COMPILER_UNREACHABLE" },
        { status: 502 }
      )
    default:
      return NextResponse.json(
        { error: "The PDF compiler returned an error. Please try again.", code: "COMPILER_ERROR" },
        { status: 502 }
      )
  }
}
