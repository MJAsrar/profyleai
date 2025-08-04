/**
 * PDF Templates - Registration and exports
 */

import { ModernPDFTemplate } from './modern-template'
import { ClassicPDFTemplate } from './classic-template'
import { ATSPDFTemplate } from './ats-template'
import { templateRegistry, pdfService } from '../index'
import type { TemplateMetadata } from '../template-registry'

// Template instances - these will be created fresh during initialization
// export const modernTemplate = new ModernPDFTemplate()
// export const classicTemplate = new ClassicPDFTemplate()

// Template metadata for registration
const templateMetadata: TemplateMetadata[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    category: 'modern',
    description: 'Clean, contemporary design with blue accents and modern typography. Perfect for tech and creative professionals.',
    features: [
      'Clean typography',
      'Blue color scheme',
      'Professional layout',
      'Skills in columns',
      'Modern separators',
      'Contact icons'
    ],
    recommended: true
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    category: 'classic',
    description: 'Traditional, formal design with centered headers and underlined sections. Ideal for conservative industries.',
    features: [
      'Traditional layout',
      'Black and white',
      'Centered headers',
      'Formal typography',
      'Double-line separators',
      'Conservative design'
    ],
    recommended: true
  },
  {
    id: 'ats',
    name: 'ATS Friendly',
    category: 'ats',
    description: 'Optimized for Applicant Tracking Systems. Simple, clean format that ATS software can easily parse.',
    features: [
      'One-column layout',
      'Pure black text',
      'No graphics or icons',
      'Standard fonts',
      'Clean bullet points',
      'ATS-optimized formatting'
    ],
    recommended: true
  }
]

/**
 * Initialize and register all PDF templates
 */
export async function initializePDFTemplates(): Promise<void> {
  try {
    console.log('🚀 Initializing PDF templates...')
    
    // Initialize PDF service first
    console.log('🔧 Initializing PDF service...')
    await pdfService.initialize()
    console.log('✅ PDF service initialized')
    
    // Create template instances
    console.log('🏗️ Creating template instances...')
    const modernInstance = new ModernPDFTemplate()
    const classicInstance = new ClassicPDFTemplate()
    const atsInstance = new ATSPDFTemplate()
    console.log('✅ Template instances created:', {
      modern: modernInstance.name,
      classic: classicInstance.name,
      ats: atsInstance.name
    })
    
    // Register Modern template
    console.log('📝 Registering Modern template...')
    templateRegistry.register(modernInstance, templateMetadata[0])
    pdfService.registerTemplate(modernInstance)
    console.log('✅ Modern template registered')
    
    // Register Classic template
    console.log('📝 Registering Classic template...')
    templateRegistry.register(classicInstance, templateMetadata[1])
    pdfService.registerTemplate(classicInstance)
    console.log('✅ Classic template registered')
    
    // Register ATS template
    console.log('📝 Registering ATS template...')
    templateRegistry.register(atsInstance, templateMetadata[2])
    pdfService.registerTemplate(atsInstance)
    console.log('✅ ATS template registered')
    
    // Verify registration
    const registeredTemplates = pdfService.getTemplates()
    console.log('🔍 Verification - Registered templates:', registeredTemplates.map(t => ({ id: t.id, name: t.name })))
    
    console.log('✅ PDF templates initialized successfully')
    console.log(`📊 Total templates: ${templateRegistry.getTemplateCount()}`)
    
    // Log template details
    const stats = templateRegistry.getStatistics()
    console.log('📈 Template statistics:', stats)
    
  } catch (error) {
    console.error('❌ Failed to initialize PDF templates:', error)
    console.error('Error details:', error)
    throw error
  }
}

/**
 * Get available PDF templates for UI
 */
export function getAvailablePDFTemplates() {
  return templateRegistry.getTemplateList()
}

/**
 * Check if PDF templates are ready
 */
export function arePDFTemplatesReady(): boolean {
  const registryCount = templateRegistry.getTemplateCount()
  const serviceTemplates = pdfService.getTemplates()
  const isReady = registryCount > 0 && serviceTemplates.length > 0
  
  console.log('🔍 arePDFTemplatesReady() check:', {
    registryCount,
    serviceTemplateCount: serviceTemplates.length,
    serviceTemplateIds: serviceTemplates.map(t => t.id),
    isReady
  })
  
  return isReady
}

/**
 * Get template by ID (with fallback)
 */
export function getPDFTemplate(id: string) {
  const template = templateRegistry.getTemplate(id)
  if (!template) {
    console.warn(`Template '${id}' not found, falling back to modern`)
    return templateRegistry.getTemplate('modern')
  }
  return template
}

/**
 * Map resume template IDs to PDF template IDs
 */
export function mapTemplateId(originalId: string): string {
  console.log('🗺️ Template ID mapping input:', originalId)
  
  // Map existing template categories to PDF templates
  const mapping: Record<string, string> = {
    // Category mappings (preferred) - Use dynamic template for font configuration support
    'MODERN': 'dynamic',
    'modern': 'dynamic',
    'CLASSIC': 'dynamic', // Changed from 'classic' to support font configuration
    'classic': 'dynamic',
    'CREATIVE': 'dynamic', // Changed from 'modern' to support font configuration
    'creative': 'dynamic',

    
    // Specific template name mappings (fallback for database templates) - Use dynamic for font support
    'modern-professional': 'dynamic', // Changed from 'modern'
    'traditional-professional': 'dynamic',
    'executive-classic': 'dynamic', // Changed from 'classic'
    'clean-minimalist': 'dynamic',
    'bold-modern': 'dynamic', // Changed from 'modern'
    'tech-stack': 'dynamic', // Changed from 'modern'
    'Tech Stack': 'dynamic', // Changed from 'modern'
    'creative-designer': 'dynamic', // Changed from 'modern'
    'artistic-portfolio': 'dynamic' // Changed from 'modern'
  }
  
  const mapped = mapping[originalId] || 'dynamic'
  console.log('🗺️ Template ID mapping result:', { 
    original: originalId, 
    mapped,
    fontConfigSupport: mapped === 'dynamic' ? '✅ YES (Dynamic)' : '⚠️ NO (Static template)'
  })
  
  return mapped
}

// Export template instances and utilities
export { ModernPDFTemplate, ClassicPDFTemplate }
export { DynamicPDFTemplate } from './dynamic-template'