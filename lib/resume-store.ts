"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"
import { 
  CreateResumeInput, 
  PersonalInfo, 
  ExperienceItem, 
  EducationItem, 
  SkillCategory, 
  ProjectItem,
  CertificationItem 
} from "@/lib/validations/resume"

// Template interface matching our API
export interface ResumeTemplate {
  id: string
  name: string
  category: "MODERN" | "CLASSIC" | "CREATIVE" | "ATS"
  previewUrl: string
  isActive: boolean
  usageCount: number
  cssData?: any  // Full CSS data from database
  cssMetadata?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    primaryFont?: string
    layoutType?: string
    pageSize?: string
  }
  features?: {
    supportsMultiColumn: boolean
    hasGradients: boolean
    hasCustomFonts: boolean
    isCreativeStyle: boolean
  }
}

// Resume data interface matching our API validation schemas
export interface ResumeData {
  id?: string
  title: string
  templateId: string
  personalInfo: PersonalInfo
  summary?: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillCategory[]
  projects: ProjectItem[]
  certifications: CertificationItem[]
  isPublic: boolean
}

interface ResumeStore {
  // State
  resumeData: ResumeData
  selectedTemplate: ResumeTemplate | null
  templates: ResumeTemplate[]
  currentStep: number
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  
  // Tailoring state
  isTailoring: boolean
  tailoringData: {
    jobTitle: string
    jobDescription: string
    companyName: string
    matchScore?: number
    tailoringNotes?: string
    tailoredAt?: Date
    atsBreakdown?: {
      keywordMatch: number
      formatScore: number
      relevanceScore: number
      overallScore: number
    }
    detailedChanges?: {
      summary: {
        changed: boolean
        changeType: string
        keywordsAdded: string[]
        improvementReason: string
      }
      experience: Array<{
        id: string
        changed: boolean
        changeType: string
        keywordsAdded: string[]
        improvementReason: string
      }>
      skills: {
        changed: boolean
        changeType: string
        skillsReordered: string[]
        skillsAdded: string[]
        improvementReason: string
      }
      projects?: Array<{
        id: string
        changed: boolean
        changeType: string
        keywordsAdded: string[]
        improvementReason: string
      }>
    }
    keywordAnalysis?: {
      jobKeywords: string[]
      matchedKeywords: string[]
      missedKeywords: string[]
      addedKeywords: string[]
    }
  } | null
  
  // Template actions
  loadTemplates: () => Promise<void>
  setSelectedTemplate: (template: ResumeTemplate) => void
  
  // Resume data actions
  setResumeData: (data: Partial<ResumeData>) => void
  loadResume: (id: string) => Promise<void>
  loadCurrentResume: () => Promise<void>
  loadTailoredResume: (tailoredResumeId: string) => Promise<void>
  saveResume: () => Promise<void>
  createNewResume: (templateId: string) => void
  
  // Resume tailoring actions
  tailorResume: (jobData: { jobTitle: string; jobDescription: string; companyName: string; baseResumeId?: string }) => Promise<{ tailoredResume: any; tailoring: any }>
  revertTailoring: () => Promise<void>
  getTailoringStatus: () => Promise<any>
  
  // Step management
  setCurrentStep: (step: number) => void
  getCompletionPercentage: () => number
  
  // Data update actions
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  updateSummary: (summary: string) => void
  updateTitle: (title: string) => void
  
  // Experience actions
  addExperience: (experience: Omit<ExperienceItem, "id">) => void
  updateExperience: (id: string, experience: Partial<ExperienceItem>) => void
  removeExperience: (id: string) => void
  reorderExperience: (fromIndex: number, toIndex: number) => void
  
  // Education actions
  addEducation: (education: Omit<EducationItem, "id">) => void
  updateEducation: (id: string, education: Partial<EducationItem>) => void
  removeEducation: (id: string) => void
  reorderEducation: (fromIndex: number, toIndex: number) => void
  
