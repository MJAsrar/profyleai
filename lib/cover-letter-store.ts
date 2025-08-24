"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { 
  COVER_LETTER_TONES, 
  type CoverLetterTone 
} from "@/lib/services/gemini-service"

export interface CoverLetterData {
  jobDetails: {
    jobTitle: string
    companyName: string
    hiringManager: string
    jobDescription: string
  }
  personalInfo: {
    fullName: string
    email: string
    phone: string
    address: string
  }
  content: {
    opening: string
    body: string
    closing: string
  }
  tone: CoverLetterTone
}

interface CoverLetterStore {
  coverLetterData: CoverLetterData
  currentStep: number
  isGenerating: boolean
  error: string | null
  lastGenerated: {
    improvements: string[]
    matchScore: number
  } | null
  
  setCoverLetterData: (data: Partial<CoverLetterData>) => void
  setCurrentStep: (step: number) => void
  updateJobDetails: (details: Partial<CoverLetterData["jobDetails"]>) => void
  updatePersonalInfo: (info: Partial<CoverLetterData["personalInfo"]>) => void
  updateContent: (content: Partial<CoverLetterData["content"]>) => void
  updateTone: (tone: CoverLetterData["tone"]) => void
  generateAIContent: () => Promise<void>
  loadPersonalInfoFromResume: () => Promise<void>
  clearError: () => void
}

const initialCoverLetterData: CoverLetterData = {
  jobDetails: {
    jobTitle: "",
    companyName: "",
    hiringManager: "",
    jobDescription: "",
  },
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
  },
  content: {
    opening: "",
    body: "",
    closing: "",
  },
  tone: "professional",
}

export const useCoverLetterStore = create<CoverLetterStore>()(
  persist(
    (set, get) => ({
      coverLetterData: initialCoverLetterData,
      currentStep: 0,
      isGenerating: false,
      error: null,
      lastGenerated: null,

      setCoverLetterData: (data) =>
        set((state) => ({
          coverLetterData: { ...state.coverLetterData, ...data },
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      updateJobDetails: (details) =>
        set((state) => ({
          coverLetterData: {
            ...state.coverLetterData,
            jobDetails: { ...state.coverLetterData.jobDetails, ...details },
          },
        })),

      updatePersonalInfo: (info) =>
        set((state) => ({
          coverLetterData: {
            ...state.coverLetterData,
            personalInfo: { ...state.coverLetterData.personalInfo, ...info },
          },
        })),

      updateContent: (content) =>
        set((state) => ({
          coverLetterData: {
            ...state.coverLetterData,
            content: { ...state.coverLetterData.content, ...content },
          },
        })),

      updateTone: (tone) =>
        set((state) => ({
          coverLetterData: { ...state.coverLetterData, tone },
        })),

      generateAIContent: async () => {
        const state = get()
        const { jobDetails, personalInfo, tone } = state.coverLetterData

        // Validate required fields
        if (!jobDetails.jobTitle || !jobDetails.companyName || !personalInfo.fullName) {
          set({ error: "Please fill in job title, company name, and your full name before generating." })
          return
        }

        if (!personalInfo.email) {
          set({ error: "Please provide your email address before generating." })
          return
        }

        set({ isGenerating: true, error: null })

        try {
          const response = await fetch('/api/cover-letter-generation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jobTitle: jobDetails.jobTitle,
              companyName: jobDetails.companyName,
              hiringManager: jobDetails.hiringManager || undefined,
              jobDescription: jobDetails.jobDescription,
              personalInfo: {
                fullName: personalInfo.fullName,
                email: personalInfo.email,
                phone: personalInfo.phone,
                address: personalInfo.address
              },
              tone
            })
          })

          if (!response.ok) {
            let errorData: any = { error: `HTTP error! status: ${response.status}` }
            try {
              const responseText = await response.text()
              if (responseText) {
                errorData = JSON.parse(responseText)
              }
            } catch (parseError) {
              console.error('Failed to parse error response:', parseError)
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }

          let result: any
          try {
            const responseText = await response.text()
            if (!responseText) {
              throw new Error('Empty response from server')
            }
            result = JSON.parse(responseText)
          } catch (parseError) {
            console.error('Failed to parse success response:', parseError)
            throw new Error('Invalid response format from server')
          }

          if (result.success && result.data) {
        set((state) => ({
          coverLetterData: {
            ...state.coverLetterData,
                content: result.data.content,
              },
              lastGenerated: {
                improvements: result.data.improvements,
                matchScore: result.data.matchScore
              },
              isGenerating: false,
              error: null
            }))
          } else {
            set({ 
              error: result.error || "Failed to generate cover letter", 
              isGenerating: false 
            })
          }
        } catch (error) {
          console.error('Cover letter generation error:', error)
          let errorMessage = "An unexpected error occurred. Please try again."
          
          if (error instanceof Error) {
            if (error.message.includes('fetch')) {
              errorMessage = "Network error. Please check your connection and try again."
            } else if (error.message.includes('401')) {
              errorMessage = "Authentication required. Please log in and try again."
            } else if (error.message.includes('quota') || error.message.includes('rate')) {
              errorMessage = "AI service is busy. Please try again in a moment."
            } else {
              errorMessage = error.message
            }
          }
          
          set({ 
            error: errorMessage, 
            isGenerating: false 
          })
        }
      },

      loadPersonalInfoFromResume: async () => {
        try {
          const response = await fetch('/api/resumes')
          if (!response.ok) {
            throw new Error('Failed to fetch resumes')
          }

          const data = await response.json()
          if (data.success && data.resumes && data.resumes.length > 0) {
            // Get the most recent resume
            const mostRecentResume = data.resumes[0]
            const personalInfo = mostRecentResume.personalInfo

            if (personalInfo) {
              set((state) => ({
                coverLetterData: {
                  ...state.coverLetterData,
                  personalInfo: {
                    fullName: personalInfo.fullName || '',
                    email: personalInfo.email || '',
                    phone: personalInfo.phone || '',
                    address: personalInfo.location || personalInfo.address || ''
                  }
                }
              }))
            }
          }
        } catch (error) {
          console.error('Failed to load personal info from resume:', error)
          set({ error: "Failed to load personal information from resume" })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "cover-letter-store",
      // Don't persist loading states and errors
      partialize: (state) => ({
        coverLetterData: state.coverLetterData,
        currentStep: state.currentStep,
        lastGenerated: state.lastGenerated
      })
    },
  ),
)
