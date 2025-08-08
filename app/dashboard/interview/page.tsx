import { InterviewHeader } from "@/components/interview/interview-header"
import { InterviewPrep } from "@/components/interview/interview-prep"

export default function InterviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4">
      <InterviewHeader />
      <InterviewPrep />
    </div>
  )
}
