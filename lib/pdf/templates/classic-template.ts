/**
 * Classic PDF Template - Traditional, formal design
 */

import type { Content, Style } from 'pdfmake/interfaces'
import type { ResumeData } from '@/lib/resume-store'
import { BasePDFTemplate, type TemplateStyles } from '../template-engine'
import { fontManager } from '../font-manager'

export class ClassicPDFTemplate extends BasePDFTemplate {
  id = 'classic'
  name = 'Classic Professional'
  
  constructor() {
    super()
    console.log('🏗️ ClassicPDFTemplate constructor called')
  }
  
  generate(data: any, options?: any) {
    console.log('📄 ClassicPDFTemplate.generate() called with data:', {
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
      console.log('✅ Classic template generation completed successfully')
      return result
    } catch (error) {
      console.error('❌ Classic template generation failed:', error)
      throw error
    }
  }

  styles: TemplateStyles = {
    fonts: {
      header: 'CrimsonText',  // Traditional serif font for professional look
      body: 'CrimsonText',
      accent: 'CrimsonText'
    },
    colors: {
      primary: '#000000',      // Black
      secondary: '#333333',    // Dark gray
      accent: '#666666',       // Medium gray
      text: '#000000',         // Black
      lightText: '#666666',    // Medium gray
      border: '#000000'        // Black
    },
    spacing: {
      section: 2,  // Minimal section spacing
      paragraph: 1,  // Minimal paragraph spacing
      line: 1  // Minimal line spacing
    },
    sizes: {
      name: 24,
      sectionHeader: 14,
      jobTitle: 12,
      body: 11,
      small: 10
    }
  }

  protected buildHeader(data: ResumeData): Content {
    const contactInfo = this.formatContactInfo(data)
    const fullName = data?.personalInfo?.fullName || 'YOUR NAME'
    
    return {
      stack: [
        // Name - centered
        {
          text: fullName.toUpperCase(),
          style: 'headerName',
          alignment: 'center',
          margin: [0, 0, 0, 0]
        },
        // Professional Title - centered (only if available)
        ...(data?.personalInfo?.professionalTitle ? [{
          text: data.personalInfo.professionalTitle,
          style: 'professionalTitle',
          alignment: 'center',
          margin: [0, 0, 0, 0]
        }] : []),
        // Contact Information - centered (only if we have contact info)
        ...(contactInfo.length > 0 ? [{
          stack: contactInfo.map(info => ({
            text: info,
            style: 'contactInfo',
            alignment: 'center'
          })),
          margin: [0, 0, 0, 0]
        }] : []),
        // Removed separator line for minimal design
      ],
      margin: [0, 0, 0, 0] // No spacing after header
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
        font: this.styles.fonts.header,
        decoration: 'underline'
      },
      
      professionalTitle: {
        fontSize: this.styles.sizes.jobTitle,
        italics: true,
        color: this.styles.colors.secondary,
        font: this.styles.fonts.header
      },
      
      contactInfo: {
        fontSize: this.styles.sizes.body,
        color: this.styles.colors.text,
        margin: [0, 1, 0, 1]
      },
      
      // Section headers - centered and uppercase
      sectionHeader: {
        fontSize: this.styles.sizes.sectionHeader,
        bold: true,
        color: this.styles.colors.primary,
        font: this.styles.fonts.header,
        alignment: 'center',
        decoration: 'underline',
        margin: [0, 0, 0, 10]
      },
      
      // Traditional formal styles
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
        italics: true,
        color: this.styles.colors.secondary,
        margin: [0, 2, 0, 0]
      },
      
      dateText: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.lightText
      },
      
