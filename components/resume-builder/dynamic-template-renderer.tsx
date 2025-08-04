"use client"

import React from 'react'
import { CSSEngine, createCSSEngine, mergeStyles } from '@/lib/css-engine'
import type { ResumeData, ResumeTemplate } from '@/lib/resume-store'
import { useFontConfig } from '@/lib/font-config-store'

interface DynamicTemplateRendererProps {
  template: ResumeTemplate
  data: ResumeData
  scale?: number
  className?: string
}

export function DynamicTemplateRenderer({ 
  template, 
  data, 
  scale = 1,
  className = "" 
}: DynamicTemplateRendererProps) {
  // Get font configuration from store
  const fontConfig = useFontConfig()
  // Helper function to generate stable keys
  const generateStableKey = React.useCallback((prefix: string, index: number, id?: string) => {
    return id ? `${prefix}-${id}` : `${prefix}-${index}`
  }, [])

  // Ensure data has proper structure with defaults
  const safeData = React.useMemo(() => ({
    title: data.title || 'My Resume',
    templateId: data.templateId || '',
    personalInfo: data.personalInfo || {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: data.summary || '',
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    isPublic: data.isPublic || false
  }), [data])

  // Create CSS engine from template data with font configuration
  const cssEngine = React.useMemo(() => {
    // First try to use the full cssData from the database
    if (template?.cssData) {
      console.log('Using full cssData for template:', template.name, template.cssData)
      return createCSSEngine(template.cssData, fontConfig)
    }
    
    // Fallback to constructing from metadata if cssData doesn't exist
    if (template?.cssMetadata) {
      console.log('Using cssMetadata fallback for template:', template.name)
      return createCSSEngine(constructCSSDataFromMetadata(template), fontConfig)
    }
    
    // Final fallback to default styles
    console.log('Using default cssData fallback for template:', template?.name || 'unknown')
    return createCSSEngine(null, fontConfig)
  }, [template, fontConfig])

  const containerStyles = mergeStyles(
    cssEngine.getContainerStyles(),
    cssEngine.getCSSVariables(),
    {
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: scale !== 1 ? `${100 / scale}%` : '100%',
      // Remove page-like constraints for natural flow
      maxWidth: 'none',
      minHeight: 'auto',
      margin: 0,
    }
  )

  const layoutStyles = cssEngine.getLayoutStyles()
  const utilities = cssEngine.getUtilityStyles()

  const renderHeader = () => {
    const personalInfo = safeData.personalInfo || {}
    
    return (
      <header style={cssEngine.getHeaderStyles()}>
        <div style={{...cssEngine.getElementStyles('name'), color: '#1f2937'}}>
          {personalInfo.fullName || 'Your Name'}
        </div>
        
        {personalInfo.professionalTitle && (
          <div style={mergeStyles(cssEngine.getElementStyles('title'), utilities.textMuted)}>
            {personalInfo.professionalTitle}
          </div>
        )}
        
        {/* Basic Contact Info */}
        <div style={{...cssEngine.getElementStyles('contact'), color: '#1f2937'}}>
          {personalInfo.email && <span key="contact-email">{personalInfo.email}</span>}
          {personalInfo.phone && <span key="contact-phone">{personalInfo.phone}</span>}
          {personalInfo.location && <span key="contact-location">{personalInfo.location}</span>}
        </div>
        
        {/* Websites - Separate Line */}
        {(personalInfo.website || personalInfo.linkedin || personalInfo.github || personalInfo.portfolio) && (
          <div style={{...cssEngine.getElementStyles('contact'), color: '#1f2937'}}>
            {personalInfo.website && (
              <span key="contact-website" style={{ color: '#1f2937' }}>{personalInfo.website}</span>
            )}
            {personalInfo.linkedin && (
              <span key="contact-linkedin" style={{ color: '#1f2937' }}>{personalInfo.linkedin}</span>
            )}
            {personalInfo.github && (
              <span key="contact-github" style={{ color: '#1f2937' }}>{personalInfo.github}</span>
            )}
            {personalInfo.portfolio && (
              <span key="contact-portfolio" style={{ color: '#1f2937' }}>{personalInfo.portfolio}</span>
            )}
          </div>
        )}
      </header>
    )
  }

  const renderSection = (title: string, children: React.ReactNode) => (
    <section style={cssEngine.getSectionStyles()}>
              <h2 style={cssEngine.getSectionTitleStyles()}>
        {title}
      </h2>
      {children}
    </section>
  )

  const renderSummary = () => {
    if (!safeData.summary) return null
    
    return renderSection('Professional Summary', (
      <div style={cssEngine.getElementStyles('summary')}>
        {safeData.summary}
      </div>
    ))
  }

  const renderExperience = () => {
    if (!safeData.experience || !Array.isArray(safeData.experience) || safeData.experience.length === 0) return null

    return renderSection('Professional Experience', (
      <div>
        {safeData.experience.map((exp, index) => {
          if (!exp) return null
          
          return (
            <div key={generateStableKey('exp', index, exp.id)} style={{ marginBottom: '0.5rem' }}>
              <div style={utilities.flexBetween}>
                <div style={cssEngine.getElementStyles('jobTitle')}>
                  {exp.position || 'Position'}
                </div>
                <div style={cssEngine.getElementStyles('dates')}>
                  {exp.startDate || ''} - {exp.isCurrent ? 'Present' : (exp.endDate || '')}
                </div>
              </div>
              <div style={cssEngine.getElementStyles('company')}>
                {exp.company || 'Company'}
              </div>
              {exp.description && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.25rem', whiteSpace: 'pre-line', lineHeight: '1.4' })}>
                  {exp.description}
                </div>
              )}
            </div>
          )
        }).filter(Boolean)}
      </div>
    ))
  }

  const renderEducation = () => {
    if (!safeData.education || !Array.isArray(safeData.education) || safeData.education.length === 0) return null

    return renderSection('Education', (
      <div>
        {safeData.education.map((edu, index) => {
          if (!edu) return null
          
          return (
            <div key={generateStableKey('edu', index, edu.id)} style={{ marginBottom: '1rem' }}>
              <div style={utilities.flexBetween}>
                <div style={cssEngine.getElementStyles('jobTitle')}>
                  {edu.degree || 'Degree'}{edu.field ? ` in ${edu.field}` : ''}
                </div>
                <div style={cssEngine.getElementStyles('dates')}>
                  {edu.startDate || ''} - {edu.endDate || ''}
                </div>
              </div>
              <div style={{...utilities.flexBetween, marginTop: '0rem'}}>
                <div style={cssEngine.getElementStyles('company')}>
                  {edu.institution || 'Institution'}
                </div>
                {edu.gpa && (
                  <div style={cssEngine.getElementStyles('dates')}>
                    GPA: {edu.gpa}
                  </div>
                )}
              </div>
            </div>
          )
        }).filter(Boolean)}
      </div>
    ))
  }

  const renderSkills = () => {
    if (!safeData.skills || !Array.isArray(safeData.skills) || safeData.skills.length === 0) return null

    return renderSection('Skills', (
      <div>
        {safeData.skills.map((skillCategory, categoryIndex) => {
          // Safety check for skillCategory - handle both skills and items for backward compatibility
          const skillsArray = skillCategory.skills || (skillCategory as any).items || []
          if (!skillCategory || !Array.isArray(skillsArray) || skillsArray.length === 0) {
            return null
          }

          return (
            <div key={generateStableKey('skill', categoryIndex, skillCategory.id)} style={{ marginBottom: '0.75rem' }}>
              <div style={cssEngine.getElementStyles('skillCategory')}>
                {skillCategory.category || 'Skills'}
              </div>
              <div style={utilities.flexWrap}>
                {skillsArray.map((skill, skillIndex) => (
                  <span key={`skill-${categoryIndex}-${skillIndex}`} style={cssEngine.getElementStyles('skillItems')}>
                    {typeof skill === 'string' ? skill : (skill?.name || 'Skill')}
                    {typeof skill === 'object' && skill?.level && <span style={mergeStyles(cssEngine.getElementStyles('skillItems'), utilities.textMuted)}> ({skill.level})</span>}
                    {skillIndex < skillsArray.length - 1 && <span style={mergeStyles(cssEngine.getElementStyles('skillItems'), utilities.textMuted)}> • </span>}
                  </span>
                ))}
              </div>
            </div>
          )
        }).filter(Boolean)}
      </div>
    ))
  }

  const renderProjects = () => {
    if (!safeData.projects || !Array.isArray(safeData.projects) || safeData.projects.length === 0) return null

    return renderSection('Projects', (
      <div>
        {safeData.projects.map((project, index) => {
          if (!project) return null
          
          return (
            <div key={generateStableKey('project', index, project.id)} style={{ marginBottom: '1rem' }}>
              <div style={utilities.flexStart}>
                <div style={cssEngine.getElementStyles('projectTitle')}>
                  {project.name || 'Project'}
                </div>
                {(project.liveUrl || project.githubUrl) && (
                  <div style={cssEngine.getElementStyles('projectLink')}>
                    {project.liveUrl || project.githubUrl}
                  </div>
                )}
              </div>
              <div style={mergeStyles(cssEngine.getElementStyles('projectDescription'), { marginTop: '0.25rem' })}>
                {project.description || 'Project description'}
              </div>
              {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                <div style={mergeStyles(cssEngine.getElementStyles('projectDescription'), utilities.textMuted, { marginTop: '0.25rem' })}>
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </div>
              )}
              {project.highlights && Array.isArray(project.highlights) && project.highlights.length > 0 && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.5rem' })}>
                  {project.highlights.map((highlight, highlightIndex) => (
                    <div key={`project-${index}-highlight-${highlightIndex}`} style={{ marginBottom: '0.25rem' }}>
                      • {highlight}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }).filter(Boolean)}
      </div>
    ))
  }

  const renderCertifications = () => {
    if (!safeData.certifications || !Array.isArray(safeData.certifications) || safeData.certifications.length === 0) return null

    return renderSection('Certifications', (
      <div>
        {safeData.certifications.map((cert: any, index: number) => {
          if (!cert) return null
          
          const formatDate = (dateStr: string) => {
            if (!dateStr) return ''
            try {
              const date = new Date(dateStr + '-01') // Add day for YYYY-MM format
              return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            } catch {
              return dateStr
            }
          }

          const expiryText = cert.isLifetime 
            ? 'Lifetime' 
            : cert.expiryDate 
              ? `Expires ${formatDate(cert.expiryDate)}`
              : 'No Expiry'
          
          return (
            <div key={generateStableKey('certification', index, cert.id)} style={{ marginBottom: '1rem' }}>
              <div style={utilities.flexBetween}>
                <div style={cssEngine.getElementStyles('certificationName')}>
                  {cert.name || 'Certification'}
                </div>
                <div style={cssEngine.getElementStyles('certificationDate')}>
                  {formatDate(cert.issueDate)}
                </div>
              </div>
              <div style={utilities.flexBetween}>
                <div style={cssEngine.getElementStyles('certificationIssuer')}>
                  {cert.issuedBy || 'Issuing Organization'}
                </div>
                <div style={mergeStyles(cssEngine.getElementStyles('certificationDate'), utilities.textMuted)}>
                  {expiryText}
                </div>
              </div>
              {cert.credentialId && (
                <div style={mergeStyles(cssEngine.getElementStyles('certificationDetails'), utilities.textMuted, { marginTop: '0.25rem' })}>
                  <strong>Credential ID:</strong> {cert.credentialId}
                </div>
              )}
              {cert.verificationUrl && (
                <div style={mergeStyles(cssEngine.getElementStyles('certificationDetails'), { marginTop: '0.25rem' })}>
                  <strong>Verify:</strong> {cert.verificationUrl}
                </div>
              )}
              {cert.description && (
                <div style={mergeStyles(cssEngine.getElementStyles('certificationDetails'), { marginTop: '0.5rem' })}>
                  {cert.description}
                </div>
              )}
            </div>
          )
        }).filter(Boolean)}
      </div>
    ))
  }

  // Render based on layout type
  const renderContent = () => {
    const sectionComponents = [
      { key: 'summary', component: renderSummary() },
      { key: 'experience', component: renderExperience() },
      { key: 'education', component: renderEducation() },
      { key: 'skills', component: renderSkills() },
      { key: 'projects', component: renderProjects() },
      { key: 'certifications', component: renderCertifications() },
    ].filter(section => section.component !== null)

    const sections = sectionComponents.map(section => (
      <React.Fragment key={section.key}>
        {section.component}
      </React.Fragment>
    ))

    if (cssEngine.cssData.layout.type === 'two-column') {
      const leftSections = sections.slice(0, Math.ceil(sections.length / 2))
      const rightSections = sections.slice(Math.ceil(sections.length / 2))
      
      return (
        <>
          <div key="left-column">
            {renderHeader()}
            {leftSections}
          </div>
          <div key="right-column">
            {rightSections}
          </div>
        </>
      )
    }

    if (cssEngine.cssData.layout.type === 'modern-split') {
      // Left sidebar with contact and skills, right main content
      return (
        <>
          <div key="sidebar" style={{ backgroundColor: '#ffffff', padding: '1.5rem', color: '#1f2937' }}>
            <div style={cssEngine.getElementStyles('name')}>
              {safeData.personalInfo.fullName || 'Your Name'}
            </div>
            <div style={{...cssEngine.getElementStyles('contact'), color: '#1f2937'}}>
              {safeData.personalInfo.email && <div key="email">{safeData.personalInfo.email}</div>}
              {safeData.personalInfo.phone && <div key="phone">{safeData.personalInfo.phone}</div>}
              {safeData.personalInfo.location && <div key="location">{safeData.personalInfo.location}</div>}
            </div>
            <React.Fragment key="sidebar-skills">
              {renderSkills()}
            </React.Fragment>
          </div>
          <div key="main-content" style={{ padding: '1.5rem' }}>
            <React.Fragment key="main-summary">
              {renderSummary()}
            </React.Fragment>
            <React.Fragment key="main-experience">
              {renderExperience()}
            </React.Fragment>
            <React.Fragment key="main-education">
              {renderEducation()}
            </React.Fragment>
            <React.Fragment key="main-projects">
              {renderProjects()}
            </React.Fragment>
          </div>
        </>
      )
    }

    // Single column layout
    return (
      <>
        {renderHeader()}
        {sections}
      </>
    )
  }

  return (
    <div 
      className={`resume-template-renderer ${className}`}
      style={mergeStyles(containerStyles, layoutStyles)}
    >
      {renderContent()}
    </div>
  )
}

// Helper function to construct CSS data from template metadata
function constructCSSDataFromMetadata(template: ResumeTemplate) {
  const metadata = template.cssMetadata || {}
  
  return {
    layout: {
      type: metadata.layoutType === 'two-column' ? 'two-column' : 
            metadata.layoutType === 'modern-split' ? 'modern-split' : 'single-column',
      pageSize: metadata.pageSize || 'letter',
      margins: '0.1rem',
      spacing: '0.2rem',
    },
    typography: {
      primaryFont: metadata.primaryFont || 'Arial, sans-serif',
      baseFontSize: '8pt',
      headingScale: 1.3,
      lineHeight: 1.1,
    },
    colors: {
      primary: metadata.primaryColor || '#1f2937',
      secondary: metadata.secondaryColor || '#4f46e5',
      accent: metadata.accentColor || '#059669',
      text: '#1f2937',
      background: '#ffffff',
      border: '#e5e7eb',
    },
    sections: {
      header: {
              marginBottom: '0.25rem',
      paddingBottom: '0rem',
        // Removed border for minimal design
      },
      section: {
        marginBottom: '0.25rem',
      },
      sectionTitle: {
        fontWeight: '700',
        marginBottom: '0.2rem',
        color: metadata.primaryColor || '#1f2937',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },
    elements: {
      name: {
        fontSize: '18pt',
        fontWeight: '700',
        marginBottom: '0.5rem',
        color: metadata.primaryColor || '#1f2937',
      },
      contact: {
        fontSize: '10pt',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '0.5rem',
      },
      jobTitle: {
        fontSize: '12pt',
        fontWeight: '600',
        marginBottom: '0.25rem',
      },
      company: {
        fontSize: '11pt',
        fontWeight: '500',
        color: metadata.primaryColor || '#4f46e5',
        marginBottom: '0.25rem',
      },
      dates: {
        fontSize: '10pt',
        color: '#6b7280',
        fontStyle: 'italic',
      },
      bulletPoints: {
        fontSize: '10pt',
        lineHeight: 1.1,
      },
    },
  }
}

