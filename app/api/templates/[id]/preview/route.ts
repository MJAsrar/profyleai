import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Sample data schema for preview generation
const previewDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional()
  }).optional(),
  summary: z.string().optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  skills: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional()
})

/**
 * POST /api/templates/[id]/preview - Generate template preview with sample data
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Fetch template
    const template = await prisma.template.findUnique({
      where: { id, isActive: true }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or inactive" },
        { status: 404 }
      )
    }

    // Parse request body (optional custom data)
    let customData = {}
    try {
      const body = await req.json()
      customData = previewDataSchema.parse(body)
    } catch {
      // Use default sample data if no valid data provided
    }

    // Generate sample data based on template category
    const sampleData = generateSampleData(template.category, customData)

    // Get template CSS data
    const cssData = template.cssData as any

    // Build preview response
    const previewResponse = {
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        previewUrl: template.previewUrl
      },
      
      // Full CSS data for rendering
      cssData: cssData,
      
      // Sample resume data for preview
      resumeData: sampleData,
      
      // Styling information
      styling: cssData ? {
        layout: cssData.layout || {},
        typography: cssData.typography || {},
        colors: cssData.colors || {},
        sections: cssData.sections || {},
        elements: cssData.elements || {}
      } : null,
      
      // Preview metadata
      previewInfo: {
        generatedAt: new Date().toISOString(),
        templateVersion: template.updatedAt,
        usingSampleData: Object.keys(customData).length === 0,
        previewMode: "full"
      }
    }

    return NextResponse.json(previewResponse)
  } catch (error) {
    console.error("Template preview API error:", error)
    return NextResponse.json(
      { error: "Failed to generate template preview" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/templates/[id]/preview - Get template preview with default sample data
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Get quick preview by calling POST with empty body
    const emptyRequest = new Request(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    return POST(emptyRequest as NextRequest, { params })
  } catch (error) {
    console.error("Template preview GET error:", error)
    return NextResponse.json(
      { error: "Failed to generate template preview" },
      { status: 500 }
    )
  }
}

/**
 * Generate sample data based on template category
 */
function generateSampleData(category: string, customData: any = {}) {
  const baseData = {
    personalInfo: {
      fullName: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "555-123-4567",
      location: "San Francisco, CA",
      website: "https://alexjohnson.dev",
      linkedin: "https://linkedin.com/in/alexjohnson",
      github: "https://github.com/alexjohnson",
      ...customData.personalInfo
    },
    summary: customData.summary || getSampleSummary(category),
    experience: customData.experience || getSampleExperience(category),
    education: customData.education || getSampleEducation(category),
    skills: customData.skills || getSampleSkills(category),
    projects: customData.projects || getSampleProjects(category)
  }

  return baseData
}

/**
 * Get sample summary based on category
 */
function getSampleSummary(category: string): string {
  switch (category) {
    case "MODERN":
      return "Innovative software developer with 5+ years building scalable web applications. Passionate about user experience and modern technologies."
    case "CLASSIC":
      return "Experienced professional with demonstrated expertise in project management and strategic planning. Proven track record of delivering results in fast-paced environments."
    case "CREATIVE":
      return "Creative professional combining artistic vision with technical expertise. Specializing in digital design and brand development with a focus on user-centered solutions."
    default:
      return "Results-driven professional with expertise in multiple domains. Committed to excellence and continuous learning."
  }
}

/**
 * Get sample experience based on category
 */
function getSampleExperience(category: string) {
  const baseExperience = [
    {
      id: "exp1",
      company: category === "CREATIVE" ? "Design Studio Inc" : category === "MODERN" ? "TechCorp" : "Global Enterprises",
      position: category === "CREATIVE" ? "Senior Designer" : category === "MODERN" ? "Senior Developer" : "Project Manager",
      location: "San Francisco, CA",
      startDate: "2021-03",
      endDate: "",
      isCurrent: true,
      description: category === "CREATIVE" 
        ? "Lead designer for branding and digital experiences"
        : category === "MODERN"
        ? "Lead developer for e-commerce platform serving 1M+ users"
        : "Managed cross-functional teams to deliver strategic initiatives",
      achievements: category === "CREATIVE"
        ? [
            "Created brand identities for 50+ clients",
            "Increased client engagement by 40% through design optimization",
            "Led rebranding project resulting in 25% revenue increase"
          ]
        : category === "MODERN"
        ? [
            "Improved page load times by 40% through optimization",
            "Led team of 4 developers on major product launch",
            "Reduced server costs by 25% through efficient architecture"
          ]
        : [
            "Delivered 15+ projects on time and under budget",
            "Improved team efficiency by 30% through process optimization",
            "Managed stakeholder relationships across multiple departments"
          ],
      technologies: category === "CREATIVE"
        ? ["Adobe Creative Suite", "Figma", "Sketch", "InVision"]
        : category === "MODERN"
        ? ["React", "Node.js", "PostgreSQL", "AWS"]
        : ["Project Management", "Agile", "Stakeholder Relations", "Strategic Planning"]
    },
    {
      id: "exp2",
      company: category === "CREATIVE" ? "Freelance" : category === "MODERN" ? "StartupXYZ" : "Consulting Firm",
      position: category === "CREATIVE" ? "Freelance Designer" : category === "MODERN" ? "Full Stack Developer" : "Business Analyst",
      location: "Remote",
      startDate: "2019-06",
      endDate: "2021-02",
      isCurrent: false,
      description: category === "CREATIVE" 
        ? "Provided design services for various clients"
        : category === "MODERN"
        ? "Built MVP for fintech startup from ground up"
        : "Analyzed business processes and provided strategic recommendations",
      achievements: category === "CREATIVE"
        ? [
            "Worked with 30+ clients across various industries",
            "Maintained 95% client satisfaction rate",
            "Developed efficient design workflow processes"
          ]
        : category === "MODERN"
        ? [
            "Developed entire frontend and backend architecture",
            "Implemented real-time payment processing system",
            "Achieved 99.9% uptime for critical financial operations"
          ]
        : [
            "Identified cost savings opportunities worth $500K annually",
            "Streamlined processes reducing operational time by 25%",
            "Created documentation improving team knowledge transfer"
          ],
      technologies: category === "CREATIVE"
        ? ["Photoshop", "Illustrator", "InDesign", "Branding"]
        : category === "MODERN"
        ? ["Vue.js", "Express.js", "MongoDB", "Stripe API"]
        : ["Data Analysis", "Process Mapping", "Requirements Gathering", "Documentation"]
    }
  ]

  return baseExperience
}

