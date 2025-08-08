"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ResumeBuilderHeader } from "@/components/resume-builder/resume-builder-header"
import { ResumeSelection } from "@/components/resume-builder/resume-selection"
import { TemplateSelector } from "@/components/resume-builder/template-selector"
import { ResumeForm } from "@/components/resume-builder/resume-form"
import { ResumePreview } from "@/components/resume-builder/resume-preview"
import { FontSizeControls } from "@/components/resume-builder/font-size-controls"
import { PageContainer } from "@/components/ui/page-container"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

import { useResumeStore, useAutoSave } from "@/lib/resume-store"

export default function ResumeBuilderPage() {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showResumeSelection, setShowResumeSelection] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  
  const { 
    resumeData, 
    selectedTemplate, 
    templates,
    loadCurrentResume, 
    loadTailoredResume, 
    loadResume,
    loadTemplates, 
    createNewResume,
    resetToDefaults,
    isLoading 
  } = useResumeStore()
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const tailoredResumeId = searchParams.get('tailoredResumeId')
  const resumeId = searchParams.get('resumeId')
  
  // Enable auto-save functionality
  useAutoSave()

  // Load templates once on mount
  useEffect(() => {
    if (!templatesLoaded && templates.length === 0) {
      console.log('📚 Loading templates...')
      loadTemplates().then(() => {
        console.log('✅ Templates loaded successfully')
        setTemplatesLoaded(true)
      }).catch((error) => {
        console.error('Failed to load templates:', error)
        setTemplatesLoaded(true) // Set to true anyway to prevent infinite retries
      })
    } else if (templates.length > 0 && !templatesLoaded) {
      console.log('📚 Templates already exist, marking as loaded')
      setTemplatesLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesLoaded, templates.length])

  // Reset initialization when URL params change
  useEffect(() => {
    console.log('🔄 URL params changed, resetting initialization...', { tailoredResumeId, resumeId })
    setIsInitialized(false)
    setShowResumeSelection(false)
    setShowTemplateSelector(false)
  }, [tailoredResumeId, resumeId])

  // Initialize resume based on URL params
  useEffect(() => {
    if (!templatesLoaded || isInitialized) return // Wait for templates and prevent re-initialization
    
    const initializeResume = async () => {
      console.log('🚀 Initializing resume builder...', { tailoredResumeId, resumeId })
      
      try {
        // Check if we should load a specific tailored resume
        if (tailoredResumeId) {
          console.log('Loading tailored resume:', tailoredResumeId)
          try {
            await loadTailoredResume(tailoredResumeId)
          } catch (error) {
            console.error('Failed to load tailored resume, falling back to current resume:', error)
            await loadCurrentResume()
          }
        } 
        // Check if we should load a specific regular resume
        else if (resumeId) {
          console.log('Loading resume:', resumeId)
          try {
            await loadResume(resumeId)
          } catch (error) {
            console.error('Failed to load resume:', error)
            setShowResumeSelection(true)
          }
        }
        // If no specific resume is requested, show selection
        else {
          setShowResumeSelection(true)
        }
      } catch (error) {
        console.error('Failed to initialize resume builder:', error)
        setShowResumeSelection(true)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeResume()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesLoaded, isInitialized]) // Only depend on templates being loaded and initialization state

  const handleCreateNewResume = () => {
    console.log('🆕 Creating new resume...')
    resetToDefaults()
    setShowResumeSelection(false)
    setShowTemplateSelector(true)
    // Clear URL params - this will trigger re-initialization through the URL params useEffect
    router.replace('/dashboard/resume-builder', { scroll: false })
  }

  const handleSelectExistingResume = async (selectedResumeId: string) => {
    try {
      await loadResume(selectedResumeId)
      setShowResumeSelection(false)
      // Update URL to reflect selected resume
      router.replace(`/dashboard/resume-builder?resumeId=${selectedResumeId}`, { scroll: false })
    } catch (error) {
      console.error('Failed to load selected resume:', error)
    }
  }

  const handleBackToSelection = () => {
    console.log('⬅️ Going back to resume selection...')
    setShowResumeSelection(true)
    setShowTemplateSelector(false)
    resetToDefaults()
    // Clear URL params - this will trigger re-initialization through the URL params useEffect
    router.replace('/dashboard/resume-builder', { scroll: false })
  }

  // Show loading state while initializing
  if (isLoading || !isInitialized) {
    return (
      <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Show resume selection screen
  if (showResumeSelection) {
    return (
      <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
        <MotionWrapper animation="fade-in">
          <ResumeSelection 
            onCreateNew={handleCreateNewResume}
            onSelectResume={handleSelectExistingResume}
            onBack={handleBackToSelection}
          />
        </MotionWrapper>
      </PageContainer>
    )
  }

  // Show template selector for new resumes
  if (showTemplateSelector) {
    return (
      <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
        <MotionWrapper animation="fade-in">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={handleBackToSelection} className="text-muted-foreground hover:text-foreground">
                ← Back to Resume Selection
              </button>
            </div>
            <TemplateSelector 
              onTemplateSelect={() => {
                setShowTemplateSelector(false)
                // The template is already set by the TemplateSelector component
                // We don't need to create a new resume here since the user can continue editing
              }}
            />
          </div>
        </MotionWrapper>
      </PageContainer>
    )
  }

  // Main resume builder interface
  return (
    <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
      <MotionWrapper animation="fade-in-down">
        <ResumeBuilderHeader 
          onChangeTemplate={() => setShowTemplateSelector(true)}
          onBack={handleBackToSelection}
        />
      </MotionWrapper>

      <div className="mt-4 sm:mt-6">
        {/* Mobile Layout: Stacked */}
        <div className="xl:hidden space-y-4 sm:space-y-6 lg:space-y-8">
          <MotionWrapper animation="slide-in-up" delay={200}>
            <ResumeForm />
          </MotionWrapper>
          <MotionWrapper animation="slide-in-up" delay={300}>
            <FontSizeControls />
          </MotionWrapper>
          <MotionWrapper animation="slide-in-up" delay={400}>
            <ResumePreview />
          </MotionWrapper>
        </div>

        {/* Desktop Layout: Side by Side */}
        <div className="hidden xl:grid xl:grid-cols-2 gap-8 min-h-[calc(100vh-12rem)]">
          <MotionWrapper animation="slide-in-left" delay={300}>
            <div className="space-y-6">
              <ResumeForm />
              <FontSizeControls />
            </div>
          </MotionWrapper>
          <MotionWrapper animation="slide-in-right" delay={500}>
            <div className="sticky top-6 h-fit">
              <ResumePreview />
            </div>
          </MotionWrapper>
        </div>
      </div>
    </PageContainer>
  )
}