  // Skills actions
  addSkillCategory: (category: Omit<SkillCategory, "id">) => void
  updateSkillCategory: (id: string, category: Partial<SkillCategory>) => void
  removeSkillCategory: (id: string) => void
  reorderSkills: (fromIndex: number, toIndex: number) => void
  
  // Projects actions
  addProject: (project: Omit<ProjectItem, "id">) => void
  updateProject: (id: string, project: Partial<ProjectItem>) => void
  removeProject: (id: string) => void
  reorderProjects: (fromIndex: number, toIndex: number) => void
  
  // Certifications actions
  addCertification: (certification: Omit<CertificationItem, "id">) => void
  updateCertification: (id: string, certification: Partial<CertificationItem>) => void
  removeCertification: (id: string) => void
  reorderCertifications: (fromIndex: number, toIndex: number) => void
  
  // Utility actions
  resetToDefaults: () => void
  markAsSaved: () => void
  validateResumeData: () => { isValid: boolean; errors: string[] }
}

const initialResumeData: ResumeData = {
  title: "My Resume",
  templateId: "",
  personalInfo: {
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    portfolio: ""
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  isPublic: false
}

// Utility functions for generating IDs and API calls
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

async function fetchTemplates(): Promise<ResumeTemplate[]> {
  try {
    const response = await fetch('/api/templates')
    if (!response.ok) throw new Error('Failed to fetch templates')
    const data = await response.json()
    return data.templates || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    return []
  }
}

// Helper function to auto-fix URLs by adding https:// if missing
function normalizeUrl(url: string): string {
  if (!url || url.trim() === '') return url
  const trimmed = url.trim()
  
  // If it already has a protocol, return as-is
  if (trimmed.match(/^https?:\/\//)) {
    return trimmed
  }
  
  // If it looks like a URL (contains a dot), prepend https://
  if (trimmed.includes('.')) {
    return `https://${trimmed}`
  }
  
  // Otherwise return as-is (might be partial)
  return trimmed
}

function sanitizeResumeData(resumeData: ResumeData): Partial<ResumeData> {
  // Ensure URL fields are empty strings instead of undefined
  const sanitizePersonalInfo = (info: PersonalInfo): PersonalInfo => ({
  ...info,
  professionalTitle: info.professionalTitle || "",
  website: normalizeUrl(info.website || ""),
  linkedin: normalizeUrl(info.linkedin || ""),
  github: normalizeUrl(info.github || ""),
  portfolio: normalizeUrl(info.portfolio || "")
})

  // Migrate old skills format to new format
  const migrateSkills = (skills: any[]): SkillCategory[] => {
    if (!Array.isArray(skills)) return []
    
    return skills.map((skillCategory: any) => {
      // If it already has the correct structure, return as-is
      if (skillCategory.skills && Array.isArray(skillCategory.skills)) {
        return skillCategory
      }
      
      // Convert old format with 'items' to new format with 'skills'
      if (skillCategory.items && Array.isArray(skillCategory.items)) {
        return {
          ...skillCategory,
          skills: skillCategory.items.map((item: any) => {
            if (typeof item === 'string') {
              return { name: item }
            }
            return item
          }),
          // Remove the old 'items' property
          items: undefined
        }
      }
      
      // Fallback: ensure it has a skills array
      return {
        ...skillCategory,
        skills: skillCategory.skills || []
      }
    })
  }

  // Clean the data and only include valid fields
  const sanitized: Partial<ResumeData> = {
    title: resumeData.title || "My Resume",
    personalInfo: sanitizePersonalInfo(resumeData.personalInfo),
    summary: resumeData.summary || "",
    experience: resumeData.experience || [],
    education: resumeData.education || [],
    skills: migrateSkills(resumeData.skills || []),
    projects: resumeData.projects || [],
    certifications: resumeData.certifications || [],
    isPublic: resumeData.isPublic || false
  }

  // Only include templateId if it's not empty
  if (resumeData.templateId && resumeData.templateId.trim() !== "") {
    sanitized.templateId = resumeData.templateId
  }

  // Include ID for updates
  if (resumeData.id) {
    sanitized.id = resumeData.id
  }

  return sanitized
}

async function saveResumeToAPI(resumeData: ResumeData): Promise<{ id: string }> {
  try {
    // Allow saving even with minimal data - just ensure we have basic structure
    // No validation requirements - user can save at any stage

    const url = resumeData.id ? `/api/resumes/${resumeData.id}` : '/api/resumes'
    const method = resumeData.id ? 'PUT' : 'POST'
    const sanitizedData = sanitizeResumeData(resumeData)
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedData)
    })
    
    if (!response.ok) {
      let error: any = { error: 'Failed to save resume' }
      
      try {
        // Try to parse error response
        const responseText = await response.text()
        if (responseText.trim()) {
          error = JSON.parse(responseText)
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
        // Use default error message
      }
      
      // Provide more specific error messages
      if (error.details && Array.isArray(error.details)) {
        const fieldErrors = error.details.map((detail: any) => {
          if (detail.path && detail.message) {
            return `${detail.path.join('.')}: ${detail.message}`
          }
          return detail.message || "Validation error"
        }).join(", ")
        throw new Error(`Validation failed: ${fieldErrors}`)
      }
      
      throw new Error(error.error || `HTTP ${response.status}: Failed to save resume`)
    }
    
    // Parse successful response
    let data: any
    try {
      const responseText = await response.text()
      if (!responseText.trim()) {
        throw new Error('Empty response from server')
      }
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse success response:', parseError)
      throw new Error('Invalid response from server')
    }
    
    if (!data.resume || !data.resume.id) {
      throw new Error('Invalid response format: missing resume ID')
    }
    
    return { id: data.resume.id }
  } catch (error) {
    console.error('Error saving resume:', error)
    throw error
  }
}

