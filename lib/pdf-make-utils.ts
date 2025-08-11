/**
 * PDFMake Integration Utilities
 * Bridge between existing components and new PDFMake system
 */

import type { ResumeData } from '@/lib/resume-store'
import { FontSizeConfig } from '@/lib/font-config'
import { SpacingConfig } from '@/lib/spacing-config'
import { pdfService, type PDFGenerationOptions } from '@/lib/pdf'
import { initializePDFTemplates, mapTemplateId, arePDFTemplatesReady } from '@/lib/pdf/templates/index'

export interface PDFMakeExportOptions {
  filename?: string
  templateId?: string
  pageSize?: 'A4' | 'LETTER'
  fontConfig?: FontSizeConfig
  spacingConfig?: SpacingConfig
  margins?: [number, number, number, number]
  fallbackToHtml2pdf?: boolean
}

/**
 * Fetch template data with cssData from API
 */
async function getTemplateData(templateId: string) {
  try {
    const response = await fetch(`/api/templates/${templateId}/full`)
    
    if (!response.ok) {
      // Template not found or has no CSS data
      if (response.status === 404) {
        console.log(`Template ${templateId} not found or has no CSS data`)
        return null
      }
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    const templateData = await response.json()
    
    console.log('🎨 Template data received from API:', {
      id: templateData.id,
      name: templateData.name,
      hasCssData: !!templateData.cssData,
      cssDataKeys: templateData.cssData ? Object.keys(templateData.cssData) : [],
      cssDataStructure: templateData.cssData ? {
        hasLayout: !!templateData.cssData.layout,
        hasTypography: !!templateData.cssData.typography,
        hasColors: !!templateData.cssData.colors,
        hasSections: !!templateData.cssData.sections,
        hasElements: !!templateData.cssData.elements
      } : null
    })
    
    return {
      id: templateData.id,
      name: templateData.name,
      cssData: templateData.cssData
    }
  } catch (error) {
    console.error('Error fetching template data:', error)
    return null
  }
}

/**
 * Export resume to PDF using PDFMake
 */
export async function exportResumeToPDFMake(
  data: ResumeData,
  options: PDFMakeExportOptions = {}
): Promise<void> {
  try {
    console.log('🚀 Starting PDFMake export...')
    console.log('Resume data preview:', {
      hasPersonalInfo: !!data?.personalInfo,
      fullName: data?.personalInfo?.fullName || 'Not provided',
      templateId: data?.templateId || 'Not provided',
      sectionsCount: {
        experience: data?.experience?.length || 0,
        education: data?.education?.length || 0,
        skills: data?.skills?.length || 0,
        projects: data?.projects?.length || 0
      }
    })

    // Validate resume data first (lenient validation for PDF)
    const validation = validateResumeForPDF(data)
    
    // Log warnings but don't fail on them
    if (validation.warnings.length > 0) {
      console.warn('📋 PDF Generation warnings:', validation.warnings)
    }
    
    // For development/testing - allow PDF generation with any data
    if (!validation.isValid) {
      console.log('ℹ️ PDF validation warnings detected, but continuing with generation for testing')
      console.log('Validation errors (ignored):', validation.errors)
    }

    // Ensure templates are initialized
    console.log('🔧 Checking template readiness...')
    if (!arePDFTemplatesReady()) {
      console.log('📥 Templates not ready, initializing...')
      await initializePDFTemplates()
      
      // Double-check after initialization
      if (!arePDFTemplatesReady()) {
        console.error('❌ Templates still not ready after initialization')
        throw new Error('Failed to initialize PDF templates')
      }
    } else {
      console.log('✅ Templates already ready')
    }
    
    // Force verification of available templates
    console.log('🔍 Final template verification before PDF generation...')
    const availableTemplates = pdfService.getTemplates()
    console.log('Available PDFMake templates:', availableTemplates.map(t => ({ id: t.id, name: t.name })))

    // Try to get template data with cssData from database
    const originalTemplateId = options.templateId || data.templateId || 'modern'
    const templateData = await getTemplateData(originalTemplateId)
    
    let templateId: string
    if (templateData) {
      templateId = 'dynamic'
      console.log('🎨 Using dynamic template with cssData:', {
        original: originalTemplateId,
        templateName: templateData.name,
        hasCssData: !!templateData.cssData
      })
    } else {
      templateId = mapTemplateId(originalTemplateId)
      console.log('🎨 Template mapping (fallback to hardcoded):', {
        original: originalTemplateId,
        mapped: templateId,
        source: options.templateId ? 'options' : data.templateId ? 'resumeData' : 'default'
      })
    }
    
    // Generate filename
    const filename = options.filename || generateSafeFilename(data.personalInfo?.fullName || 'resume')
    console.log('📄 Generated filename:', filename)

    // Prepare PDF generation options
    const pdfOptions: PDFGenerationOptions = {
      template: templateId as 'modern' | 'classic' | 'creative',
      templateData: templateData || undefined,
      fontConfig: options.fontConfig,
      spacingConfig: options.spacingConfig,
      filename,
      pageSize: options.pageSize || 'LETTER',
      margins: options.margins || [40, 20, 40, 20]
    }
    console.log('⚙️ PDF options:', pdfOptions)

    // Generate PDF
    console.log('🔄 Calling pdfService.generatePDF...')
    await pdfService.generatePDF(data, pdfOptions)
    
    console.log(`✅ PDF generated successfully: ${filename}`)

  } catch (error) {
    console.error('❌ PDFMake export failed:', error)
    
    // Provide more specific error messages
    let errorMessage = 'PDF generation failed. Please try again.'
    if (error instanceof Error) {
      if (error.message.includes('Invalid resume data')) {
        errorMessage = error.message
      } else if (error.message.includes('Template generation failed')) {
        errorMessage = 'Template processing failed. Please check your resume data.'
      } else if (error.message.includes('Template not found')) {
        errorMessage = 'Selected template is not available. Trying Modern template instead.'
      } else {
        errorMessage = `PDF generation error: ${error.message}`
      }
    }
    
    // Fallback to html2pdf if enabled and available
    if (options.fallbackToHtml2pdf) {
      console.log('🔄 Falling back to html2pdf...')
      throw new Error('PDFMake failed, fallback required')
    } else {
      throw new Error(errorMessage)
    }
  }
}

/**
 * Generate PDF blob for preview
 */
export async function generateResumePDFBlob(
  data: ResumeData,
  options: PDFMakeExportOptions = {}
): Promise<Blob> {
  try {
    // Ensure templates are initialized
    if (!arePDFTemplatesReady()) {
      await initializePDFTemplates()
    }

    // Try to get template data with cssData from database
    const originalTemplateId = options.templateId || data.templateId || 'modern'
    const templateData = await getTemplateData(originalTemplateId)
    
    let templateId: string
    if (templateData) {
      templateId = 'dynamic'
      console.log('🎨 Using dynamic template for blob with cssData:', templateData.name)
    } else {
      templateId = mapTemplateId(originalTemplateId)
      console.log('🎨 Using hardcoded template for blob:', templateId)
    }

    // Prepare PDF generation options
    const pdfOptions: PDFGenerationOptions = {
      template: templateId as 'modern' | 'classic' | 'creative',
      templateData: templateData || undefined,
      fontConfig: options.fontConfig,
      spacingConfig: options.spacingConfig,
      pageSize: options.pageSize || 'LETTER',
      margins: options.margins || [40, 20, 40, 20]
    }

    // Generate PDF blob
    const blob = await pdfService.generatePDFBlob(data, pdfOptions)
    
    console.log('✅ PDF blob generated successfully')
    return blob

  } catch (error) {
    console.error('❌ PDF blob generation failed:', error)
    throw new Error('PDF preview generation failed')
  }
}

/**
 * Check if PDFMake is available and ready
 */
export async function isPDFMakeReady(): Promise<boolean> {
  try {
    if (!arePDFTemplatesReady()) {
      await initializePDFTemplates()
    }
    return true
  } catch (error) {
    console.error('PDFMake not ready:', error)
    return false
  }
}

/**
 * Get available PDF templates for UI
 */
export async function getAvailablePDFTemplates() {
  try {
    if (!arePDFTemplatesReady()) {
      await initializePDFTemplates()
    }
    
    const { getAvailablePDFTemplates } = await import('@/lib/pdf/templates')
    return getAvailablePDFTemplates()
  } catch (error) {
    console.error('Failed to get PDF templates:', error)
    return []
  }
}

/**
 * Validate resume data for PDF generation (lenient validation)
 * This is a very permissive validation that allows PDF generation with minimal data
 */
export function validateResumeForPDF(data: ResumeData): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // For PDF generation, we only require minimal data
    // Most validation should be warnings, not errors

    // Very lenient requirement: allow PDF generation even without a name
    // We'll use fallbacks in the templates
    if (!data?.personalInfo?.fullName || data.personalInfo.fullName.trim().length < 1) {
      warnings.push('No name provided - will use default placeholder in PDF')
    }

    // Everything else is optional for PDF generation - convert to warnings
    if (!data?.personalInfo?.email || !data.personalInfo.email.includes('@')) {
      warnings.push('Email address missing or invalid - will be omitted from PDF')
    }

    if (!data?.personalInfo?.phone || data.personalInfo.phone.trim().length < 5) {
      warnings.push('Phone number missing or too short - will be omitted from PDF')
    }

    if (!data?.summary || data.summary.trim().length < 10) {
      warnings.push('Professional summary missing or too short')
    }

    if (!data?.experience || data.experience.length === 0) {
      warnings.push('No work experience added')
    }

    if (!data?.education || data.education.length === 0) {
      warnings.push('No education information added')
    }

    if (!data?.skills || data.skills.length === 0) {
      warnings.push('No skills added')
    }

    // Always return valid for PDF generation - very permissive
    return {
      isValid: true, // Always true for PDF generation
      errors,
      warnings
    }
    
  } catch (error) {
    console.error('Error in validateResumeForPDF:', error)
    // Even if validation fails, allow PDF generation
    return {
      isValid: true,
      errors: [],
      warnings: ['Validation check failed, but proceeding with PDF generation']
    }
  }
}

