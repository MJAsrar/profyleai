import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { rateLimit, rateLimitKey, rateLimitResponse } from "@/lib/rate-limit"
import { createResumeSchema } from "@/lib/validations/resume"
import { resumeToLatex, DEFAULT_LATEX_STYLE, type LatexStyle } from "@/lib/latex/resume-template"
import type { ResumeData } from "@/lib/resume-store"

/**
 * Compiles the builder's résumé JSON to a PDF via the Tectonic compile service on Cloud Run.
 *
 * The app owns the LaTeX template (generated here from the résumé JSON) and holds the shared
 * secret; the Cloud Run service only ever sees `.tex`. This route is the single seam between
 * the two. It backs both the live preview and the "Download PDF" button.
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

const COMPILE_URL = process.env.LATEX_COMPILER_URL
const COMPILE_SECRET = process.env.LATEX_COMPILER_SECRET

function notConfigured() {
  return NextResponse.json(
    {
      error: "The PDF compiler isn't configured yet.",
      code: "COMPILER_NOT_CONFIGURED",
    },
    { status: 503 }
  )
}

/** GET /api/resumes/latex-pdf?warm=1 — warm the Cloud Run instance ahead of the first compile. */
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  if (!COMPILE_URL) return notConfigured()

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(`${COMPILE_URL.replace(/\/$/, "")}/health`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    return NextResponse.json({ ok: res.ok })
  } catch {
    // A warm failure isn't fatal — the compile will simply pay the cold-start cost.
    return NextResponse.json({ ok: false })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  const limit = rateLimit(rateLimitKey(req, "latex-pdf", user.id), 60, 60_000)
  if (!limit.ok) return rateLimitResponse(limit)

  if (!COMPILE_URL || !COMPILE_SECRET) return notConfigured()

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

  let compileRes: Response
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30_000)
    compileRes = await fetch(`${COMPILE_URL.replace(/\/$/, "")}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COMPILE_SECRET}`,
      },
      body: JSON.stringify({ tex }),
      signal: controller.signal,
    })
    clearTimeout(timer)
  } catch (error) {
    console.error("❌ latex-pdf: compile service unreachable:", error)
    return NextResponse.json(
      { error: "The PDF compiler is unavailable right now. Please try again.", code: "COMPILER_UNREACHABLE" },
      { status: 502 }
    )
  }

  if (compileRes.ok) {
    const pdf = await compileRes.arrayBuffer()
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    })
  }

  // A compile error (bad LaTeX) — surface the log so the preview can show what went wrong.
  let log = ""
  try {
    const payload = await compileRes.json()
    log = payload?.log || payload?.error || ""
  } catch {
    /* non-JSON error body */
  }

  if (compileRes.status === 400) {
    return NextResponse.json({ error: "The résumé couldn't be compiled.", log, code: "COMPILE_FAILED" }, { status: 422 })
  }

  console.error(`❌ latex-pdf: compile service returned ${compileRes.status}`)
  return NextResponse.json(
    { error: "The PDF compiler returned an error. Please try again.", code: "COMPILER_ERROR" },
    { status: 502 }
  )
}
