"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Download, Sparkles, Loader2 } from "lucide-react"
import { useCoverLetterStore } from "@/lib/cover-letter-store"
import { useState } from "react"

export function CoverLetterHeader() {
  const { generateAIContent, isGenerating, coverLetterData } = useCoverLetterStore()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    const { jobDetails, personalInfo, content } = coverLetterData
    
    // Validate required data
    if (!jobDetails.jobTitle || !jobDetails.companyName || !personalInfo.fullName || !content.opening) {
      alert("Please complete the cover letter form and generate content before exporting to PDF.")
      return
    }

    setIsExporting(true)
    try {
      const response = await fetch('/api/cover-letter-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coverLetterData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Get the PDF blob and download it
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${personalInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter_${jobDetails.companyName.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b overflow-hidden">
      <div className="flex items-center gap-2 px-2 sm:px-3 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
        <div className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-xs sm:text-sm">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs sm:text-sm truncate">Cover Letter</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateAIContent}
          disabled={isGenerating}
          className="px-2 sm:px-3"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="hidden sm:ml-2 sm:inline">{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
        </Button>
        <Button 
          size="sm" 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-2 sm:px-3"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden sm:ml-2 sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
        </Button>
      </div>
    </header>
  )
}
