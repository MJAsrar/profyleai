/**
 * PDF Export Utilities for API endpoints
 * Provides the same PDF generation as Resume Builder but returns blobs for API responses
 */

import type { ResumeData } from '@/lib/resume-store'
import { FontSizeConfig } from '@/lib/font-config'
import { pdfService, type PDFGenerationOptions } from '@/lib/pdf'
import { initializePDFTemplates, mapTemplateId, arePDFTemplatesReady } from '@/lib/pdf/templates/index'

export interface PDFExportOptions {
  templateId?: string
  pageSize?: 'A4' | 'LETTER'
  fontConfig?: FontSizeConfig
  margins?: [number, number, number, number]
}

/**
 * Fetch template data with cssData from API
 */
async function getTemplateData(templateId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/templates/${templateId}/full`)
    
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
      hasCssData: !!templateData.cssData
    })
    
    return templateData
  } catch (error) {
    console.error(`❌ Failed to fetch template ${templateId}:`, error)
    return null
  }
}

/**
 * Generate PDF blob using the same method as Resume Builder/Preview
 * This ensures consistent formatting across all download sources
 */
export async function generateResumePDFBlob(
  data: ResumeData,
  options: PDFExportOptions = {}
): Promise<Blob> {
  try {
    console.log('🚀 Starting PDF export for API...')
    
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
        mapped: templateId
      })
    }

    // Prepare PDF generation options (same as Resume Builder)
    const pdfOptions: PDFGenerationOptions = {
      template: templateId as 'modern' | 'classic' | 'creative',
      templateData: templateData || undefined,
      fontConfig: options.fontConfig,
      pageSize: options.pageSize || 'LETTER', // Same as Resume Builder
      margins: options.margins || [40, 60, 40, 60] // Same as Resume Builder
    }
    console.log('⚙️ PDF options:', pdfOptions)

    // Generate PDF blob (same engine, returns blob instead of downloading)
    console.log('🔄 Calling pdfService.generatePDFBlob...')
    const blob = await pdfService.generatePDFBlob(data, pdfOptions)
    
    console.log(`✅ PDF blob generated successfully`)
    return blob

  } catch (error) {
    console.error('❌ PDF export failed:', error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}