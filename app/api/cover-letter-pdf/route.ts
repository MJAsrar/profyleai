import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { coverLetterToLatex } from "@/lib/latex/cover-letter-template"
import { compileLatexToPdf } from "@/lib/latex/compile-client"

/**
 * POST /api/cover-letter-pdf — generate and download a cover letter PDF, compiled from LaTeX by
 * the Tectonic service (same infrastructure as résumé PDFs). The request shape is unchanged, so
 * the Chrome extension keeps working without modification.
 */

const coverLetterPDFSchema = z.object({
  jobDetails: z.object({
    jobTitle: z.string().min(1, "Job title is required"),
    companyName: z.string().min(1, "Company name is required"),
    hiringManager: z.string().optional(),
    jobDescription: z.string().optional(),
  }),
  personalInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  content: z.object({
    opening: z.string().min(1, "Opening paragraph is required"),
    body: z.string().min(1, "Body content is required"),
    closing: z.string().min(1, "Closing paragraph is required"),
  }),
  tone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return createAuthError()

  let data
  try {
    data = coverLetterPDFSchema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid cover letter data", details: error.errors, code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const dateLabel = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const tex = coverLetterToLatex({ ...data, dateLabel })

  const result = await compileLatexToPdf(tex)

  if (result.ok && result.pdf) {
    const filename = `${data.personalInfo.fullName.replace(/\s+/g, "_")}_Cover_Letter_${data.jobDetails.companyName.replace(
      /\s+/g,
      "_"
    )}.pdf`
    return new NextResponse(result.pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": result.pdf.length.toString(),
      },
    })
  }

  if (result.status === "compile_failed") {
    console.error("❌ cover-letter-pdf: LaTeX compile failed:", result.log?.slice(-800))
  }
  const status =
    result.status === "not_configured" ? 503 : result.status === "unreachable" ? 502 : 500
  return NextResponse.json(
    { error: "Failed to generate cover letter PDF", code: "PDF_ERROR" },
    { status }
  )
}