async function loadResumeFromAPI(id: string): Promise<ResumeData> {
  try {
    const response = await fetch(`/api/resumes/${id}`)
    if (!response.ok) throw new Error('Failed to load resume')
    const data = await response.json()
    return data.resume
  } catch (error) {
    console.error('Error loading resume:', error)
    throw error
  }
}

async function loadCurrentResumeFromAPI(): Promise<ResumeData | null> {
  try {
    const response = await fetch('/api/resumes?current=true')
    if (!response.ok) throw new Error('Failed to load current resume')
    const data = await response.json()
    return data.resume || null
  } catch (error) {
    console.error('Error loading current resume:', error)
    throw error
  }
}

// Auto-save hook
export function useAutoSave() {
  const { hasUnsavedChanges, saveResume, isSaving } = useResumeStore()

  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) return

    // Auto-save without validation requirements - save user progress at any stage
    const autoSaveTimer = setTimeout(() => {
      console.log('💾 Auto-saving resume...')
      saveResume().catch((error) => {
        console.error('Auto-save failed:', error)
        // Don't throw error for auto-save failures to avoid breaking the UI
      })
    }, 30000) // Auto-save after 30 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [hasUnsavedChanges, saveResume, isSaving])
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resumeData: initialResumeData,
      selectedTemplate: null,
      templates: [],
      currentStep: 0,
      isLoading: false,
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      
      // Tailoring state
      isTailoring: false,
      tailoringData: null,

      // Template actions
      loadTemplates: async () => {
        set({ isLoading: true })
        try {
          const templates = await fetchTemplates()
          set({ templates, isLoading: false })
        } catch (error) {
          console.error('Failed to load templates:', error)
          set({ isLoading: false })
        }
      },

      setSelectedTemplate: (template) => {
        console.log('📋 Template Selection:', {
          templateId: template.id,
          templateName: template.name,
          templateCategory: template.category,
          previousTemplateId: get().selectedTemplate?.id,
          willUpdateResumeData: get().resumeData.templateId !== template.id
        })
        
        set({ selectedTemplate: template })
        const state = get()
        if (state.resumeData.templateId !== template.id) {
          set((state) => ({
            resumeData: { ...state.resumeData, templateId: template.id },
            hasUnsavedChanges: true
          }))
        }
      },

      // Resume data actions
      setResumeData: (data) =>
        set((state) => ({
          resumeData: { ...state.resumeData, ...data },
          hasUnsavedChanges: true
        })),

      loadResume: async (id) => {
        set({ isLoading: true })
        try {
          const resumeData = await loadResumeFromAPI(id)
          const template = get().templates.find(t => t.id === resumeData.templateId)
          set({ 
            resumeData, 
            selectedTemplate: template || null,
            isLoading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date()
          })
        } catch (error) {
          console.error('Failed to load resume:', error)
          set({ isLoading: false })
          throw error
        }
      },

      loadCurrentResume: async () => {
        set({ isLoading: true })
        try {
          const resumeData = await loadCurrentResumeFromAPI()
          if (resumeData) {
            const template = get().templates.find(t => t.id === resumeData.templateId)
            set({ 
              resumeData, 
              selectedTemplate: template || null,
              isLoading: false,
              hasUnsavedChanges: false,
              lastSaved: new Date()
            })
            console.log('✅ Loaded existing resume:', { id: resumeData.id, title: resumeData.title })
          } else {
            // No existing resume found, keep current state
            set({ isLoading: false })
            console.log('ℹ️ No existing resume found, starting fresh')
          }
        } catch (error) {
          console.error('Failed to load current resume:', error)
          set({ isLoading: false })
          // Don't throw error - just continue with empty resume
        }
      },

      loadTailoredResume: async (tailoredResumeId: string) => {
        set({ isLoading: true })
        try {
          console.log(`📋 Loading tailored resume: ${tailoredResumeId}`)
          
          const response = await fetch(`/api/tailored-resumes/${tailoredResumeId}`)
          if (!response.ok) {
            throw new Error('Failed to load tailored resume')
          }
          
          const data = await response.json()
          const tailoredResume = data.tailoredResume
          
          // Convert tailored resume to resume data format
          const resumeData: ResumeData = {
            id: tailoredResume.id,
            title: tailoredResume.title,
            templateId: tailoredResume.templateId,
            personalInfo: tailoredResume.personalInfo,
            summary: tailoredResume.summary,
            experience: tailoredResume.experience,
            education: tailoredResume.education,
            skills: tailoredResume.skills,
            projects: tailoredResume.projects,
            certifications: tailoredResume.certifications,
            isPublic: false
          }
          
          // Set tailoring data if available
          const tailoringData = tailoredResume.tailoringMetadata ? {
            jobTitle: tailoredResume.jobTitle,
            jobDescription: tailoredResume.jobDescription,
            companyName: tailoredResume.companyName,
            matchScore: tailoredResume.matchScore,
            tailoringNotes: tailoredResume.tailoringMetadata.tailoringNotes,
            tailoredAt: new Date(tailoredResume.createdAt),
            atsBreakdown: tailoredResume.tailoringMetadata.atsBreakdown,
            detailedChanges: tailoredResume.tailoringMetadata.detailedChanges,
            keywordAnalysis: tailoredResume.tailoringMetadata.keywordAnalysis
          } : null
          
          // Find the template
          const template = get().templates.find(t => t.id === tailoredResume.templateId)
          
          set({ 
            resumeData,
            selectedTemplate: template || null,
            tailoringData,
            isLoading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(tailoredResume.updatedAt)
          })
          
          console.log(`✅ Loaded tailored resume: ${tailoredResume.title}`)
        } catch (error) {
          console.error('Failed to load tailored resume:', error)
          set({ isLoading: false })
          throw error
        }
      },

      saveResume: async () => {
        const state = get()
        if (!state.hasUnsavedChanges || state.isSaving) return

        set({ isSaving: true })
        try {
          const result = await saveResumeToAPI(state.resumeData)
          set((state) => ({
            resumeData: { ...state.resumeData, id: result.id },
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaved: new Date()
          }))
        } catch (error) {
          console.error('Failed to save resume:', error)
          set({ isSaving: false })
          
          // Re-throw with user-friendly message if it's a validation error
          if (error instanceof Error) {
            throw error
          } else {
            throw new Error('Failed to save resume. Please check your internet connection and try again.')
          }
        }
      },

      createNewResume: (templateId) => {
        const template = get().templates.find(t => t.id === templateId)
        set({
          resumeData: { ...initialResumeData, templateId },
          selectedTemplate: template || null,
          hasUnsavedChanges: true,
          lastSaved: null
        })
      },

      // Step management
      setCurrentStep: (step) => set({ currentStep: step }),

      getCompletionPercentage: () => {
        const data = get().resumeData
        let completed = 0
        let total = 6 // Total sections
        
        if (data.personalInfo.fullName && data.personalInfo.email) completed++
        if (data.summary && data.summary.length > 20) completed++
        if (data.experience.length > 0) completed++
        if (data.education.length > 0) completed++
        if (data.skills.length > 0) completed++
        if (data.projects.length > 0) completed++
        
        return Math.round((completed / total) * 100)
      },

      // Data update actions
      updatePersonalInfo: (info) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            personalInfo: { ...state.resumeData.personalInfo, ...info },
          },
          hasUnsavedChanges: true
        })),

      updateSummary: (summary) =>
        set((state) => ({
          resumeData: { ...state.resumeData, summary },
          hasUnsavedChanges: true
        })),

      updateTitle: (title) =>
        set((state) => ({
          resumeData: { ...state.resumeData, title },
          hasUnsavedChanges: true
        })),

      // Experience actions
      addExperience: (experience) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: [...state.resumeData.experience, { ...experience, id: generateId() }],
          },
          hasUnsavedChanges: true
        })),

      updateExperience: (id, experience) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.map((exp) => 
              exp.id === id ? { ...exp, ...experience } : exp
            ),
          },
          hasUnsavedChanges: true
        })),

      removeExperience: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.filter((exp) => exp.id !== id),
          },
          hasUnsavedChanges: true
        })),

      reorderExperience: (fromIndex, toIndex) =>
        set((state) => {
          const newExperience = [...state.resumeData.experience]
          const [removed] = newExperience.splice(fromIndex, 1)
          newExperience.splice(toIndex, 0, removed)
          return {
            resumeData: { ...state.resumeData, experience: newExperience },
            hasUnsavedChanges: true
          }
        }),

      // Education actions  
      addEducation: (education) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: [...state.resumeData.education, { ...education, id: generateId() }],
          },
          hasUnsavedChanges: true
        })),

      updateEducation: (id, education) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.map((edu) => 
              edu.id === id ? { ...edu, ...education } : edu
            ),
          },
          hasUnsavedChanges: true
        })),

      removeEducation: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.filter((edu) => edu.id !== id),
          },
          hasUnsavedChanges: true
        })),

      reorderEducation: (fromIndex, toIndex) =>
        set((state) => {
          const newEducation = [...state.resumeData.education]
          const [removed] = newEducation.splice(fromIndex, 1)
          newEducation.splice(toIndex, 0, removed)
          return {
            resumeData: { ...state.resumeData, education: newEducation },
            hasUnsavedChanges: true
          }
        }),

      // Skills actions
      addSkillCategory: (category) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: [...state.resumeData.skills, { ...category, id: generateId() }],
          },
          hasUnsavedChanges: true
        })),

      updateSkillCategory: (id, category) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.map((skill) => 
              skill.id === id ? { ...skill, ...category } : skill
            ),
          },
          hasUnsavedChanges: true
        })),

      removeSkillCategory: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.filter((skill) => skill.id !== id),
          },
          hasUnsavedChanges: true
        })),

      reorderSkills: (fromIndex, toIndex) =>
        set((state) => {
          const newSkills = [...state.resumeData.skills]
          const [removed] = newSkills.splice(fromIndex, 1)
          newSkills.splice(toIndex, 0, removed)
          return {
            resumeData: { ...state.resumeData, skills: newSkills },
            hasUnsavedChanges: true
          }
        }),

      // Projects actions
      addProject: (project) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: [...state.resumeData.projects, { ...project, id: generateId() }],
          },
          hasUnsavedChanges: true
        })),

      updateProject: (id, project) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: state.resumeData.projects.map((proj) => 
              proj.id === id ? { ...proj, ...project } : proj
            ),
          },
          hasUnsavedChanges: true
        })),

      removeProject: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            projects: state.resumeData.projects.filter((proj) => proj.id !== id),
          },
          hasUnsavedChanges: true
        })),

      reorderProjects: (fromIndex, toIndex) =>
        set((state) => {
          const newProjects = [...state.resumeData.projects]
          const [removed] = newProjects.splice(fromIndex, 1)
          newProjects.splice(toIndex, 0, removed)
          return {
            resumeData: { ...state.resumeData, projects: newProjects },
            hasUnsavedChanges: true
          }
        }),

      // Certifications actions
      addCertification: (certification) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            certifications: [...state.resumeData.certifications, { ...certification, id: generateId() }],
          },
          hasUnsavedChanges: true
        })),

      updateCertification: (id, certification) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            certifications: state.resumeData.certifications.map((cert) => 
              cert.id === id ? { ...cert, ...certification } : cert
            ),
          },
          hasUnsavedChanges: true
        })),

      removeCertification: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            certifications: state.resumeData.certifications.filter((cert) => cert.id !== id),
          },
          hasUnsavedChanges: true
        })),

      reorderCertifications: (fromIndex, toIndex) =>
        set((state) => {
          const newCertifications = [...state.resumeData.certifications]
          const [removed] = newCertifications.splice(fromIndex, 1)
          newCertifications.splice(toIndex, 0, removed)
          return {
            resumeData: { ...state.resumeData, certifications: newCertifications },
            hasUnsavedChanges: true
          }
        }),

      // Resume tailoring actions
      tailorResume: async (jobData) => {
        const state = get()
        if (!state.resumeData.id) {
          throw new Error("Please save your resume before tailoring")
        }

        set({ isTailoring: true })
        try {
          const response = await fetch('/api/resume-tailoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to tailor resume')
          }

          const result = await response.json()
          
          // Store the latest tailoring data for the preview component
          set({
            tailoringData: {
              jobTitle: jobData.jobTitle,
              jobDescription: jobData.jobDescription,
              companyName: jobData.companyName,
              matchScore: result.tailoring.matchScore,
              tailoringNotes: result.tailoring.tailoringNotes,
              tailoredAt: new Date(result.tailoring.tailoredAt),
              atsBreakdown: result.tailoring.atsBreakdown,
              detailedChanges: result.tailoring.detailedChanges,
              keywordAnalysis: result.tailoring.keywordAnalysis
            },
            isTailoring: false
          })

          console.log('✅ Resume tailored successfully and saved as new version:', {
            tailoredResumeId: result.tailoredResume.id,
            matchScore: result.tailoring.matchScore,
            changesCount: result.tailoring.changesCount
          })

          // Return the tailored resume data for potential redirection
          return {
            tailoredResume: result.tailoredResume,
            tailoring: result.tailoring
          }

        } catch (error) {
          console.error('Failed to tailor resume:', error)
          set({ isTailoring: false })
          throw error
        }
      },

      revertTailoring: async () => {
        const state = get()
        if (!state.resumeData.id) {
          throw new Error("No resume to revert")
        }

        set({ isLoading: true })
        try {
          const response = await fetch('/api/resume-tailoring', {
            method: 'DELETE'
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to revert resume')
          }

          const result = await response.json()
          
          // Update the store with the original resume data
          set({
            resumeData: result.resume,
            tailoringData: null,
            isLoading: false,
            hasUnsavedChanges: false,
            lastSaved: new Date()
          })

          console.log('✅ Resume reverted to original')

        } catch (error) {
          console.error('Failed to revert resume:', error)
          set({ isLoading: false })
          throw error
        }
      },

      getTailoringStatus: async () => {
        try {
          const response = await fetch('/api/resume-tailoring')
          if (!response.ok) throw new Error('Failed to get tailoring status')
          
          const status = await response.json()
          
          // Update local state if there's tailoring data
          if (status.hasTailoredResume && status.currentTailoring) {
            set({
              tailoringData: {
                jobTitle: status.currentTailoring.jobTitle,
                jobDescription: '', // Not returned by status endpoint
                companyName: status.currentTailoring.companyName,
                matchScore: status.matchScore,
                tailoredAt: new Date(status.currentTailoring.tailoredAt)
              }
            })
          }
          
          return status
        } catch (error) {
          console.error('Failed to get tailoring status:', error)
          return { hasTailoredResume: false }
        }
      },

      // Utility actions
      resetToDefaults: () => set({
        resumeData: initialResumeData,
        selectedTemplate: null,
        currentStep: 0,
        hasUnsavedChanges: false,
        lastSaved: null,
        tailoringData: null
      }),

      markAsSaved: () => set({
        hasUnsavedChanges: false,
        lastSaved: new Date()
      }),

      validateResumeData: () => {
        const data = get().resumeData
        const errors: string[] = []

        // Check required fields
        if (!data.templateId || data.templateId.trim() === "") {
          errors.push("Please select a template")
        }

        if (!data.personalInfo.fullName || data.personalInfo.fullName.trim().length < 2) {
          errors.push("Please enter your full name (at least 2 characters)")
        }

        if (!data.personalInfo.email || !data.personalInfo.email.includes("@")) {
          errors.push("Please enter a valid email address")
        }

        // Validate URLs if they're provided
        const urlFields = [
          { field: data.personalInfo.website, name: "Website" },
          { field: data.personalInfo.linkedin, name: "LinkedIn" },
          { field: data.personalInfo.github, name: "GitHub" },
          { field: data.personalInfo.portfolio, name: "Portfolio" }
        ]

        urlFields.forEach(({ field, name }) => {
          if (field && field.trim() !== "") {
            const trimmedField = field.trim()
            // Allow partial URLs during typing, only validate complete URLs
            if (trimmedField.length > 3 && !trimmedField.match(/^https?:\/\//) && !trimmedField.includes('.')) {
              // Skip validation for obvious partial entries (like "gith", "www", etc.)
              return
            }
            // For URLs that look complete but don't have protocol, suggest adding https://
            if (trimmedField.includes('.') && !trimmedField.match(/^https?:\/\/.+/)) {
              errors.push(`${name}: Please add https:// to the beginning (e.g., https://${trimmedField})`)
            }
          }
        })

        // Validate experience entries
        data.experience.forEach((exp, index) => {
          if (!exp.company || exp.company.trim() === "") {
            errors.push(`Experience ${index + 1}: Company name is required`)
          }
          if (!exp.position || exp.position.trim() === "") {
            errors.push(`Experience ${index + 1}: Position is required`)
          }
          if (!exp.startDate || exp.startDate.trim() === "") {
            errors.push(`Experience ${index + 1}: Start date is required`)
          }
        })

        // Validate education entries
        data.education.forEach((edu, index) => {
          if (!edu.institution || edu.institution.trim() === "") {
            errors.push(`Education ${index + 1}: Institution name is required`)
          }
          if (!edu.degree || edu.degree.trim() === "") {
            errors.push(`Education ${index + 1}: Degree is required`)
          }
          if (!edu.startDate || edu.startDate.trim() === "") {
            errors.push(`Education ${index + 1}: Start date is required`)
          }
        })

        // Validate skills
        data.skills.forEach((skillCat, index) => {
          if (!skillCat.category || skillCat.category.trim() === "") {
            errors.push(`Skill category ${index + 1}: Category name is required`)
          }
          if (!skillCat.skills || skillCat.skills.length === 0) {
            errors.push(`Skill category ${index + 1}: At least one skill is required`)
          } else {
            skillCat.skills.forEach((skill, skillIndex) => {
              if (!skill.name || skill.name.trim() === "") {
                errors.push(`Skill category ${index + 1}, skill ${skillIndex + 1}: Skill name is required`)
              }
            })
          }
        })

        // Validate projects
        data.projects.forEach((project, index) => {
          if (!project.name || project.name.trim() === "") {
            errors.push(`Project ${index + 1}: Project name is required`)
          }
          if (!project.description || project.description.trim().length < 10) {
            errors.push(`Project ${index + 1}: Description must be at least 10 characters`)
          }
        })

        // Validate certifications
        data.certifications.forEach((cert, index) => {
          if (!cert.name || cert.name.trim() === "") {
            errors.push(`Certification ${index + 1}: Certification name is required`)
          }
          if (!cert.issuedBy || cert.issuedBy.trim() === "") {
            errors.push(`Certification ${index + 1}: Issuing organization is required`)
          }
          if (!cert.issueDate || cert.issueDate.trim() === "") {
            errors.push(`Certification ${index + 1}: Issue date is required`)
          }
          if (cert.verificationUrl && cert.verificationUrl.trim() !== "") {
            const trimmedUrl = cert.verificationUrl.trim()
            // Allow partial URLs during typing, only validate complete URLs
            if (trimmedUrl.length > 3 && !trimmedUrl.match(/^https?:\/\//) && !trimmedUrl.includes('.')) {
              // Skip validation for obvious partial entries
              return
            }
            // For URLs that look complete but don't have protocol, suggest adding https://
            if (trimmedUrl.includes('.') && !trimmedUrl.match(/^https?:\/\/.+/)) {
              errors.push(`Certification ${index + 1}: Please add https:// to the beginning of verification URL (e.g., https://${trimmedUrl})`)
            }
          }
        })

        return {
          isValid: errors.length === 0,
          errors
        }
      },
    }),
    {
      name: "resume-store",
      onRehydrateStorage: () => (state) => {
        // Migrate old skills format when store is rehydrated from localStorage
        if (state?.resumeData?.skills) {
          const migrateSkills = (skills: any[]): SkillCategory[] => {
            if (!Array.isArray(skills)) return []
            
            return skills.map((skillCategory: any) => {
              // If it already has the correct structure, return as-is
              if (skillCategory.skills && Array.isArray(skillCategory.skills)) {
                return skillCategory
              }
              
              // Convert old format with 'items' to new format with 'skills'
              if (skillCategory.items && Array.isArray(skillCategory.items)) {
                return {
                  ...skillCategory,
                  skills: skillCategory.items.map((item: any) => {
                    if (typeof item === 'string') {
                      return { name: item }
                    }
                    return item
                  }),
                  // Remove the old 'items' property
                  items: undefined
                }
              }
              
              // Fallback: ensure it has a skills array
              return {
                ...skillCategory,
                skills: skillCategory.skills || []
              }
            })
          }

          state.resumeData.skills = migrateSkills(state.resumeData.skills)
        }

        // Ensure certifications field exists for existing users
        if (state?.resumeData && !Array.isArray(state.resumeData.certifications)) {
          state.resumeData.certifications = []
        }

        // Convert string dates back to Date objects after rehydration
        if (state?.lastSaved && typeof state.lastSaved === 'string') {
          state.lastSaved = new Date(state.lastSaved)
        }
      }
    },
  ),
)
