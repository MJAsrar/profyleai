"use client"

import type { ResumeData, ResumeTemplate } from "@/lib/resume-store"

interface ResumeTemplateRendererProps {
  template: ResumeTemplate
  data: ResumeData
}

export function ResumeTemplateRenderer({ template, data }: ResumeTemplateRendererProps) {
  const renderModernTemplate = () => (
    <div className="w-full bg-white text-black" style={{ fontFamily: "Arial, sans-serif", padding: "0px", margin: "0" }}>
      {/* Header */}
      <div style={{ margin: "0", padding: "0" }}>
        <h1 className="font-bold text-blue-600" style={{ fontSize: '17pt', margin: '0', padding: '0', lineHeight: '1.0' }}>{data.personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap text-gray-600" style={{ fontSize: '7pt', gap: '0px', margin: '0', padding: '0', lineHeight: '1.0' }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.website && <span className="text-blue-600">{data.personalInfo.website}</span>}
          {data.personalInfo.linkedin && <span className="text-blue-600">{data.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold text-blue-600" style={{ fontSize: '13pt', margin: '0', padding: '0', lineHeight: '1.0' }}>Professional Summary</h2>
          <p className="text-gray-700 leading-none" style={{ fontSize: '8pt' }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold text-blue-600" style={{ fontSize: '13pt', margin: '0', padding: '0', lineHeight: '1.0' }}>
            Professional Experience
          </h2>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ margin: "0", padding: "0" }}>
              <div className="flex justify-between items-start" style={{ margin: "0", padding: "0" }}>
                <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt' }}>{exp.position}</h3>
                <span className="text-gray-600" style={{ fontSize: '7pt' }}>
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="font-medium text-gray-700" style={{ fontSize: '7pt', margin: '0', padding: '0', lineHeight: '1.0' }}>{exp.company}</p>
              {exp.description && <div className="text-gray-600 whitespace-pre-line" style={{ fontSize: '8pt' }}>{exp.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold text-blue-600" style={{ fontSize: '13pt', margin: '0', padding: '0', lineHeight: '1.0' }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt' }}>{edu.degree}</h3>
                  {edu.field && <p className="text-gray-600" style={{ fontSize: '8pt' }}>{edu.field}</p>}
                </div>
                <div className="text-right text-gray-600" style={{ fontSize: '7pt' }}>
                  <p>
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-start" style={{marginTop: '0rem'}}>
                <p className="text-gray-700" style={{ fontSize: '7pt' }}>{edu.institution}</p>
                {edu.gpa && <p className="text-gray-600" style={{ fontSize: '7pt' }}>GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold text-blue-600" style={{ fontSize: '13pt', margin: '0', padding: '0', lineHeight: '1.0' }}>Skills</h2>
          {data.skills.map((skillCategory) => (
            <div key={skillCategory.id} style={{ marginBottom: '2px', display: 'block' }}>
              <span className="font-medium text-gray-800" style={{ fontSize: '8pt' }}>{skillCategory.category}: </span>
              <span className="text-gray-700" style={{ fontSize: '8pt' }}>
                {(skillCategory.skills || (skillCategory as any).items || [])
                  .map(skill => typeof skill === 'string' ? skill : skill.name)
                  .join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold text-blue-600" style={{ fontSize: '13pt', margin: '0', padding: '0', lineHeight: '1.0' }}>Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt', fontWeight: 'bold' }}>{project.name}</h3>
                {(project.liveUrl || project.githubUrl) && <span className="text-blue-600" style={{ fontSize: '7pt' }}>{project.liveUrl || project.githubUrl}</span>}
              </div>
              <p className="text-gray-600 mb-1" style={{ fontSize: '8pt' }}>{project.description}</p>
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-gray-600" style={{ fontSize: '8pt' }}>
                  <span className="font-medium">Technologies: </span>
                  {project.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold text-blue-600" style={{ fontSize: '13pt', margin: '0', padding: '0', lineHeight: '1.0' }}>Certifications</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-4">
              <div className="flex justify-between items-start" style={{ margin: "0", padding: "0" }}>
                <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt' }}>{cert.name}</h3>
                <span className="text-gray-600" style={{ fontSize: '7pt' }}>
                  {cert.issueDate && new Date(cert.issueDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-start" style={{ margin: "0", padding: "0" }}>
                <p className="text-gray-700" style={{ fontSize: '7pt' }}>{cert.issuedBy}</p>
                <span className="text-gray-600" style={{ fontSize: '7pt' }}>
                  {cert.isLifetime 
                    ? 'Lifetime' 
                    : cert.expiryDate 
                      ? `Expires ${new Date(cert.expiryDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : 'No Expiry'}
                </span>
              </div>
              {cert.credentialId && (
                <p className="text-gray-600 mb-1" style={{ fontSize: '8pt' }}>
                  <span className="font-medium">Credential ID: </span>
                  {cert.credentialId}
                </p>
              )}
              {cert.verificationUrl && (
                <div className="mb-1">
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    style={{ fontSize: '8pt' }}
                  >
                    Verify Certificate
                  </a>
                </div>
              )}
              {cert.description && (
                <p className="text-gray-600 leading-none" style={{ fontSize: '8pt' }}>
                  {cert.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderClassicTemplate = () => (
    <div className="w-full bg-white text-black" style={{ fontFamily: "Times New Roman, serif", padding: "0", margin: "0" }}>
      {/* Header */}
      <div className="text-center" style={{ margin: "0", padding: "0" }}>
        <h1 className="font-bold mb-0" style={{ fontSize: '17pt' }}>{data.personalInfo.fullName || "Your Name"}</h1>
        <div style={{ fontSize: '7pt' }}>
          {data.personalInfo.email && <span>{data.personalInfo.email} | </span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone} | </span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
        {(data.personalInfo.website || data.personalInfo.linkedin) && (
          <div className="mt-1" style={{ fontSize: '7pt' }}>
            {data.personalInfo.website && <span>{data.personalInfo.website} | </span>}
            {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt' }}>PROFESSIONAL SUMMARY</h2>
          <p className="text-justify leading-none" style={{ fontSize: '8pt' }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt' }}>PROFESSIONAL EXPERIENCE</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ margin: "0", padding: "0" }}>
              <div className="flex justify-between items-start" style={{ margin: "0", padding: "0" }}>
                <div>
                  <h3 className="font-bold" style={{ fontSize: '8pt' }}>{exp.position}</h3>
                  <p className="italic" style={{ fontSize: '7pt' }}>{exp.company}</p>
                </div>
                <span style={{ fontSize: '7pt' }}>
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.description && <div className="mt-2 whitespace-pre-line" style={{ fontSize: '8pt' }}>{exp.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt' }}>EDUCATION</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold" style={{ fontSize: '8pt' }}>{edu.degree}</h3>
                  {edu.field && <p style={{ fontSize: '8pt' }}>{edu.field}</p>}
                </div>
                <div className="text-right" style={{ fontSize: '7pt' }}>
                  <p>
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-start" style={{marginTop: '0rem'}}>
                <p className="italic" style={{ fontSize: '7pt' }}>{edu.institution}</p>
                {edu.gpa && <p style={{ fontSize: '7pt' }}>GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt' }}>SKILLS</h2>
          {data.skills.map((skillCategory) => (
            <div key={skillCategory.id} className="mb-0">
              <span className="font-bold" style={{ fontSize: '8pt' }}>{skillCategory.category}: </span>
              <span style={{ fontSize: '8pt' }}>
                {(skillCategory.skills || (skillCategory as any).items || [])
                  .map(skill => typeof skill === 'string' ? skill : skill.name)
                  .join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt' }}>PROJECTS</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold" style={{ fontSize: '8pt' }}>{project.name}</h3>
                {(project.liveUrl || project.githubUrl) && <span className="italic" style={{ fontSize: '7pt' }}>{project.liveUrl || project.githubUrl}</span>}
              </div>
              <p className="mb-1" style={{ fontSize: '8pt' }}>{project.description}</p>
              {project.technologies.length > 0 && (
                <p style={{ fontSize: '8pt' }}>
                  <span className="font-bold">Technologies: </span>
                  {project.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ margin: "0 0 4px 0", padding: "0" }}>
          <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt' }}>CERTIFICATIONS</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-4">
              <div className="flex justify-between items-start" style={{ margin: "0", padding: "0" }}>
                <h3 className="font-bold" style={{ fontSize: '8pt' }}>{cert.name}</h3>
                <span style={{ fontSize: '7pt' }}>
                  {cert.issueDate && new Date(cert.issueDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-start" style={{ margin: "0", padding: "0" }}>
                <p style={{ fontSize: '7pt' }}>{cert.issuedBy}</p>
                <span style={{ fontSize: '7pt' }}>
                  {cert.isLifetime 
                    ? 'Lifetime' 
                    : cert.expiryDate 
                      ? `Expires ${new Date(cert.expiryDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : 'No Expiry'}
                </span>
              </div>
              {cert.credentialId && (
                <p className="mb-1" style={{ fontSize: '8pt' }}>
                  <span className="font-bold">Credential ID: </span>
                  {cert.credentialId}
                </p>
              )}
              {cert.verificationUrl && (
                <div className="mb-1">
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ fontSize: '8pt' }}
                  >
                    Verify Certificate
                  </a>
                </div>
              )}
              {cert.description && (
                <p style={{ fontSize: '8pt' }}>
                  {cert.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderATSTemplate = () => (
    <div className="w-full bg-white text-black" style={{ fontFamily: "LibertinusSerif, Times New Roman, serif", lineHeight: "1.3", padding: "0" }}>
      {/* Header - No divider line */}
      <div style={{ margin: "0", padding: "0" }}>
        <h1 className="font-bold" style={{ fontSize: "17pt", margin: "0", padding: "0" }}>
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div style={{ fontSize: "7pt" }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.email && data.personalInfo.linkedin && <span> | </span>}
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
        {(data.personalInfo.phone || data.personalInfo.location) && (
          <div style={{ fontSize: "7pt" }}>
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.phone && data.personalInfo.location && <span> | </span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="font-bold mb-0" style={{ fontSize: "13pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            PROFESSIONAL SUMMARY
          </h2>
          <div style={{ fontSize: "8pt", whiteSpace: "pre-line" }}>
            {data.summary}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold mb-0" style={{ fontSize: "13pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            WORK EXPERIENCE
          </h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-0">
              {/* Line 1: Company (bold), Location */}
              <div className="flex justify-between items-start">
                <span className="font-bold" style={{ fontSize: "7pt" }}>{exp.company}</span>
                <span style={{ fontSize: "7pt" }}>{exp.location || ''}</span>
              </div>
              {/* Line 2: Position (italic), Date range (right-aligned) */}
              <div className="flex justify-between items-start" style={{ marginTop: "0rem" }}>
                <span className="italic" style={{ fontSize: "8pt" }}>{exp.position}</span>
                <span style={{ fontSize: "7pt" }}>
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </span>
              </div>
              {/* Bullet points */}
              {exp.description && (
                <div className="mt-1" style={{ marginLeft: "20px" }}>
                  {exp.description.split('\n').map((line, lineIndex) => (
                    line.trim() && (
                      <div key={`exp-${exp.id}-line-${lineIndex}`} style={{ fontSize: "8pt" }}>
                        • {line.trim()}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold mb-0" style={{ fontSize: "13pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            EDUCATION
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-0">
              {/* Line 1: Institution (bold), Location */}
              <div className="flex justify-between items-start">
                <span className="font-bold" style={{ fontSize: "7pt" }}>{edu.institution}</span>
                <span style={{ fontSize: "7pt" }}>{edu.location || ''}</span>
              </div>
              {/* Line 2: Degree (italic), Date range and GPA (right-aligned) */}
              <div className="flex justify-between items-start" style={{ marginTop: "0rem" }}>
                <span className="italic" style={{ fontSize: "8pt" }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                </span>
                <span style={{ fontSize: "7pt" }}>
                  {edu.startDate} - {edu.endDate || 'Present'}
                  {edu.gpa && ` | GPA: ${edu.gpa}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills - Category style with line breaks */}
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold mb-0" style={{ fontSize: "13pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            SKILLS
          </h2>
          <div style={{ fontSize: "8pt", lineHeight: "1.4" }}>
            {data.skills.map((skillCategory, categoryIndex) => {
              const skillsArray = (skillCategory.skills || (skillCategory as any).items || [])
              const skillNames = skillsArray.map(skill => 
                typeof skill === 'string' ? skill : (skill?.name || 'Skill')
              ).join(', ')
              
              return skillNames ? (
                <div key={categoryIndex} style={{ marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>{skillCategory.category}: </span>
                  <span>{skillNames}</span>
                </div>
              ) : null
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold mb-0" style={{ fontSize: "13pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            PROJECTS
          </h2>
          {data.projects.map((project) => (
            <div key={project.id} className="mb-0">
              {/* Line 1: Project Name (bold), URL */}
              <div className="flex justify-between items-start">
                <span className="font-bold" style={{ fontSize: "8pt" }}>{project.name}</span>
                <span style={{ fontSize: "7pt" }}>
                  {(project.liveUrl || project.githubUrl) && (project.liveUrl || project.githubUrl)}
                </span>
              </div>
              {/* Line 2: Description */}
              <div style={{ fontSize: "8pt", marginTop: "0rem" }}>
                {project.description}
              </div>
              {/* Technologies */}
              {project.technologies.length > 0 && (
                <div style={{ fontSize: "8pt", marginTop: "2px" }}>
                  <span className="font-medium">Technologies: </span>
                  {project.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold mb-0" style={{ fontSize: "13pt", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            CERTIFICATIONS
          </h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-0">
              {/* Line 1: Certificate Name (bold), Issue Date */}
              <div className="flex justify-between items-start">
                <span className="font-bold" style={{ fontSize: "8pt" }}>{cert.name}</span>
                <span style={{ fontSize: "7pt" }}>
                  {cert.issueDate && new Date(cert.issueDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              {/* Line 2: Issued By, Expiry */}
              <div className="flex justify-between items-start" style={{ marginTop: "0rem" }}>
                <span style={{ fontSize: "7pt" }}>{cert.issuedBy}</span>
                <span style={{ fontSize: "7pt" }}>
                  {cert.isLifetime 
                    ? 'Lifetime' 
                    : cert.expiryDate 
                      ? `Expires ${new Date(cert.expiryDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : 'No Expiry'}
                </span>
              </div>
              {/* Credential ID */}
              {cert.credentialId && (
                <div style={{ fontSize: "8pt", marginTop: "2px" }}>
                  <span className="font-medium">Credential ID: </span>
                  {cert.credentialId}
                </div>
              )}
              {/* Verification URL */}
              {cert.verificationUrl && (
                <div style={{ fontSize: "8pt", marginTop: "2px" }}>
                  <span className="font-medium">Verify: </span>
                  {cert.verificationUrl}
                </div>
              )}
              {/* Description */}
              {cert.description && (
                <div style={{ fontSize: "8pt", marginTop: "2px" }}>
                  {cert.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render based on template type
  switch (template.category) {
    case "CLASSIC":
      return renderClassicTemplate()
    case "ATS":
      return renderATSTemplate()
    case "MODERN":
    default:
      return renderModernTemplate()
  }
}
