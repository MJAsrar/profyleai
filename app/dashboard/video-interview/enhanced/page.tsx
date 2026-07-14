"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { JobContextStrip } from "@/components/journey/job-context-strip"
import { VoiceSetup, type VoiceSetupResult } from "@/components/video-interview/voice-setup"
import { ElevenLabsInterviewRoom } from "@/components/video-interview/elevenlabs-interview-room"
import { VideoInterviewErrorBoundary } from "@/components/video-interview/video-interview-error-boundary"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState, ListSkeleton } from "@/components/ui/states"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { notifyCreditsChanged } from "@/lib/hooks/use-credits"

type Phase = "setup" | "interview" | "completed"

export default function VoiceInterviewPage() {
  const { job, progress, isLoading, linkArtifact } = useTargetJob()

  const [phase, setPhase] = useState<Phase>("setup")
  const [isStarting, setIsStarting] = useState(false)
  const [session, setSession] = useState<(VoiceSetupResult & { sessionId: string }) | null>(
    null
  )

  async function begin(setup: VoiceSetupResult) {
    setIsStarting(true)

    try {
      const res = await fetch("/api/video-interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...setup.jobData,
          questions: setup.questions,
          resumeId: setup.selectedResume.id,
          aiPersonality: "professional",
          type: "practice",
        }),
      })

      const body = await res.json()

      if (res.status === 402) {
        toast.error("Not enough credits for a voice interview.")
        return
      }
      if (!body.success) {
        toast.error(body.error ?? "The room didn't open. You haven't been charged.")
        return
      }

      setSession({ ...setup, sessionId: body.data.sessionId })
      setPhase("interview")
      notifyCreditsChanged()

      // Advance the journey — this is its last step.
      if (body.data.videoInterviewId) {
        await linkArtifact({ videoInterviewId: body.data.videoInterviewId })
      }
    } catch {
      toast.error("The room didn't open. You haven't been charged.")
    } finally {
      setIsStarting(false)
    }
  }

  // The live room takes the whole screen. Nothing else on it.
  if (phase === "interview" && session) {
    return (
      <VideoInterviewErrorBoundary>
        <ElevenLabsInterviewRoom
          sessionId={session.sessionId}
          jobTitle={session.jobData.jobTitle}
          companyName={session.jobData.companyName}
          jobDescription={session.jobData.jobDescription}
          resumeData={session.selectedResume}
          questions={session.questions}
          onInterviewComplete={() => setPhase("completed")}
          onInterviewEnd={() => setPhase("completed")}
        />
      </VideoInterviewErrorBoundary>
    )
  }

  return (
    <VideoInterviewErrorBoundary>
      <ToolTopBar title="Voice interview" backHref="/dashboard/video-interview" />
      <JobContextStrip job={job} progress={progress} current="voice" />

      <div className="mx-auto w-full max-w-[1100px] px-8 py-8">
        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : phase === "completed" ? (
          <Card className="p-8 text-center">
            <h2 className="font-display text-[28px] leading-tight text-ink">
              You got through it.
            </h2>
            <p className="mx-auto mt-2 max-w-[440px] text-[15px] leading-relaxed text-ink-muted">
              We&apos;re scoring what you said against the role. The feedback names the
              answers that landed and the ones that didn&apos;t.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/dashboard/video-interview">See my feedback</Link>
              </Button>
              <Button variant="outline" onClick={() => setPhase("setup")}>
                Go again
              </Button>
            </div>
          </Card>
        ) : !job?.role || !job?.company ? (
          <EmptyState
            code="VI"
            tone="brand"
            title="Set the job first"
            description="The interviewer asks about a specific role at a specific company. Without one, it's small talk."
            action={
              <Button asChild>
                <Link href="/dashboard/resume-tailoring">Set your target job</Link>
              </Button>
            }
          />
        ) : (
          <VoiceSetup job={job} onReady={begin} isStarting={isStarting} />
        )}
      </div>
    </VideoInterviewErrorBoundary>
  )
}
