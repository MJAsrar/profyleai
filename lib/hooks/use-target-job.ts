"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getJourneyProgress,
  getNextStep,
  type JourneyProgress,
  type JourneyStep,
  type TargetJobSummary,
} from "@/lib/journey"

/**
 * Reads the user's active target job. Every AI tool uses this to render the shared
 * job-context strip and stepper, so the job is entered once and carries everywhere.
 */
export function useTargetJob() {
  const [job, setJob] = useState<TargetJobSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/target-job")
      if (res.status === 401) {
        setJob(null)
        return
      }
      const body = await res.json()
      if (!body.success) throw new Error(body.error ?? "Failed to load target job")
      setJob(body.data.job)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load target job")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  /** Set (or replace) the job being chased. */
  const setTargetJob = useCallback(
    async (input: {
      role: string
      company: string
      description?: string
      requirements?: string[]
    }) => {
      const res = await fetch("/api/target-job", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const body = await res.json()
      if (!body.success) throw new Error(body.error ?? "Failed to save target job")
      setJob(body.data.job)
      return body.data.job as TargetJobSummary
    },
    []
  )

  /**
   * Link an artifact to the job — this is what advances the stepper.
   * e.g. linkArtifact({ coverLetterId: id }) after generating a cover letter.
   */
  const linkArtifact = useCallback(
    async (artifacts: Partial<Record<
      | "baseResumeId"
      | "tailoredResumeId"
      | "coverLetterId"
      | "interviewPrepId"
      | "videoInterviewId",
      string | null
    >>) => {
      const res = await fetch("/api/target-job", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artifacts),
      })
      const body = await res.json()
      if (!body.success) return
      setJob(body.data.job)
    },
    []
  )

  const clearTargetJob = useCallback(async () => {
    await fetch("/api/target-job", { method: "DELETE" })
    setJob(null)
  }, [])

  const progress: JourneyProgress = getJourneyProgress(job)
  const nextStep: JourneyStep = getNextStep(job)

  return {
    job,
    progress,
    nextStep,
    isLoading,
    error,
    refresh,
    setTargetJob,
    linkArtifact,
    clearTargetJob,
  }
}
