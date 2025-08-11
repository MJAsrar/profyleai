/**
 * Modern PDF Template - Clean, professional design
 */

import type { Content, Style } from 'pdfmake/interfaces'
import type { ResumeData } from '@/lib/resume-store'
import { BasePDFTemplate, type TemplateStyles } from '../template-engine'
import { fontManager } from '../font-manager'

export class ModernPDFTemplate extends BasePDFTemplate {
  id = 'modern'
  name = 'Modern Professional'
  
  constructor() {
    super()
    console.log('🏗️ ModernPDFTemplate constructor called')
  }
  
  generate(data: any, options?: any) {
    console.log('📄 ModernPDFTemplate.generate() called with data:', {
      hasPersonalInfo: !!data?.personalInfo,
      fullName: data?.personalInfo?.fullName,
      sectionsCount: {
        experience: data?.experience?.length || 0,
        education: data?.education?.length || 0,
        skills: data?.skills?.length || 0,
        projects: data?.projects?.length || 0
      }
    })
    
    try {
      const result = super.generate(data, options)
      console.log('✅ Modern template generation completed successfully')
      return result
    } catch (error) {
      console.error('❌ Modern template generation failed:', error)
      throw error
    }
  }

  styles: TemplateStyles = {
    fonts: {
      header: 'Roboto',
      body: 'Roboto', 
      accent: 'Roboto'
    },
    colors: {
      primary: '#2563eb',      // Blue-600
      secondary: '#64748b',    // Slate-500
      accent: '#0ea5e9',       // Sky-500
      text: '#1e293b',         // Slate-800
      lightText: '#64748b',    // Slate-500
      border: '#e2e8f0'        // Slate-200
    },
    spacing: {
      section: 4, // Doubled section spacing (~0.25rem in points)
      paragraph: 0,
      line: 0
    },
    sizes: {
      name: 28,
      sectionHeader: 16,
      jobTitle: 14,
      body: 11,
      small: 10
    }
  }

  protected buildHeader(data: ResumeData): Content {
    const contactInfo = this.formatContactInfo(data)
    const fullName = data?.personalInfo?.fullName || 'Your Name'
    
    return {
      stack: [
        // Name
        {
          text: fullName,
          style: 'headerName',
          margin: [0, 0, 0, 0] as [number, number, number, number]
        },
        // Professional Title - only show if available
        ...(data?.personalInfo?.professionalTitle ? [{
          text: data.personalInfo.professionalTitle,
          style: 'professionalTitle',
          margin: [0, 2, 0, 0] as [number, number, number, number]
        }] : []),
        // Contact Information - only show if we have contact info
        ...(contactInfo.length > 0 ? [{
          text: contactInfo.join(' • '),
          style: 'contactInfo',
          margin: [0, 0, 0, 0] as [number, number, number, number]
        }] : []),
        // Removed separator line for minimal design
      ],
      margin: [0, 0, 0, 0] as [number, number, number, number] // No spacing after header
    }
  }

  protected getDocumentStyles(): { [key: string]: Style } {
    return {
      ...this.getCommonStyles(),
      section: {
        margin: [0, 0, 0, 12] // Increased bottom margin for better section separation
      },
      
      // Header specific styles
      headerName: {
        fontSize: this.styles.sizes.name,
        bold: true,
        color: this.styles.colors.primary,
        font: this.styles.fonts.header
      },
      
      professionalTitle: {
        fontSize: this.styles.sizes.jobTitle,
        color: this.styles.colors.secondary,
        font: this.styles.fonts.header
      },
      
      contactInfo: {
        fontSize: this.styles.sizes.body,
        color: this.styles.colors.secondary,
        alignment: 'left'
      },
      
      // Section headers
      sectionHeader: {
        fontSize: this.styles.sizes.sectionHeader,
        bold: true,
        color: this.styles.colors.primary,
        font: this.styles.fonts.header,
                  margin: [0, 0, 0, 0] as [number, number, number, number]
      },
      
      // Enhanced styles for modern look
      summaryText: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        alignment: 'justify',
        color: this.styles.colors.text
      },
      
      jobTitle: {
        fontSize: this.styles.sizes.jobTitle,
        bold: true,
        color: this.styles.colors.primary
      },
      
      companyName: {
        fontSize: this.styles.sizes.body,
        bold: true,
        color: this.styles.colors.secondary,
        margin: [0, 0, 0, 0] as [number, number, number, number]
      },
      
      dateText: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.lightText,
        italics: true
      },
      
