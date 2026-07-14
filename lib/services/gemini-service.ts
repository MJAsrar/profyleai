import { GoogleGenAI } from "@google/genai"
import { ResumeData } from "@/lib/resume-store"
import { AiJsonError, generateJson } from "@/lib/services/ai-json"

// Initialize the Gemini API client only when needed (server-side only)
let genAI: any = null

function getGeminiClient() {
  if (!genAI && typeof window === 'undefined') {
    // Only initialize on server-side
    genAI = new GoogleGenAI({})
  }
  return genAI
}

export interface JobData {
  jobTitle: string
  jobDescription: string
  companyName: string
}

export interface TailoredContent {
  professionalTitle: string
  summary: string
  experience: Array<{
    id: string
    description: string
  }>
  skills: Array<{
    id: string
    category: string
    skills: Array<{ name: string }>
  }>
  projects?: Array<{
    id: string
    description: string
  }>
  tailoringNotes: string
  matchScore: number
  atsBreakdown: {
    keywordMatch: number
    formatScore: number
    relevanceScore: number
    overallScore: number
  }
  detailedChanges: {
    professionalTitle: {
      changed: boolean
      changeType: string
      oldTitle: string
      newTitle: string
      improvementReason: string
    }
    summary: {
      changed: boolean
      changeType: string
      keywordsAdded: string[]
      improvementReason: string
    }
    experience: Array<{
      id: string
      changed: boolean
      changeType: string
      keywordsAdded: string[]
      improvementReason: string
    }>
    skills: {
      changed: boolean
      changeType: string
      skillsReordered: string[]
      skillsAdded: string[]
      improvementReason: string
    }
    projects?: Array<{
      id: string
      changed: boolean
      changeType: string
      keywordsAdded: string[]
      improvementReason: string
    }>
  }
  keywordAnalysis: {
    jobKeywords: string[]
    matchedKeywords: string[]
    missedKeywords: string[]
    addedKeywords: string[]
  }
}

export interface TailoringResult {
  success: boolean
  data?: TailoredContent
  error?: string
}

/**
 * Constructs a structured prompt for Gemini to tailor resume content
 */
