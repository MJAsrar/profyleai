"use client"

import { CoverLetterHeader } from "@/components/cover-letter/cover-letter-header"
import { CoverLetterForm } from "@/components/cover-letter/cover-letter-form"
import { CoverLetterPreview } from "@/components/cover-letter/cover-letter-preview"

export default function CoverLetterPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <CoverLetterHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="space-y-6">
          <CoverLetterForm />
        </div>
        <div className="lg:sticky lg:top-4">
          <CoverLetterPreview />
        </div>
      </div>
    </div>
  )
}
