/**
 * PDF Module - Main exports
 */

// Core services
export { PDFService, pdfService } from './pdf-service'
export { FontManager, fontManager } from './font-manager'
export { TemplateRegistry, templateRegistry } from './template-registry'

// Base classes and interfaces
export { BasePDFTemplate } from './template-engine'

// Types
export type { 
  PDFGenerationOptions, 
  PDFTemplate 
} from './pdf-service'

export type { 
  FontDefinition, 
  FontVariant 
} from './font-manager'

export type { 
  TemplateColors, 
  TemplateStyles 
} from './template-engine'

export type { 
  TemplateMetadata 
} from './template-registry'