/**
 * Get sample education based on category
 */
function getSampleEducation(category: string) {
  return [
    {
      id: "edu1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: category === "CREATIVE" ? "Graphic Design" : category === "MODERN" ? "Computer Science" : "Business Administration",
      location: "Berkeley, CA",
      startDate: "2015-09",
      endDate: "2019-05",
      gpa: "3.8",
      honors: ["Magna Cum Laude", "Dean's List"],
      relevantCourses: category === "CREATIVE"
        ? ["Typography", "Color Theory", "Digital Media", "Brand Strategy"]
        : category === "MODERN"
        ? ["Data Structures", "Algorithms", "Database Systems", "Software Engineering"]
        : ["Strategic Management", "Financial Analysis", "Operations Research", "Leadership"]
    }
  ]
}

/**
 * Get sample skills based on category
 */
function getSampleSkills(category: string) {
  switch (category) {
    case "CREATIVE":
      return [
        {
          id: "skill1",
          category: "Design Software",
          skills: [
            { name: "Adobe Photoshop", level: "Expert" },
            { name: "Adobe Illustrator", level: "Expert" },
            { name: "Figma", level: "Advanced" },
            { name: "Sketch", level: "Advanced" }
          ]
        },
        {
          id: "skill2",
          category: "Design Skills",
          skills: [
            { name: "Brand Identity", level: "Expert" },
            { name: "UI/UX Design", level: "Advanced" },
            { name: "Typography", level: "Advanced" },
            { name: "Color Theory", level: "Expert" }
          ]
        }
      ]
    case "MODERN":
      return [
        {
          id: "skill1",
          category: "Programming Languages",
          skills: [
            { name: "JavaScript", level: "Expert" },
            { name: "TypeScript", level: "Advanced" },
            { name: "Python", level: "Intermediate" },
            { name: "Java", level: "Intermediate" }
          ]
        },
        {
          id: "skill2",
          category: "Frameworks & Libraries",
          skills: [
            { name: "React", level: "Expert" },
            { name: "Node.js", level: "Advanced" },
            { name: "Next.js", level: "Advanced" },
            { name: "Express.js", level: "Advanced" }
          ]
        }
      ]
    default:
      return [
        {
          id: "skill1",
          category: "Leadership",
          skills: [
            { name: "Project Management", level: "Expert" },
            { name: "Team Leadership", level: "Advanced" },
            { name: "Strategic Planning", level: "Advanced" },
            { name: "Stakeholder Management", level: "Expert" }
          ]
        },
        {
          id: "skill2",
          category: "Business Skills",
          skills: [
            { name: "Financial Analysis", level: "Advanced" },
            { name: "Process Improvement", level: "Expert" },
            { name: "Data Analysis", level: "Intermediate" },
            { name: "Risk Management", level: "Advanced" }
          ]
        }
      ]
  }
}

/**
 * Get sample projects based on category
 */
function getSampleProjects(category: string) {
  switch (category) {
    case "CREATIVE":
      return [
        {
          id: "proj1",
          name: "Brand Identity for Tech Startup",
          description: "Complete brand identity design including logo, color palette, typography, and brand guidelines for an innovative tech startup.",
          technologies: ["Adobe Illustrator", "Photoshop", "InDesign", "Brand Strategy"],
          startDate: "2023-01",
          endDate: "2023-03",
          liveUrl: "https://brandportfolio.example.com",
          highlights: [
            "Created cohesive brand identity system",
            "Delivered comprehensive brand guidelines",
            "Achieved 95% client satisfaction rating"
          ]
        }
      ]
    case "MODERN":
      return [
        {
          id: "proj1",
          name: "E-commerce Analytics Dashboard",
          description: "Real-time analytics dashboard for e-commerce platform with interactive charts and data visualization.",
          technologies: ["React", "D3.js", "Node.js", "PostgreSQL", "Redis"],
          startDate: "2023-01",
          endDate: "2023-06",
          liveUrl: "https://analytics.example.com",
          githubUrl: "https://github.com/alexjohnson/analytics-dashboard",
          highlights: [
            "Built real-time data pipeline processing 100K+ events daily",
            "Created interactive visualizations with custom D3.js components",
            "Implemented caching strategy reducing load times by 60%"
          ]
        }
      ]
    default:
      return [
        {
          id: "proj1",
          name: "Digital Transformation Initiative",
          description: "Led company-wide digital transformation project to modernize business processes and improve operational efficiency.",
          technologies: ["Project Management", "Change Management", "Process Analysis", "Stakeholder Engagement"],
          startDate: "2022-06",
          endDate: "2023-12",
          highlights: [
            "Managed cross-functional team of 25+ members",
            "Achieved 40% improvement in operational efficiency",
            "Delivered project 10% under budget and 2 months ahead of schedule"
          ]
        }
      ]
  }
}