function buildTailoringPrompt(resumeData: ResumeData, jobData: JobData): string {
  const currentSkills = resumeData.skills.map(skillCat => 
    `${skillCat.category}: ${skillCat.skills.map(s => s.name).join(', ')}`
  ).join('\n')

  const currentExperience = resumeData.experience.map(exp => 
    `ID: ${exp.id}\nPosition: ${exp.position}\nCompany: ${exp.company}\nDescription: ${exp.description || 'No description provided'}`
  ).join('\n\n')

  const currentProjects = resumeData.projects.map(proj => 
    `ID: ${proj.id}\nName: ${proj.name}\nDescription: ${proj.description || 'No description provided'}`
  ).join('\n\n')

  return `
ROLE: You are an expert resume optimization specialist with deep knowledge of ATS systems and hiring practices.

TASK: Tailor the resume to this job posting to maximize keyword relevance and clarity while staying truthful.

INPUTS:
- Job Title: ${jobData.jobTitle}
- Company: ${jobData.companyName}
- Job Description: ${jobData.jobDescription}
- Current Professional Title: ${resumeData.personalInfo?.professionalTitle || 'No title provided'}
- Professional Summary: ${resumeData.summary || 'No summary provided'}
- Skills: ${currentSkills}
- Experience: ${currentExperience}
- Projects: ${currentProjects}

INSTRUCTIONS:
1. Optimize the professional title to be general and broad. Create a title that:
   - Uses general, widely-recognized role categories rather than specific job titles
   - Avoids overly specific technologies, frameworks, or niche specializations
   - Maintains appropriate seniority level (Junior, Mid-level, Senior, Lead, etc.)
   - Examples: "AI/ML Engineer" → "AI Engineer", "Senior React Frontend Developer" → "Frontend Developer", "WordPress Developer" → "Web Developer", "DevOps Engineer - Kubernetes Specialist" → "DevOps Engineer", etc.
2. Rewrite the professional summary (max 3 sentences) to emphasize relevant experience for this role.
3. COMPLETELY RESTRUCTURE the skills section:
   - Extract 8-12 most relevant skills from the job description
   - Remove skills that don't match the job requirements
   - Add new skills from the job description that are missing
   - Group skills into 2-3 logical categories (e.g., "Technical Skills", "Frontend Technologies", "Backend & Database")
   - Order skills within each category by importance to the job
   - Keep only skills that are genuinely relevant to the role
4. Rewrite each experience description to highlight achievements relevant to the job, adding quantified results when logical (do not invent data).
5. Rewrite project descriptions to emphasize technologies and outcomes relevant to the job.
6. Naturally integrate important keywords from the job description, avoiding redundancy or keyword stuffing.
7. Provide detailed analysis of changes made and ATS optimization.

ANALYSIS REQUIREMENTS:
- Extract 8-12 key technical and soft skill keywords from the job description
- Identify which keywords were successfully integrated and which are missing
- Provide ATS scores: keyword match (0-100), format score (0-100), relevance score (0-100)
- Track specific changes made to each section with reasoning
- Calculate overall match score based on alignment with job requirements

CRITICAL RULES:
- Never fabricate achievements or skills that the candidate doesn't have.
- Only include skills that are mentioned in the job description OR that the candidate has demonstrated experience with.
- Keep all experience and projects with their exact IDs.
- For skills: You can modify, add, or remove skills/categories as needed, but generate new IDs for new categories.
- Use ATS-friendly language (short phrases, active verbs).
- Ensure valid JSON with no trailing commas or extra text.
- Track all changes with specific reasons for improvements.

RULES FOR LENGTH:
- Professional summary: 40–60 words (2–3 concise sentences).
- Each experience entry: 80–120 words total, split into 3–4 bullet points (15–25 words each).
- Each project entry: 40–60 words focusing on relevant technologies and outcomes.
- Skills section: Total of 8-12 skills across 2-3 categories, ordered by relevance to the job.

OUTPUT FORMAT:
{
  "professionalTitle": "Optimized professional title that aligns with job requirements",
  "summary": "40-60 words, 2-3 sentences",
  "experience": [
    {
      "id": "existing_id",
      "description": "string"
    }
  ],
  "skills": [
    {
      "id": "skill_cat_1",
      "category": "Core Technical Skills",
      "skills": [{"name": "JavaScript"}, {"name": "React"}, {"name": "Node.js"}, {"name": "Python"}]
    },
    {
      "id": "skill_cat_2", 
      "category": "Database & Cloud",
      "skills": [{"name": "PostgreSQL"}, {"name": "AWS"}, {"name": "Docker"}]
    }
  ],
  "projects": [
    {
      "id": "existing_id",
      "description": "string"
    }
  ],
  "tailoringNotes": "string",
  "matchScore": number,
  "atsBreakdown": {
    "keywordMatch": number,
    "formatScore": number,
    "relevanceScore": number,
    "overallScore": number
  },
  "detailedChanges": {
    "professionalTitle": {
      "changed": boolean,
      "changeType": "string",
      "oldTitle": "string",
      "newTitle": "string",
      "improvementReason": "string"
    },
    "summary": {
      "changed": boolean,
      "changeType": "string",
      "keywordsAdded": ["string"],
      "improvementReason": "string"
    },
    "experience": [
      {
        "id": "string",
        "changed": boolean,
        "changeType": "string",
        "keywordsAdded": ["string"],
        "improvementReason": "string"
      }
    ],
    "skills": {
      "changed": boolean,
      "changeType": "string",
      "skillsReordered": ["string"],
      "skillsAdded": ["string"],
      "improvementReason": "string"
    },
    "projects": [
      {
        "id": "string",
        "changed": boolean,
        "changeType": "string",
        "keywordsAdded": ["string"],
        "improvementReason": "string"
      }
    ]
  },
  "keywordAnalysis": {
    "jobKeywords": ["string"],
    "matchedKeywords": ["string"],
    "missedKeywords": ["string"],
    "addedKeywords": ["string"]
  }
}

Return ONLY the JSON object. Do not add any explanation outside the JSON.
`.trim()
}

