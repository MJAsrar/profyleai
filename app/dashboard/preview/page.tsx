import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { ResumePreviewFull } from "@/components/preview/resume-preview-full"

export default function PreviewPage() {
  return (
    <>
      <ToolTopBar title="Preview" />
      <div className="mx-auto w-full max-w-[1100px] px-8 py-8">
        <ResumePreviewFull />
      </div>
    </>
  )
}
