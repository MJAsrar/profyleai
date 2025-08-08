"use client"

import { CoverLetterHeader } from "@/components/cover-letter/cover-letter-header"
import { CoverLetterForm } from "@/components/cover-letter/cover-letter-form"
import { CoverLetterPreview } from "@/components/cover-letter/cover-letter-preview"

export default function CoverLetterPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4">
      <CoverLetterHeader />
      
      {/* Mobile Layout: Stacked */}
      <div className="lg:hidden space-y-4 sm:space-y-6">
        <CoverLetterForm />
        <CoverLetterPreview />
      </div>

      {/* Desktop Layout: Side by Side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6 flex-1">
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