/**
 * Validates the structure of Gemini's response
 */
function validateTailoredContent(data: any): data is TailoredContent {
  const basicValidation = (
    typeof data === 'object' &&
    typeof data.professionalTitle === 'string' &&
    typeof data.summary === 'string' &&
    Array.isArray(data.experience) &&
    Array.isArray(data.skills) &&
    typeof data.tailoringNotes === 'string' &&
    typeof data.matchScore === 'number' &&
    data.experience.every((exp: any) => 
      typeof exp.id === 'string' && typeof exp.description === 'string'
    ) &&
    data.skills.every((skill: any) => 
      typeof skill.id === 'string' && 
      typeof skill.category === 'string' &&
      Array.isArray(skill.skills)
    )
  )

  // Enhanced validation for new fields (optional for backward compatibility)
  const hasEnhancedFields = data.atsBreakdown || data.detailedChanges || data.keywordAnalysis
  
  if (!hasEnhancedFields) {
    // Fallback to basic validation for legacy responses
    console.log('⚠️ Gemini returned basic response format, missing enhanced analytics')
    return basicValidation
  }

  const enhancedValidation = (
    typeof data.atsBreakdown === 'object' &&
    typeof data.atsBreakdown.keywordMatch === 'number' &&
    typeof data.atsBreakdown.formatScore === 'number' &&
    typeof data.atsBreakdown.relevanceScore === 'number' &&
    typeof data.atsBreakdown.overallScore === 'number' &&
    typeof data.detailedChanges === 'object' &&
    typeof data.detailedChanges.professionalTitle === 'object' &&
    typeof data.detailedChanges.summary === 'object' &&
    typeof data.detailedChanges.skills === 'object' &&
    Array.isArray(data.detailedChanges.experience) &&
    typeof data.keywordAnalysis === 'object' &&
    Array.isArray(data.keywordAnalysis.jobKeywords) &&
    Array.isArray(data.keywordAnalysis.matchedKeywords) &&
    Array.isArray(data.keywordAnalysis.missedKeywords) &&
    Array.isArray(data.keywordAnalysis.addedKeywords)
  )

  return basicValidation && enhancedValidation
}

/**
 * Calls Gemini API to tailor resume content for a specific job
 */
export async function tailorResumeWithGemini(
  resumeData: ResumeData,
  jobData: JobData
): Promise<TailoringResult> {
  try {
    // Validate inputs
    if (!resumeData || !jobData.jobTitle || !jobData.jobDescription) {
      return {
        success: false,
        error: "Missing required resume or job data"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    // Build the prompt
    const prompt = buildTailoringPrompt(resumeData, jobData)

    console.log('🤖 Sending request to Gemini API...')

    // Ask for JSON via the shared helper: valid JSON by construction, with a timeout,
    // retries and truncation detection instead of hand-rolled string repair.
    let parsedResponse: TailoredContent
    try {
      parsedResponse = await generateJson<TailoredContent>({
        prompt,
        model: "gemini-2.5-flash",
        temperature: 0.3, // Lower temperature for more consistent, professional output
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
        thinkingBudget: 0, // Disable thinking for faster responses
      })
    } catch (aiError) {
      if (aiError instanceof AiJsonError) {
        if (aiError.code === 'empty') {
          console.error('❌ Empty response from Gemini:', aiError)
          return {
            success: false,
            error: "Empty response from AI service"
          }
        }
        if (aiError.code === 'invalid_json' || aiError.code === 'truncated') {
          console.error('❌ Failed to parse Gemini response:', aiError)
          return {
            success: false,
            error: "Invalid response format from AI service"
          }
        }
      }
      // Anything else (not configured, timeout, upstream) falls through to the
      // existing API_KEY / quota / generic handling below.
      throw aiError
    }

    console.log('📥 Received response from Gemini:', JSON.stringify(parsedResponse).substring(0, 200) + '...')

    // Validate response structure
    if (!validateTailoredContent(parsedResponse)) {
      console.error('❌ Invalid response structure:', parsedResponse)
      return {
        success: false,
        error: "AI service returned invalid data structure"
      }
    }

    console.log('✅ Successfully tailored resume with match score:', parsedResponse.matchScore)

    return {
      success: true,
      data: parsedResponse as TailoredContent
    }

  } catch (error) {
    console.error('❌ Error in tailorResumeWithGemini:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return {
          success: false,
          error: "Invalid API key configuration"
        }
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return {
          success: false,
          error: "AI service rate limit exceeded. Please try again in a moment."
        }
      }
    }

    return {
      success: false,
      error: "Failed to connect to AI service. Please try again."
    }
  }
}