      jobDescription: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        color: this.styles.colors.text,
        margin: [0, 0, 0, 0] as [number, number, number, number]
      },
      
      achievementItem: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        color: this.styles.colors.text,
        margin: [0, 0, 0, 0] as [number, number, number, number]
      },
      
      techLabel: {
        fontSize: this.styles.sizes.small,
        bold: true,
        color: this.styles.colors.primary
      },
      
      techList: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.text,
        italics: true
      },
      
      educationDegree: {
        fontSize: this.styles.sizes.jobTitle,
        bold: true,
        color: this.styles.colors.primary
      },
      
      institutionName: {
        fontSize: this.styles.sizes.body,
        bold: true,
        color: this.styles.colors.secondary,
        margin: [0, 0, 0, 0] as [number, number, number, number]
      },
      
      fieldOfStudy: {
        fontSize: this.styles.sizes.body,
        color: this.styles.colors.text,
        italics: true
      },
      
      gpaText: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.lightText
      },
      
      skillCategoryName: {
        fontSize: this.styles.sizes.body,
        bold: true,
        color: this.styles.colors.primary
      },
      
      skillList: {
        fontSize: this.styles.sizes.body,
        color: this.styles.colors.text
      },
      
      projectName: {
        fontSize: this.styles.sizes.jobTitle,
        bold: true,
        color: this.styles.colors.primary
      },
      
      projectUrl: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.accent,
        decoration: 'underline'
      },
      
      projectDescription: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        color: this.styles.colors.text,
        margin: [0, 0, 0, 0] as [number, number, number, number]
      }
    }
  }

  /**
   * Override separator for modern style
   */
  // Removed createSeparator - no horizontal lines needed

  /**
   * Modern-specific contact formatting with icons (simulated with symbols)
   */
  protected formatContactInfo(data: ResumeData): string[] {
    const contact: string[] = []
    const info = data.personalInfo

    // Basic contact info line
    const basicContact: string[] = []
    if (info.email) basicContact.push(`📧 ${info.email}`)
    if (info.phone) basicContact.push(`📱 ${info.phone}`)
    if (info.location) basicContact.push(`📍 ${info.location}`)
    
    if (basicContact.length > 0) {
      contact.push(basicContact.join(' • '))
    }

    // Websites line
    const websites: string[] = []
    if (info.website) websites.push(`🌐 ${info.website}`)
    if (info.linkedin) websites.push(`💼 ${info.linkedin}`)
    if (info.github) websites.push(`💻 ${info.github}`)
    if (info.portfolio) websites.push(`📁 ${info.portfolio}`)
    
    if (websites.length > 0) {
      contact.push(websites.join(' • '))
    }

    return contact
  }

  /**
   * Override skills section for modern column layout
   */
  protected buildSkills(skills: any[]): Content {
    // Ensure skills is an array and not empty
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return {
        stack: [],
        margin: [0, 0, 0, 0] as [number, number, number, number]
      }
    }

    // Group skills into columns for better modern layout
    const skillColumns: Content[] = []
    
    skills.forEach((category, index) => {
      // Safely handle category and skills data
      if (!category || !category.category) return
      
      let skillTexts = ''
      if (category.skills && Array.isArray(category.skills) && category.skills.length > 0) {
        skillTexts = category.skills
          .filter((skill: any) => skill && skill.name) // Filter out invalid skills
          .map((skill: any) => skill.name)
          .join(' • ')
      }
      
      // Only add if we have skill texts
      if (skillTexts) {
        skillColumns.push({
          text: [
            { text: `${category.category}: `, style: 'skillCategoryName' },
            { text: skillTexts, style: 'skillList' }
          ],
          margin: [0, 0, 0, 0] as [number, number, number, number]
        })
      }
    })

    // Return empty if no valid skills
    if (skillColumns.length === 0) {
      return {
        stack: [],
        margin: [0, 0, 0, 0] as [number, number, number, number]
      }
    }

    return {
      stack: [
        this.createSectionHeader('Skills & Technologies'),
        {
          columns: [
            {
              stack: skillColumns.filter((_, index) => index % 2 === 0),
              width: '*'
            },
            {
              stack: skillColumns.filter((_, index) => index % 2 === 1),
              width: '*'
            }
          ],
          columnGap: 20
        }
      ],
      margin: [0, 0, 0, 0] as [number, number, number, number]
    }
  }

  /**
   * Enhanced experience section with better spacing
   */
  protected buildExperienceItem(exp: any, isLast: boolean): Content {
    const endDate = exp.isCurrent ? 'Present' : exp.endDate
    const margin: [number, number, number, number] = [0, 0, 0, 0]

    return {
      stack: [
        // Job title and company in one line, dates on right
        {
          columns: [
            {
              stack: [
                {
                  text: exp.position,
                  style: 'jobTitle'
                },
                {
                  text: exp.company,
                  style: 'companyName'
                }
              ],
              width: '*'
            },
            {
              text: `${exp.startDate} - ${endDate}`,
              style: 'dateText',
              width: 'auto',
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 0] as [number, number, number, number]
        },
        // Description
        ...(exp.description ? [{
          text: exp.description,
          style: 'jobDescription',
          margin: [0, 0, 0, 0] as [number, number, number, number]
        }] : []),
        // Achievements with bullet points
        ...(exp.achievements?.length > 0 ? [{
          ul: exp.achievements.map((achievement: string) => ({
            text: achievement,
            style: 'achievementItem'
          })),
          margin: [0, 0, 0, 0] as [number, number, number, number]
        }] : []),
        // Technologies as tags
        ...(exp.technologies?.length > 0 ? [{
          text: [
            { text: 'Technologies: ', style: 'techLabel' },
            { text: exp.technologies.join(' • '), style: 'techList' }
          ],
          margin: [0, 0, 0, 0] as [number, number, number, number]
        }] : [])
      ],
      margin
    }
  }
}