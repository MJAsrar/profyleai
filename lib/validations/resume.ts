import { z } from "zod"

// Personal Information Schema
export const personalInfoSchema = z.object({
  fullName: z.string().max(100, "Full name too long").optional().or(z.literal("")),
  professionalTitle: z.string().max(100, "Professional title too long").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number too long").optional().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid portfolio URL").optional().or(z.literal(""))
})

// Experience Schema
export const experienceItemSchema = z.object({
  id: z.string().optional(), // For frontend state management
  company: z.string().max(100, "Company name too long").optional().or(z.literal("")),
  position: z.string().max(100, "Position too long").optional().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")), // YYYY-MM format
  endDate: z.string().optional().or(z.literal("")), // YYYY-MM format or empty for current
  isCurrent: z.boolean().default(false),
  description: z.string().max(2000, "Description too long").optional().or(z.literal("")),
  achievements: z.array(z.string().max(500, "Achievement too long")).default([]),
  technologies: z.array(z.string().max(50, "Technology name too long")).default([])
})

export const experienceSchema = z.array(experienceItemSchema).default([])

// Education Schema
export const educationItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().max(100, "Institution name too long").optional().or(z.literal("")),
  degree: z.string().max(100, "Degree too long").optional().or(z.literal("")),
  field: z.string().max(100, "Field of study too long").optional().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")), // YYYY-MM format
  endDate: z.string().optional().or(z.literal("")), // YYYY-MM format
  gpa: z.string().max(10, "GPA too long").optional().or(z.literal("")),
  honors: z.array(z.string().max(100, "Honor too long")).default([]),
  relevantCourses: z.array(z.string().max(100, "Course name too long")).default([])
})

export const educationSchema = z.array(educationItemSchema).default([])

// Skills Schema
export const skillCategorySchema = z.object({
  id: z.string().optional(),
  category: z.string().max(50, "Category name too long").optional().or(z.literal("")),
  skills: z.array(z.object({
    name: z.string().max(50, "Skill name too long").optional().or(z.literal("")),
    level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional()
  })).default([])
})

export const skillsSchema = z.array(skillCategorySchema).default([])

// Projects Schema
export const projectItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(100, "Project name too long").optional().or(z.literal("")),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  technologies: z.array(z.string().max(50, "Technology name too long")).default([]),
  startDate: z.string().optional().or(z.literal("")), // YYYY-MM format
  endDate: z.string().optional().or(z.literal("")), // YYYY-MM format
  liveUrl: z.string().url("Invalid live URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  highlights: z.array(z.string().max(300, "Highlight too long")).default([])
})

export const projectsSchema = z.array(projectItemSchema).default([])

// Certifications Schema
export const certificationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(100, "Certification name too long").optional().or(z.literal("")),
  issuedBy: z.string().max(100, "Issuing organization name too long").optional().or(z.literal("")),
  issueDate: z.string().optional().or(z.literal("")), // YYYY-MM format
  expiryDate: z.string().optional().or(z.literal("")), // YYYY-MM format or empty for lifetime
  isLifetime: z.boolean().default(false),
  credentialId: z.string().max(100, "Credential ID too long").optional().or(z.literal("")),
  verificationUrl: z.string().url("Invalid verification URL").optional().or(z.literal("")),
  description: z.string().max(500, "Description too long").optional().or(z.literal(""))
})

export const certificationsSchema = z.array(certificationItemSchema).default([])

// Complete Resume Schema
export const createResumeSchema = z.object({
  title: z.string().max(100, "Title too long").optional().default("My Resume"),
  templateId: z.string().optional().or(z.literal("")),
  personalInfo: personalInfoSchema,
  summary: z.string().max(1000, "Summary too long").optional().or(z.literal("")),
  experience: experienceSchema,
  education: educationSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  certifications: certificationsSchema,
  isPublic: z.boolean().default(false)
})

export const updateResumeSchema = createResumeSchema.partial().extend({
  id: z.string().min(1, "Resume ID is required")
})

// Resume Response Schema (for API responses)
export const resumeResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  templateId: z.string(),
  title: z.string(),
  personalInfo: personalInfoSchema,
  summary: z.string().optional(),
  experience: experienceSchema,
  education: educationSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  certifications: certificationsSchema,
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  template: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string()
  }).optional()
})

// Type exports for TypeScript
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type ExperienceItem = z.infer<typeof experienceItemSchema>
export type EducationItem = z.infer<typeof educationItemSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>
export type ProjectItem = z.infer<typeof projectItemSchema>
export type CertificationItem = z.infer<typeof certificationItemSchema>
export type CreateResumeInput = z.infer<typeof createResumeSchema>
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>
export type ResumeResponse = z.infer<typeof resumeResponseSchema>