      jobDescription: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        color: this.styles.colors.text,
        alignment: 'justify',
        margin: [0, 4, 0, 0]
      },
      
      achievementItem: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        color: this.styles.colors.text,
        margin: [0, 1, 0, 0]
      },
      
      techLabel: {
        fontSize: this.styles.sizes.small,
        bold: true,
        color: this.styles.colors.primary
      },
      
      techList: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.text
      },
      
      educationDegree: {
        fontSize: this.styles.sizes.jobTitle,
        bold: true,
        color: this.styles.colors.primary
      },
      
      institutionName: {
        fontSize: this.styles.sizes.body,
        italics: true,
        color: this.styles.colors.secondary,
        margin: [0, 2, 0, 0]
      },
      
      fieldOfStudy: {
        fontSize: this.styles.sizes.body,
        color: this.styles.colors.text
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
        italics: true
      },
      
      projectDescription: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.0,
        color: this.styles.colors.text,
        alignment: 'justify',
        margin: [0, 4, 0, 0]
      }
    }
  }

  /**
   * Classic double-line separator
   */
  // Removed createClassicSeparator - no horizontal lines needed

  /**
   * Classic contact formatting - simple and formal
   */
  protected formatContactInfo(data: ResumeData): string[] {
    const contact: string[] = []
    const info = data.personalInfo

    // Format address style: email | phone | location
    const line1: string[] = []
    if (info.email) line1.push(info.email)
    if (info.phone) line1.push(info.phone)
    if (info.location) line1.push(info.location)
    
    if (line1.length > 0) {
      contact.push(line1.join(' | '))
    }

    // Second line for web presence
    const line2: string[] = []
    if (info.website) line2.push(info.website)
    if (info.linkedin) line2.push(info.linkedin)
    if (info.github) line2.push(info.github)
    if (info.portfolio) line2.push(info.portfolio)
    
    if (line2.length > 0) {
      contact.push(line2.join(' | '))
    }

    return contact
  }

  /**
   * Override section header for classic style (uppercase)
   */
  protected createSectionHeader(title: string): Content {
    return {
      text: title.toUpperCase(),
      style: 'sectionHeader',
      margin: [0, 0, 0, this.styles.spacing.paragraph]
    }
  }

  /**
   * Classic experience layout with formal structure
   */
  protected buildExperienceItem(exp: any, isLast: boolean): Content {
    const endDate = exp.isCurrent ? 'Present' : exp.endDate
    const margin = isLast ? [0, 0, 0, 0] : [0, 0, 0, this.styles.spacing.paragraph]

    return {
      stack: [
        // Job title and dates
        {
          columns: [
            {
              text: exp.position,
              style: 'jobTitle',
              width: '*'
            },
            {
              text: `${exp.startDate} - ${endDate}`,
              style: 'dateText',
              width: 'auto',
              alignment: 'right'
            }
          ]
        },
        // Company name
        {
          text: exp.company,
          style: 'companyName'
        },
        // Location if available
        ...(exp.location ? [{
          text: exp.location,
          style: 'dateText',
          margin: [0, 2, 0, 4]
        }] : []),
        // Description
        ...(exp.description ? [{
          text: exp.description,
          style: 'jobDescription',
          margin: [0, 4, 0, 4]
        }] : []),
        // Achievements
        ...(exp.achievements?.length > 0 ? [{
          ul: exp.achievements.map((achievement: string) => ({
            text: achievement,
            style: 'achievementItem'
          })),
          margin: [0, 0, 0, 4]
        }] : []),
        // Technologies
        ...(exp.technologies?.length > 0 ? [{
          text: [
            { text: 'Key Technologies: ', style: 'techLabel' },
            { text: exp.technologies.join(', '), style: 'techList' }
          ],
          margin: [0, 0, 0, 0]
        }] : [])
      ],
      margin
    }
  }

  /**
   * Classic education layout
   */
  protected buildEducationItem(edu: any, isLast: boolean): Content {
    const margin = isLast ? [0, 0, 0, 0] : [0, 0, 0, this.styles.spacing.paragraph]

    return {
      stack: [
        // Degree and dates
        {
          columns: [
            {
              text: edu.degree,
              style: 'educationDegree',
              width: '*'
            },
            {
              text: `${edu.startDate} - ${edu.endDate || 'Present'}`,
              style: 'dateText',
              width: 'auto',
              alignment: 'right'
            }
          ]
        },
        // Institution
        {
          text: edu.institution,
          style: 'institutionName'
        },
        // Field of study and GPA on same line
        {
          columns: [
            {
              text: edu.field || '',
              style: 'fieldOfStudy',
              width: '*'
            },
            ...(edu.gpa ? [{
              text: `GPA: ${edu.gpa}`,
              style: 'gpaText',
              width: 'auto',
              alignment: 'right'
            }] : [])
          ],
          margin: [0, 2, 0, 4]
        },
        // Honors
        ...(edu.honors?.length > 0 ? [{
          text: [
            { text: 'Honors: ', style: 'techLabel' },
            { text: edu.honors.join(', '), style: 'techList' }
          ]
        }] : [])
      ],
      margin
    }
  }
}