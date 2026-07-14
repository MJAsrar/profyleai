/**
 * PDF Template Engine - Base classes and interfaces for PDF template generation
 */

import type { TDocumentDefinitions, Content, ContentTable, ContentText, Style, Margins } from 'pdfmake/interfaces'
import type { ResumeData } from '@/lib/resume-store'
import type { PDFGenerationOptions } from './pdf-service'
import { fontManager } from './font-manager'

// Define types locally to avoid import issues
interface ExperienceItem {
  id?: string
  company?: string
  position?: string
  location?: string
  startDate?: string
  endDate?: string
  isCurrent: boolean
  description?: string
  achievements?: string[]
  technologies?: string[]
}

interface EducationItem {
  id?: string
  institution?: string
  degree?: string
  field?: string
  location?: string
  startDate?: string
  endDate?: string
  gpa?: string
  honors?: string[]
  relevantCourses?: string[]
}

interface SkillCategory {
  id?: string
  category?: string
  skills: Array<{
    name?: string
    level?: string
  }>
}

interface ProjectItem {
  id?: string
  name?: string
  description?: string
  technologies?: string[]
  startDate?: string
  endDate?: string
  liveUrl?: string
  githubUrl?: string
  imageUrl?: string
  highlights?: string[]
}

export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
  text: string
  lightText: string
  border: string
}

export interface TemplateStyles {
  fonts: {
    header: string
    body: string
    accent: string
  }
  colors: TemplateColors
  spacing: {
    section: number
    paragraph: number
    line: number
  }
  sizes: {
    name: number
    sectionHeader: number
    jobTitle: number
    body: number
    small: number
  }
}

/**
 * Base PDF Template Class
 */
export abstract class BasePDFTemplate {
  abstract id: string
  abstract name: string
  abstract styles: TemplateStyles

  /**
   * Main template generation method
   */
  generate(data: ResumeData, options?: Partial<PDFGenerationOptions>): TDocumentDefinitions {
    const content: Content[] = []
    
    try {
      // Build document sections with safe data access
      content.push(this.buildHeader(data))
      
      if (data.summary && data.summary.trim().length > 0) {
        content.push(this.buildSummary(data.summary))
      }
      
      if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        content.push(this.buildExperience(data.experience))
      }
      
      if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        content.push(this.buildEducation(data.education))
      }
      
