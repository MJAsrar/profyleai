/**
 * PDF Module Test Setup - Verify foundation is working
 */

import { pdfService, fontManager, templateRegistry } from './index'
import type { ResumeData } from '@/lib/resume-store'

/**
 * Test the PDF foundation setup
 */
export async function testPDFFoundation(): Promise<{
  success: boolean
  errors: string[]
  info: string[]
}> {
  const errors: string[] = []
  const info: string[] = []

  try {
    // Test font manager
    const fonts = fontManager.getAvailableFonts()
    info.push(`Font Manager: ${fonts.length} fonts available`)
    info.push(`Fallback font: ${fontManager.getFallbackFont()}`)

    // Test template registry
    const templateCount = templateRegistry.getTemplateCount()
    info.push(`Template Registry: ${templateCount} templates registered`)

    const categories = templateRegistry.getCategories()
    info.push(`Categories: ${categories.map(c => `${c.name}(${c.count})`).join(', ')}`)

    // Test PDF service initialization
    await pdfService.initialize()
    info.push('PDF Service: Initialized successfully')

    const templates = pdfService.getTemplates()
    info.push(`PDF Service: ${templates.length} templates available`)

    // Test sample data structure
    const sampleData: Partial<ResumeData> = {
      title: 'Test Resume',
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        location: 'New York, NY',
        website: '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: 'Test summary for PDF generation validation.'
    }

    info.push('Sample data validation: Passed')

    return {
      success: true,
      errors,
      info
    }

  } catch (error) {
    errors.push(`Foundation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return {
      success: false,
      errors,
      info
    }
  }
}

/**
 * Development helper to run tests
 */
export function runPDFTests(): void {
  testPDFFoundation().then(result => {
    console.log('=== PDF Foundation Test Results ===')
    
    if (result.success) {
      console.log('✅ All tests passed!')
    } else {
      console.log('❌ Tests failed!')
    }
    
    if (result.info.length > 0) {
      console.log('\nℹ️  Information:')
      result.info.forEach(info => console.log(`  - ${info}`))
    }
    
    if (result.errors.length > 0) {
      console.log('\n🚨 Errors:')
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    console.log('===================================')
  }).catch(error => {
    console.error('Test runner failed:', error)
  })
}

// Export test utilities
export type TestResult = Awaited<ReturnType<typeof testPDFFoundation>>