/**
 * Generates default enhanced metadata when not provided by AI
 */
function generateDefaultEnhancedMetadata(
  originalResume: ResumeData,
  tailoredContent: TailoredContent,
  jobData: JobData
) {
  // Extract keywords from job description
  const jobKeywords = jobData.jobDescription
    .toLowerCase()
    .match(/\b\w{3,}\b/g)
    ?.filter(word => !['the', 'and', 'for', 'with', 'will', 'you', 'our', 'this', 'that', 'from', 'they', 'have', 'been'].includes(word))
    .slice(0, 12) || []

  // Generate default ATS breakdown
  const atsBreakdown = {
    keywordMatch: Math.min(90, Math.max(70, tailoredContent.matchScore - 5)),
    formatScore: 95,
    relevanceScore: tailoredContent.matchScore,
    overallScore: tailoredContent.matchScore
  }

  // Generate detailed changes
  const detailedChanges = {
    professionalTitle: {
      changed: Boolean(tailoredContent.professionalTitle && tailoredContent.professionalTitle !== originalResume.personalInfo?.professionalTitle),
      changeType: "Aligned with job requirements",
      oldTitle: originalResume.personalInfo?.professionalTitle || "No title",
      newTitle: tailoredContent.professionalTitle,
      improvementReason: "Updated professional title to better match the job requirements and industry standards"
    },
    summary: {
      changed: Boolean(tailoredContent.summary && tailoredContent.summary !== originalResume.summary),
      changeType: "Enhanced with role-specific keywords",
      keywordsAdded: [jobData.jobTitle, jobData.companyName].filter(Boolean),
      improvementReason: "Refined to emphasize relevant experience and align with job requirements"
    },
    experience: tailoredContent.experience.map((exp, index) => ({
      id: exp.id,
      changed: true,
      changeType: "Optimized descriptions",
      keywordsAdded: jobKeywords.slice(index * 2, (index + 1) * 2),
      improvementReason: "Enhanced with quantified achievements and relevant technical terms"
    })),
    skills: {
      changed: true,
      changeType: "Complete restructure based on job requirements",
      skillsReordered: tailoredContent.skills.flatMap(cat => cat.skills.map(s => s.name)).slice(0, 8),
      skillsAdded: tailoredContent.skills.flatMap(cat => cat.skills.map(s => s.name)).filter(skill => 
        !originalResume.skills.flatMap(origCat => origCat.skills.map(s => s.name)).includes(skill)
      ),
      improvementReason: "Completely restructured skills to match job requirements, removed irrelevant skills, added missing key technologies, and organized by importance"
    },
    projects: tailoredContent.projects?.map((proj, index) => ({
      id: proj.id,
      changed: true,
      changeType: "Technology-focused optimization",
      keywordsAdded: jobKeywords.slice(6 + index * 2, 6 + (index + 1) * 2),
      improvementReason: "Emphasized technologies and outcomes relevant to the target role"
    }))
  }

  // Generate keyword analysis
  const keywordAnalysis = {
    jobKeywords: jobKeywords,
    matchedKeywords: jobKeywords.slice(0, Math.floor(jobKeywords.length * 0.7)),
    missedKeywords: jobKeywords.slice(Math.floor(jobKeywords.length * 0.7)),
    addedKeywords: [jobData.jobTitle, jobData.companyName, 'development', 'technical', 'experience'].filter(Boolean)
  }

  return { atsBreakdown, detailedChanges, keywordAnalysis }
}

/**
 * Applies the tailored content to the original resume data
 */