      if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        content.push(this.buildSkills(data.skills))
      }
      
      if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        content.push(this.buildProjects(data.projects))
      }

      return {
        content,
        styles: this.getDocumentStyles(),
        defaultStyle: {
          fontSize: this.styles.sizes.body,
          font: this.styles.fonts.body,
          color: this.styles.colors.text,
          lineHeight: 1.3
        }
      }
    } catch (error) {
      console.error('Template generation error:', error)
      throw new Error(`Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Abstract methods for template-specific implementations
   */
  protected abstract buildHeader(data: ResumeData): Content
  protected abstract getDocumentStyles(): { [key: string]: Style }

  /**
   * Common section builders (can be overridden)
   */
  protected buildSummary(summary: string): Content {
    return {
      stack: [
        this.createSectionHeader('Professional Summary'),
        {
          text: summary,
          style: 'summaryText',
          margin: [0, 0, 0, this.styles.spacing.section]
        }
      ]
    }
  }

  protected buildExperience(experience: ExperienceItem[]): Content {
    const content: Content[] = [
      this.createSectionHeader('Professional Experience')
    ]

    experience.forEach((exp, index) => {
      content.push(this.buildExperienceItem(exp, index === experience.length - 1))
    })

    return {
      stack: content,
      margin: [0, 0, 0, this.styles.spacing.section]
    }
  }

  protected buildExperienceItem(exp: ExperienceItem, isLast: boolean): Content {
    // Safe data access with fallbacks
    const position = exp?.position || 'Position'
    const company = exp?.company || 'Company'
    const startDate = exp?.startDate || 'Start Date'
    const endDate = exp?.isCurrent ? 'Present' : (exp?.endDate || 'End Date')
    const margin: Margins = isLast ? [0, 0, 0, 0] : [0, 0, 0, this.styles.spacing.paragraph]

    return {
      stack: [
        // Job title and dates
        {
          columns: [
            {
              text: position,
              style: 'jobTitle',
              width: '*'
            },
            {
              text: `${startDate} - ${endDate}`,
              style: 'dateText',
              width: 'auto',
              alignment: 'right'
            }
          ]
        },
        // Company name
        {
          text: company,
          style: 'companyName',
          margin: [0, 2, 0, 4] as Margins
        },
        // Description
        ...(exp?.description && exp.description.trim() ? [{
          text: exp.description,
          style: 'jobDescription',
          margin: [0, 0, 0, 4] as Margins
        }] : []),
        // Achievements
        ...(exp?.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0 ? [{
          ul: exp.achievements
            .filter((achievement: string) => achievement && achievement.trim())
            .map((achievement: string) => ({
              text: achievement,
              style: 'achievementItem'
            })),
          margin: [0, 0, 0, 4] as Margins
        }] : []),
        // Technologies
        ...(exp?.technologies && Array.isArray(exp.technologies) && exp.technologies.length > 0 ? [{
          text: [
            { text: 'Technologies: ', style: 'techLabel' },
            { text: exp.technologies.filter((tech: string) => tech && tech.trim()).join(', '), style: 'techList' }
          ],
          margin: [0, 0, 0, 0] as Margins
        }] : [])
      ],
      margin
    }
  }

  protected buildEducation(education: EducationItem[]): Content {
    const content: Content[] = [
      this.createSectionHeader('Education')
    ]

    education.forEach((edu, index) => {
      content.push(this.buildEducationItem(edu, index === education.length - 1))
    })

    return {
      stack: content,
      margin: [0, 0, 0, this.styles.spacing.section]
    }
  }

  protected buildEducationItem(edu: EducationItem, isLast: boolean): Content {
    // Safe data access with fallbacks
    const degree = edu?.degree || 'Degree'
    const institution = edu?.institution || 'Institution'
    const startDate = edu?.startDate || 'Start Date'
    const endDate = edu?.endDate || 'Present'
    const margin: Margins = isLast ? [0, 0, 0, 0] : [0, 0, 0, this.styles.spacing.paragraph]

    return {
      stack: [
        // Degree and dates
        {
          columns: [
            {
              text: degree,
              style: 'educationDegree',
              width: '*'
            },
            {
              text: `${startDate} - ${endDate}`,
              style: 'dateText',
              width: 'auto',
              alignment: 'right'
            }
          ]
        },
        // Institution
        {
          text: institution,
          style: 'institutionName',
          margin: [0, 2, 0, 4] as Margins
        },
        // Field of study
        ...(edu?.field && edu.field.trim() ? [{
          text: edu.field,
          style: 'fieldOfStudy',
          margin: [0, 0, 0, 4] as Margins
        }] : []),
        // GPA
        ...(edu?.gpa && edu.gpa.trim() ? [{
          text: `GPA: ${edu.gpa}`,
          style: 'gpaText',
          margin: [0, 0, 0, 4] as Margins
        }] : []),
        // Honors
        ...(edu?.honors && Array.isArray(edu.honors) && edu.honors.length > 0 ? [{
          text: [
            { text: 'Honors: ', style: 'honorLabel' },
            { text: edu.honors.filter((honor: string) => honor && honor.trim()).join(', '), style: 'honorList' }
          ]
        }] : [])
      ],
      margin
    }
  }

  protected buildSkills(skills: SkillCategory[]): Content {
    return {
      stack: [
        this.createSectionHeader('Skills'),
        ...skills.map(category => this.buildSkillCategory(category))
      ],
      margin: [0, 0, 0, this.styles.spacing.section]
    }
  }

  protected buildSkillCategory(category: SkillCategory): Content {
    // Safe data access
    const categoryName = category?.category || 'Skills'
    let skillTexts = ''
    
    if (category?.skills && Array.isArray(category.skills) && category.skills.length > 0) {
      skillTexts = category.skills
        .filter((skill: any) => skill && skill.name && skill.name.trim())
        .map((skill: any) => skill.name)
        .join(' • ')
    }
    
    return {
      text: [
        { text: `${categoryName}: `, style: 'skillCategoryName' },
        { text: skillTexts || 'No skills listed', style: 'skillList' }
      ],
      margin: [0, 0, 0, 6]
    }
  }

  protected buildProjects(projects: ProjectItem[]): Content {
    const content: Content[] = [
      this.createSectionHeader('Projects')
    ]

    projects.forEach((project, index) => {
      content.push(this.buildProjectItem(project, index === projects.length - 1))
    })

    return {
      stack: content,
      margin: [0, 0, 0, this.styles.spacing.section]
    }
  }

  protected buildProjectItem(project: ProjectItem, isLast: boolean): Content {
    // Safe data access with fallbacks
    const projectName = project?.name || 'Project'
    const description = project?.description || 'No description available'
    const margin: Margins = isLast ? [0, 0, 0, 0] : [0, 0, 0, this.styles.spacing.paragraph]

    return {
      stack: [
        // Project name and URL
        {
          text: [
            { text: projectName, style: 'projectName', bold: true },
            ...(project?.liveUrl && project.liveUrl.trim() ? [
              { text: ' - ', style: 'projectSeparator' },
              { text: project.liveUrl, style: 'projectUrl', link: project.liveUrl }
            ] : [])
          ]
        },
        // Description
        {
          text: description,
          style: 'projectDescription',
          margin: [0, 4, 0, 4] as Margins
        },
        // Technologies
        ...(project?.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 ? [{
          text: [
            { text: 'Technologies: ', style: 'techLabel' },
            { text: project.technologies.filter((tech: string) => tech && tech.trim()).join(', '), style: 'techList' }
          ]
        }] : [])
      ],
      margin
    }
  }

  /**
   * Helper methods
   */
  protected createSectionHeader(title: string): Content {
    return {
      text: title,
      style: 'sectionHeader',
      margin: [0, 0, 0, this.styles.spacing.paragraph]
    }
  }

  protected createSeparator(): Content {
    return {
      canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 515, y2: 0,
          lineWidth: 1,
          lineColor: this.styles.colors.border
        }
      ],
      margin: [0, 8, 0, 8]
    }
  }

  /**
   * Utility for contact information formatting
   */
  protected formatContactInfo(data: ResumeData): string[] {
    const contact: string[] = []
    const info = data?.personalInfo

    if (!info) return contact

    if (info.email && info.email.trim()) contact.push(info.email)
    if (info.phone && info.phone.trim()) contact.push(info.phone)
    if (info.location && info.location.trim()) contact.push(info.location)
    if (info.website && info.website.trim()) contact.push(info.website)
    if (info.linkedin && info.linkedin.trim()) contact.push(info.linkedin)

    return contact
  }

  /**
   * Get common document styles
   */
  protected getCommonStyles(): { [key: string]: Style } {
    return {
      summaryText: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.4,
        alignment: 'justify'
      },
      jobTitle: {
        fontSize: this.styles.sizes.jobTitle,
        bold: true,
        color: this.styles.colors.primary
      },
      companyName: {
        fontSize: this.styles.sizes.body,
        italics: true,
        color: this.styles.colors.secondary
      },
      dateText: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.lightText
      },
      jobDescription: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.3
      },
      achievementItem: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.3
      },
      techLabel: {
        fontSize: this.styles.sizes.small,
        bold: true,
        color: this.styles.colors.secondary
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
        color: this.styles.colors.secondary
      },
      fieldOfStudy: {
        fontSize: this.styles.sizes.body,
        color: this.styles.colors.text
      },
      gpaText: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.lightText
      },
      honorLabel: {
        fontSize: this.styles.sizes.small,
        bold: true,
        color: this.styles.colors.secondary
      },
      honorList: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.text
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
      projectSeparator: {
        fontSize: this.styles.sizes.small,
        color: this.styles.colors.lightText
      },
      projectDescription: {
        fontSize: this.styles.sizes.body,
        lineHeight: 1.3
      }
    }
  }
}