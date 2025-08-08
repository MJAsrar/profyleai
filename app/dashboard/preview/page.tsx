import { PreviewHeader } from "@/components/preview/preview-header"
import { ResumePreviewFull } from "@/components/preview/resume-preview-full"

export default function PreviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 min-h-screen">
      <PreviewHeader />
      <ResumePreviewFull />
    </div>
  )
}