export function applyTailoredContent(
  originalResume: ResumeData,
  tailoredContent: TailoredContent,
  jobData: JobData
): ResumeData {
  // Create a deep copy of the original resume
  const tailoredResume: ResumeData = JSON.parse(JSON.stringify(originalResume))

  // Update the professional title
  if (tailoredResume.personalInfo) {
    tailoredResume.personalInfo.professionalTitle = tailoredContent.professionalTitle
  }

  // Update the summary
  tailoredResume.summary = tailoredContent.summary

  // Update experience descriptions
  tailoredContent.experience.forEach(tailoredExp => {
    const originalExp = tailoredResume.experience.find(exp => exp.id === tailoredExp.id)
    if (originalExp) {
      originalExp.description = tailoredExp.description
    }
  })

  // Completely replace skills with tailored ones
  // This allows the AI to restructure, add, and remove skills as needed
  tailoredResume.skills = tailoredContent.skills

  // Update project descriptions if available
  if (tailoredContent.projects) {
    tailoredContent.projects.forEach(tailoredProject => {
      const originalProject = tailoredResume.projects.find(proj => proj.id === tailoredProject.id)
      if (originalProject) {
        originalProject.description = tailoredProject.description
      }
    })
  }

  // Generate enhanced metadata if missing
  const hasEnhancedData = tailoredContent.atsBreakdown && tailoredContent.detailedChanges && tailoredContent.keywordAnalysis
  const enhancedMetadata = hasEnhancedData 
    ? {
        atsBreakdown: tailoredContent.atsBreakdown,
        detailedChanges: tailoredContent.detailedChanges,
        keywordAnalysis: tailoredContent.keywordAnalysis
      }
    : generateDefaultEnhancedMetadata(originalResume, tailoredContent, jobData)

  // Add enhanced tailoring metadata
  ;(tailoredResume as any).tailoringMetadata = {
    tailoredFor: {
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
      tailoredAt: new Date().toISOString()
    },
    matchScore: tailoredContent.matchScore,
    tailoringNotes: tailoredContent.tailoringNotes,
    ...enhancedMetadata
  }

  return tailoredResume
}

/**
 * Content optimization types and interfaces
 */
export interface OptimizeContentRequest {
  content: string
  contentType: 'summary' | 'experience' | 'project' | 'certification'
  context?: {
    jobTitle?: string
    companyName?: string
    position?: string
    projectName?: string
    certificationName?: string
  }
}

export interface OptimizeContentResult {
  success: boolean
  data?: {
    optimizedContent: string
    improvements: string[]
    wordCount: number
  }
  error?: string
}

/**
 * Builds prompts for different content types
 */
function buildOptimizationPrompt(request: OptimizeContentRequest): string {
  const { content, contentType, context } = request

  const baseRules = `
ROLE: You are an expert resume optimization specialist with deep knowledge of ATS systems, hiring practices, and professional resume writing.

TASK: Optimize the provided content to follow best resume practices, improve ATS score, and enhance professional impact.

CRITICAL REQUIREMENTS:
- Keep all information truthful and accurate
- Use strong action verbs and quantifiable achievements where possible
- Optimize for ATS keyword scanning
- Use professional, concise language
- Avoid buzzwords and clichés
- Focus on impact and results`

  let specificInstructions = ''
  let lengthRequirement = ''
  let outputFormat = ''

  switch (contentType) {
    case 'summary':
      lengthRequirement = '40-60 words (2-3 concise sentences)'
      specificInstructions = `
- Highlight most relevant skills and experience
- Include industry-specific keywords
- Focus on unique value proposition
- Mention years of experience if relevant
- Emphasize career achievements and goals`
      outputFormat = 'Return the optimized professional summary as plain text.'
      break

    case 'experience':
      lengthRequirement = '80-120 words total, formatted as 3-4 bullet points (15-25 words each)'
      specificInstructions = `
- Start each bullet with strong action verbs
- Include quantifiable results and achievements
- Highlight relevant skills and technologies that align with the professional title/career focus
- Show progression and impact in the role
- Use industry-specific keywords relevant to the career field
- Emphasize accomplishments that demonstrate value and expertise
- Format as bullet points starting with "•"
${context?.jobTitle ? `- Optimize content to align with career focus as a ${context.jobTitle}` : ''}`
      outputFormat = 'Return the optimized job description as bullet points, each starting with "•".'
      break

    case 'project':
      lengthRequirement = '40-60 words focusing on relevant technologies and outcomes'
      specificInstructions = `
- Emphasize technical skills and technologies used
- Highlight project outcomes and impact
- Include relevant metrics if applicable
- Show problem-solving abilities
- Use technical keywords appropriately`
      outputFormat = 'Return the optimized project description as plain text.'
      break

    case 'certification':
      lengthRequirement = 'Maximum 2 sentences with 15-22 words total'
      specificInstructions = `
- Highlight the value and relevance of the certification
- Mention specific skills or expertise gained
- Keep it concise and impactful
- Use professional terminology`
      outputFormat = 'Return the optimized certification description as plain text.'
      break
  }

  return `${baseRules}

CONTENT TYPE: ${contentType}
${context ? `CONTEXT: ${JSON.stringify(context)}` : ''}

ORIGINAL CONTENT:
"${content}"

SPECIFIC INSTRUCTIONS FOR ${contentType.toUpperCase()}:
${specificInstructions}

LENGTH REQUIREMENT: ${lengthRequirement}

${outputFormat}

Return ONLY the optimized content. Do not include explanations, headings, or additional text.`.trim()
}

/**
 * Optimizes individual content pieces using Gemini API
 */
export async function optimizeContentWithGemini(
  request: OptimizeContentRequest
): Promise<OptimizeContentResult> {
  try {
    // Validate inputs
    if (!request.content || request.content.trim().length === 0) {
      return {
        success: false,
        error: "Content is required"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    // Build the prompt
    const prompt = buildOptimizationPrompt(request)

    console.log(`🤖 Optimizing ${request.contentType} content with Gemini API...`)
    
    // Generate content using the Gemini API
    const client = getGeminiClient()
    if (!client) {
      throw new Error('Gemini client not available')
    }
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.4, // Slightly higher for more creative optimization
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024, // Smaller output for individual content pieces
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster responses
        }
      }
    })
    
    const responseText = result.text || ""
    
    if (!responseText) {
      return {
        success: false,
        error: "Empty response from AI service"
      }
    }

    // Clean the response
    const optimizedContent = responseText.trim()
    
    // Count words
    const wordCount = optimizedContent.split(/\s+/).length

    // Generate improvement notes based on content type
    const improvements = generateImprovementNotes(request.content, optimizedContent, request.contentType)

    console.log(`✅ Successfully optimized ${request.contentType} content (${wordCount} words)`)

    return {
      success: true,
      data: {
        optimizedContent,
        improvements,
        wordCount
      }
    }

  } catch (error) {
    console.error('❌ Error in optimizeContentWithGemini:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return {
          success: false,
          error: "Invalid API key configuration"
        }
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return {
          success: false,
          error: "AI service rate limit exceeded. Please try again in a moment."
        }
      }
    }

    return {
      success: false,
      error: "Failed to connect to AI service. Please try again."
    }
  }
}

/**
 * Generates improvement notes for optimization results
 */
function generateImprovementNotes(original: string, optimized: string, contentType: string): string[] {
  const improvements: string[] = []
  
  const originalWordCount = original.split(/\s+/).length
  const optimizedWordCount = optimized.split(/\s+/).length
  
  if (optimizedWordCount !== originalWordCount) {
    if (optimizedWordCount < originalWordCount) {
      improvements.push("Made content more concise")
    } else {
      improvements.push("Added more detail and impact")
    }
  }
  
  // Check for action verbs in experience content
  if (contentType === 'experience' && optimized.includes('•')) {
    improvements.push("Formatted as professional bullet points")
    if (optimized.match(/•\s*(Led|Managed|Developed|Implemented|Created|Improved|Increased|Reduced)/i)) {
      improvements.push("Added strong action verbs")
    }
  }
  
  // Check for quantifiable results
  if (optimized.match(/\d+%|\d+\+|[0-9]+/)) {
    improvements.push("Highlighted quantifiable achievements")
  }
  
  // Check for technical keywords
  if (contentType === 'project' && optimized.match(/React|Python|JavaScript|AWS|Docker|Node|SQL|API/i)) {
    improvements.push("Emphasized relevant technologies")
  }
  
  improvements.push("Optimized for ATS compatibility")
  improvements.push("Enhanced professional impact")
  
  return improvements
}

// ===== COVER LETTER FUNCTIONALITY =====

export interface CoverLetterJobData {
  jobTitle: string
  companyName: string
  hiringManager?: string | null
  jobDescription: string
}

export interface CoverLetterPersonalInfo {
  fullName: string
  email: string
  phone?: string
  address?: string
}

export interface CoverLetterContent {
  opening: string
  body: string
  closing: string
}

export interface GeneratedCoverLetter {
  content: CoverLetterContent
  tone: string
  improvements: string[]
  matchScore: number
}

export interface CoverLetterResult {
  success: boolean
  data?: GeneratedCoverLetter
  error?: string
}

/**
 * Writing tones for cover letters
 */
export const COVER_LETTER_TONES = {
  professional: 'Professional',
  enthusiastic: 'Enthusiastic', 
  creative: 'Creative',
  formal: 'Formal',
  conversational: 'Conversational',
  confident: 'Confident',
  warm: 'Warm and Friendly',
  analytical: 'Analytical'
} as const

export type CoverLetterTone = keyof typeof COVER_LETTER_TONES

/**
 * Builds a comprehensive prompt for cover letter generation
 */
function buildCoverLetterPrompt(
  jobData: CoverLetterJobData, 
  personalInfo: CoverLetterPersonalInfo, 
  tone: CoverLetterTone
): string {
  const hiringManagerName = jobData.hiringManager && jobData.hiringManager.trim() !== '' 
    ? jobData.hiringManager 
    : 'Hiring Manager'

  const toneInstructions = {
    professional: 'Use formal business language, be direct and concise, focus on qualifications and achievements',
    enthusiastic: 'Show genuine excitement and passion, use energetic language while maintaining professionalism',
    creative: 'Use engaging storytelling, creative metaphors, show personality while staying relevant',
    formal: 'Use very formal language, traditional business writing style, be respectful and conservative',
    conversational: 'Use a friendly, approachable tone as if speaking to a colleague, be personable yet professional',
    confident: 'Be bold and assertive, highlight strengths confidently, show leadership qualities',
    warm: 'Be personable and friendly, show genuine interest in the company, build connection',
    analytical: 'Use data-driven language, focus on logic and reasoning, be systematic and methodical'
  }[tone]

  return `
ROLE: You are an expert cover letter writer with deep knowledge of modern recruitment practices, industry standards, and persuasive business writing.

TASK: Generate a compelling, personalized cover letter that effectively markets the candidate for the specific job position.

INPUTS:
- Job Title: ${jobData.jobTitle}
- Company: ${jobData.companyName}
- Hiring Manager: ${hiringManagerName}
- Job Description: ${jobData.jobDescription}
- Candidate Name: ${personalInfo.fullName}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone || 'Not provided'}
- Location: ${personalInfo.address || 'Not provided'}
- Writing Tone: ${COVER_LETTER_TONES[tone]} - ${toneInstructions}

INSTRUCTIONS:
1. Create a compelling opening paragraph that:
   - DO NOT include any greeting or salutation (like "Dear Hiring Manager,") - this will be added separately
   - States the specific position being applied for
   - Includes a strong hook that captures attention
   - Shows knowledge of the company (if company info can be inferred from job description)

2. Write 2-3 body paragraphs that:
   - Highlight relevant skills and experience that match the job requirements
   - Use keywords from the job description naturally
   - Show specific value the candidate can bring to the role
   - Demonstrate knowledge of the company's goals/values (if evident from job description)
   - Include specific examples or achievements (when appropriate for the tone)

3. Create a strong closing paragraph that:
   - Reiterates interest and enthusiasm
   - Includes a professional call to action
   - Thanks the reader for their consideration
   - Ends with appropriate business closing

4. Ensure the tone is consistent throughout and matches the selected style
5. Keep each section focused and impactful
6. Use industry-appropriate language and terminology
7. Make it feel personal and tailored, not generic

CRITICAL REQUIREMENTS:
- Each paragraph should be 2-5 sentences
- Total length: Maximum 270 words
- Use proper business letter formatting structure
- Make it specific to this job and company
- Avoid clichés and generic statements
- Show genuine interest and research about the role
- Include transition sentences between paragraphs

OUTPUT FORMAT:
{
  "content": {
    "opening": "Full opening paragraph text",
    "body": "Full body paragraphs text (2-3 paragraphs combined)",
    "closing": "Full closing paragraph text"
  },
  "tone": "${tone}",
  "improvements": [
    "List of 3-5 key improvements made",
    "Specific optimizations for this job posting",
    "Tone-specific enhancements applied"
  ],
  "matchScore": 85
}

Return ONLY the JSON object. Do not add any explanation outside the JSON.
`.trim()
}

/**
 * Validates the structure of the cover letter response
 */
function validateCoverLetterContent(data: any): data is GeneratedCoverLetter {
  return (
    typeof data === 'object' &&
    typeof data.content === 'object' &&
    typeof data.content.opening === 'string' &&
    typeof data.content.body === 'string' &&
    typeof data.content.closing === 'string' &&
    typeof data.tone === 'string' &&
    Array.isArray(data.improvements) &&
    typeof data.matchScore === 'number'
  )
}

/**
 * Generates a cover letter using Gemini API
 */
export async function generateCoverLetterWithGemini(
  jobData: CoverLetterJobData,
  personalInfo: CoverLetterPersonalInfo,
  tone: CoverLetterTone = 'professional'
): Promise<CoverLetterResult> {
  try {
    // Validate inputs
    if (!jobData.jobTitle || !jobData.companyName || !personalInfo.fullName) {
      return {
        success: false,
        error: "Missing required job or personal information"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    // Build the prompt
    const prompt = buildCoverLetterPrompt(jobData, personalInfo, tone)

    console.log('🤖 Generating cover letter with Gemini API...')

    // Ask for JSON via the shared helper: valid JSON by construction, with a timeout,
    // retries and truncation detection instead of hand-rolled string repair.
    let parsedResponse: GeneratedCoverLetter
    try {
      parsedResponse = await generateJson<GeneratedCoverLetter>({
        prompt,
        model: "gemini-2.5-flash",
        temperature: 0.7, // Higher temperature for more creative cover letter writing
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
        thinkingBudget: 0, // Disable thinking for faster responses
      })
    } catch (aiError) {
      if (aiError instanceof AiJsonError) {
        if (aiError.code === 'empty') {
          console.error('❌ Empty cover letter response from Gemini:', aiError)
          return {
            success: false,
            error: "Empty response from AI service"
          }
        }
        if (aiError.code === 'invalid_json' || aiError.code === 'truncated') {
          console.error('❌ Failed to parse cover letter response:', aiError)
          return {
            success: false,
            error: "Invalid response format from AI service"
          }
        }
      }
      // Anything else (not configured, timeout, upstream) falls through to the
      // existing API_KEY / quota / generic handling below.
      throw aiError
    }

    console.log('📥 Received cover letter response from Gemini:', JSON.stringify(parsedResponse).substring(0, 200) + '...')

    // Validate response structure
    if (!validateCoverLetterContent(parsedResponse)) {
      console.error('❌ Invalid cover letter response structure:', parsedResponse)
      return {
        success: false,
        error: "AI service returned invalid cover letter data"
      }
    }

    console.log('✅ Successfully generated cover letter with match score:', parsedResponse.matchScore)

    return {
      success: true,
      data: parsedResponse as GeneratedCoverLetter
    }

  } catch (error) {
    console.error('❌ Error in generateCoverLetterWithGemini:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        return {
          success: false,
          error: "Invalid API key configuration"
        }
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return {
          success: false,
          error: "AI service rate limit exceeded. Please try again in a moment."
        }
      }
    }

    return {
      success: false,
      error: "Failed to connect to AI service. Please try again."
    }
  }
}