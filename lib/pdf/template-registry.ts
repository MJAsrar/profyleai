/**
 * PDF Template Registry - Manages available PDF templates
 */

import type { PDFTemplate } from './pdf-service'
import { BasePDFTemplate } from './template-engine'

export interface TemplateMetadata {
  id: string
  name: string
  category: 'modern' | 'classic' | 'creative'
  description: string
  previewUrl?: string
  features: string[]
  recommended: boolean
}

/**
 * Template Registry Class
 */
export class TemplateRegistry {
  private templates: Map<string, PDFTemplate> = new Map()
  private metadata: Map<string, TemplateMetadata> = new Map()

  /**
   * Register a PDF template
   */
  register(template: PDFTemplate, metadata: TemplateMetadata): void {
    if (this.templates.has(template.id)) {
      console.warn(`Template '${template.id}' is already registered, overwriting...`)
    }

    this.templates.set(template.id, template)
    this.metadata.set(template.id, metadata)
    
    console.log(`PDF Template '${template.name}' registered successfully`)
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): PDFTemplate | undefined {
    return this.templates.get(id)
  }

  /**
   * Get template metadata
   */
  getMetadata(id: string): TemplateMetadata | undefined {
    return this.metadata.get(id)
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): PDFTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: 'modern' | 'classic' | 'creative'): PDFTemplate[] {
    return Array.from(this.templates.values()).filter(template => {
      const metadata = this.metadata.get(template.id)
      return metadata?.category === category
    })
  }

  /**
   * Get template metadata for UI display
   */
  getTemplateList(): Array<TemplateMetadata & { available: boolean }> {
    return Array.from(this.metadata.values()).map(metadata => ({
      ...metadata,
      available: this.templates.has(metadata.id)
    }))
  }

  /**
   * Get recommended templates
   */
  getRecommendedTemplates(): PDFTemplate[] {
    return Array.from(this.templates.values()).filter(template => {
      const metadata = this.metadata.get(template.id)
      return metadata?.recommended
    })
  }

  /**
   * Check if template exists
   */
  hasTemplate(id: string): boolean {
    return this.templates.has(id)
  }

  /**
   * Unregister a template
   */
  unregister(id: string): boolean {
    const hasTemplate = this.templates.has(id)
    this.templates.delete(id)
    this.metadata.delete(id)
    
    if (hasTemplate) {
      console.log(`Template '${id}' unregistered`)
    }
    
    return hasTemplate
  }

  /**
   * Get template count
   */
  getTemplateCount(): number {
    return this.templates.size
  }

  /**
   * Get template categories
   */
  getCategories(): Array<{
    name: 'modern' | 'classic' | 'creative'
    displayName: string
    count: number
  }> {
    const categories = new Map<'modern' | 'classic' | 'creative', number>()
    
    this.metadata.forEach(metadata => {
      categories.set(metadata.category, (categories.get(metadata.category) || 0) + 1)
    })
    
    return [
      {
        name: 'modern',
        displayName: 'Modern',
        count: categories.get('modern') || 0
      },
      {
        name: 'classic',
        displayName: 'Classic',
        count: categories.get('classic') || 0
      },
      {
        name: 'creative',
        displayName: 'Creative',
        count: categories.get('creative') || 0
      }
    ]
  }

  /**
   * Search templates by name or features
   */
  searchTemplates(query: string): PDFTemplate[] {
    const lowerQuery = query.toLowerCase()
    const results: PDFTemplate[] = []
    
    this.metadata.forEach((metadata, id) => {
      const template = this.templates.get(id)
      if (!template) return
      
      // Search in name, description, and features
      const searchText = [
        metadata.name,
        metadata.description,
        ...metadata.features
      ].join(' ').toLowerCase()
      
      if (searchText.includes(lowerQuery)) {
        results.push(template)
      }
    })
    
    return results
  }

  /**
   * Get template statistics
   */
  getStatistics(): {
    total: number
    byCategory: Record<string, number>
    recommended: number
    available: number
  } {
    const stats = {
      total: this.templates.size,
      byCategory: {} as Record<string, number>,
      recommended: 0,
      available: this.templates.size
    }
    
    this.metadata.forEach(metadata => {
      // Count by category
      stats.byCategory[metadata.category] = (stats.byCategory[metadata.category] || 0) + 1
      
      // Count recommended
      if (metadata.recommended) {
        stats.recommended++
      }
    })
    
    return stats
  }

  /**
   * Validate template compatibility
   */
  validateTemplate(template: PDFTemplate): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check required properties
    if (!template.id) {
      errors.push('Template must have an ID')
    }
    
    if (!template.name) {
      errors.push('Template must have a name')
    }
    
    if (typeof template.generate !== 'function') {
      errors.push('Template must have a generate method')
    }
    
    // Check for duplicate ID
    if (template.id && this.templates.has(template.id)) {
      warnings.push(`Template ID '${template.id}' already exists and will be overwritten`)
    }
    
    // Check if extends BasePDFTemplate
    if (!(template instanceof BasePDFTemplate)) {
      warnings.push('Template should extend BasePDFTemplate for best compatibility')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Clear all templates (useful for testing)
   */
  clear(): void {
    this.templates.clear()
    this.metadata.clear()
    console.log('All templates cleared from registry')
  }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry()