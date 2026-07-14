import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { getJourneyProgress, getNextStep, type TargetJobSummary } from "@/lib/journey"

/**
 * The user's active target job — the spine of the journey.
 *
 * GET  → the job, its derived progress, and what to do next.
 * PUT  → set/replace the target job (upsert; one active job per user).
 * PATCH→ record an artifact against it (e.g. "this tailored résumé is for this job"),
 *        which is what advances the stepper.
 * DELETE → clear it.
 */

const upsertSchema = z.object({
  role: z.string().min(1, "Role is required").max(200),
  company: z.string().min(1, "Company is required").max(200),
  description: z.string().max(20_000).optional(),
  requirements: z.array(z.string().max(120)).max(12).optional(),
})

/** Only artifact links may be patched — progress is never set directly. */
const patchSchema = z.object({
  baseResumeId: z.string().optional().nullable(),
  tailoredResumeId: z.string().optional().nullable(),
  coverLetterId: z.string().optional().nullable(),
  interviewPrepId: z.string().optional().nullable(),
  videoInterviewId: z.string().optional().nullable(),
})

function serialize(job: TargetJobSummary | null) {
  return {
    job,
    progress: getJourneyProgress(job),
    nextStep: getNextStep(job),
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return createAuthError()

    const job = await prisma.targetJob.findUnique({ where: { userId: user.id } })

    return NextResponse.json({ success: true, data: serialize(job) })
  } catch (error) {
    console.error("GET /api/target-job error:", error)
    return NextResponse.json({ success: false, error: "Failed to load target job" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return createAuthError()

    const body = await req.json()
    const data = upsertSchema.parse(body)

    // One active target job per user: replacing it starts a fresh journey.
    const job = await prisma.targetJob.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        role: data.role,
        company: data.company,
        description: data.description,
        requirements: data.requirements ?? [],
      },
      update: {
        role: data.role,
        company: data.company,
        description: data.description,
        requirements: data.requirements ?? [],
      },
    })

    return NextResponse.json({ success: true, data: serialize(job) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("PUT /api/target-job error:", error)
    return NextResponse.json({ success: false, error: "Failed to save target job" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return createAuthError()

    const body = await req.json()
    const data = patchSchema.parse(body)

    // Scoped by userId: a caller can only advance their own journey.
    const result = await prisma.targetJob.updateMany({
      where: { userId: user.id },
      data,
    })

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "No target job set" },
        { status: 404 }
      )
    }

    const job = await prisma.targetJob.findUnique({ where: { userId: user.id } })
    return NextResponse.json({ success: true, data: serialize(job) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("PATCH /api/target-job error:", error)
    return NextResponse.json({ success: false, error: "Failed to update journey" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return createAuthError()

    await prisma.targetJob.deleteMany({ where: { userId: user.id } })

    return NextResponse.json({ success: true, data: serialize(null) })
  } catch (error) {
    console.error("DELETE /api/target-job error:", error)
    return NextResponse.json({ success: false, error: "Failed to clear target job" }, { status: 500 })
  }
}