/**
 * Generate safe filename
 */
export function generateSafeFilename(name: string, suffix?: string): string {
  const cleanName = name
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50) // Limit length
  
  const suffixStr = suffix ? `-${suffix}` : ''
  return `${cleanName}${suffixStr}.pdf`
}

/**
 * Compare PDFMake vs html2pdf capabilities
 */
export function getPDFMethodComparison() {
  return {
    pdfmake: {
      name: 'PDFMake',
      textQuality: 'Excellent - Vector text',
      fileSize: 'Small - Native PDF',
      features: ['Clickable links', 'Bookmarks', 'Metadata', 'Form fields'],
      browserCompatibility: 'Excellent',
      pros: ['Perfect text quality', 'Small file size', 'Advanced features'],
      cons: ['New implementation', 'Different from web view']
    },
    html2pdf: {
      name: 'html2pdf.js',
      textQuality: 'Good - Canvas-based',
      fileSize: 'Large - Image-based',
      features: ['Basic PDF generation'],
      browserCompatibility: 'Good',
      pros: ['Matches web view exactly', 'Established system'],
      cons: ['Potential text blur', 'Large file size', 'Limited features']
    }
  }
}

/**
 * Feature flags for gradual rollout
 */
export const PDFFeatureFlags = {
  enablePDFMake: true,
  enableA4Format: true,
  enableLetterFormat: true,
  enablePreviewGeneration: false, // Not implemented yet
} as const

/**
 * Generate a safe filename for PDF export
 */
export function generatePDFFilename(baseName?: string, suffix?: string): string {
  const name = baseName || 'document'
  const cleanName = name.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_').toLowerCase()
  const suffixStr = suffix ? `_${suffix}` : ''
  return `${cleanName}${suffixStr}.pdf`
}