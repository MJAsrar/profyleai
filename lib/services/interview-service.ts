import { AiJsonError, generateJson } from "./ai-json"

// ===== INTERVIEW PREP FUNCTIONALITY =====

export interface InterviewJobData {
  companyName: string
  jobTitle: string
  jobDescription: string
  industry?: string
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive'
}

export interface PracticeQuestion {
  id: string
  question: string
  category: 'job-specific' | 'field-related' | 'behavioral'
  difficulty: 'easy' | 'medium' | 'hard'
  starFramework: {
    situation: string
    task: string
    action: string
    result: string
  }
  tips: string[]
  keywords: string[]
}

export interface GeneratedQuestions {
  questions: PracticeQuestion[]
  totalGenerated: number
  categories: string[]
}

export interface QuestionGenerationResult {
  success: boolean
  data?: GeneratedQuestions
  error?: string
}

export interface AnswerFeedback {
  score: number // 0-100
  strengths: string[]
  improvements: string[]
  starAnalysis: {
    situation: { present: boolean; quality: 'poor' | 'good' | 'excellent' }
    task: { present: boolean; quality: 'poor' | 'good' | 'excellent' }
    action: { present: boolean; quality: 'poor' | 'good' | 'excellent' }
    result: { present: boolean; quality: 'poor' | 'good' | 'excellent' }
  }
  rewrittenAnswer: string
  estimatedTime: number
}

export interface AnswerEvaluationResult {
  success: boolean
  data?: AnswerFeedback
  error?: string
}

export interface MockInterviewSession {
  sessionId: string
  questions: PracticeQuestion[]
  currentQuestionIndex: number
  answers: Array<{
    questionId: string
    answer: string
    feedback: AnswerFeedback
    timeSpent: number
  }>
  status: 'active' | 'completed' | 'paused'
  startedAt: string
  completedAt?: string
}

export interface MockInterviewSummary {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  categoryScores: Record<string, number>
  timeAnalysis: {
    totalTime: number
    averageTimePerQuestion: number
    fastestQuestion: number
    slowestQuestion: number
  }
  starFrameworkUsage: {
    overall: number
    byQuestion: Array<{ questionId: string; score: number }>
  }
}

export interface MockInterviewResult {
  success: boolean
  data?: {
    session: MockInterviewSession
    summary?: MockInterviewSummary
  }
  error?: string
}

export interface CompanyResearch {
  companyName: string
  overview: string
  mission: string
  values: string[]
  recentNews: string[]
  industryTrends: string[]
  likelyQuestions: string[]
  cultureFit: string[]
  competitorInfo: string[]
}

export interface CompanyResearchResult {
  success: boolean
  data?: CompanyResearch
  error?: string
}

export interface BehavioralCoaching {
  commonQuestions: Array<{
    question: string
    category: string
    modelAnswer: string
    tips: string[]
  }>
  situationalScenarios: Array<{
    scenario: string
    approach: string
    keyPoints: string[]
  }>
}

export interface BehavioralCoachingResult {
  success: boolean
  data?: BehavioralCoaching
  error?: string
}

export interface InterviewProgress {
  userId: string
  sessionsCompleted: number
  totalQuestions: number
  averageScore: number
  confidenceScore: number
  improvementAreas: string[]
  strengths: string[]
  lastSessionDate: string
  weeklyProgress: Array<{
    week: string
    sessions: number
    averageScore: number
  }>
}

export interface ProgressTrackingResult {
  success: boolean
  data?: InterviewProgress
  error?: string
}

/**
 * Generates AI-powered practice questions based on job data
 */
export async function generatePracticeQuestions(
  jobData: InterviewJobData,
  questionCount: number = 10
): Promise<QuestionGenerationResult> {
  try {
    if (!jobData.companyName || !jobData.jobTitle || !jobData.jobDescription) {
      return {
        success: false,
        error: "Missing required job information"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    const prompt = `
ROLE: You are an expert interview coach and hiring manager with deep knowledge of modern interview practices across all industries.

TASK: Generate ${questionCount} diverse, role-specific interview questions for this position, including STAR framework guidance and practical tips.

JOB INFORMATION:
- Company: ${jobData.companyName}
- Position: ${jobData.jobTitle}
- Industry: ${jobData.industry || 'Not specified'}
- Experience Level: ${jobData.experienceLevel || 'Not specified'}
- Job Description: ${jobData.jobDescription}

REQUIREMENTS:
1. Generate questions across these specific categories with exact distribution for mock interviews:
   - job-specific (40%): Questions directly related to the specific job requirements, skills, and responsibilities mentioned in the job description
   - field-related (30%): Questions about the general field/industry knowledge, trends, and best practices
   - behavioral (30%): Soft skills, past experiences, leadership, teamwork, and behavioral competencies

IMPORTANT: Use EXACTLY these category names in your response: "job-specific", "field-related", "behavioral"

2. Mix difficulty levels:
   - Easy (30%): Basic questions for warming up
   - Medium (50%): Standard interview questions
   - Hard (20%): Challenging questions for senior roles

3. For each question, provide:
   - STAR framework guidance (Situation, Task, Action, Result)
   - 3-5 practical tips for answering
   - Relevant keywords to include
   - Appropriate difficulty level

4. Ensure questions are:
   - Job-specific questions: Directly tied to requirements, technologies, tools, or processes mentioned in the job description
   - Field-related questions: About industry knowledge, trends, standards, and general practices in the field
   - Behavioral questions: Focus on soft skills, work style, leadership, communication, and past experiences
   - Appropriate for the experience level
   - Varied in format and approach
   - Realistic and commonly asked

OUTPUT FORMAT:
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time when you had to solve a complex problem under pressure.",
      "category": "behavioral",
      "difficulty": "medium",
      "starFramework": {
        "situation": "Describe the context and pressure you were under",
        "task": "Explain what needed to be accomplished",
        "action": "Detail the specific steps you took to solve the problem",
        "result": "Share the outcome and what you learned"
      },
      "tips": [
        "Choose a specific, relevant example from your experience",
        "Focus on your problem-solving process",
        "Quantify the impact when possible",
        "Show how you handle stress positively",
        "Highlight skills relevant to this role"
      ],
      "keywords": ["problem-solving", "pressure", "analysis", "decision-making", "results"]
    },
    {
      "id": "q2", 
      "question": "How would you implement [specific technology/process from job description]?",
      "category": "job-specific",
      "difficulty": "medium",
      "starFramework": { ... },
      "tips": [ ... ],
      "keywords": [ ... ]
    },
    {
      "id": "q3",
      "question": "What are the current trends in [industry/field]?", 
      "category": "field-related",
      "difficulty": "easy",
      "starFramework": { ... },
      "tips": [ ... ],
      "keywords": [ ... ]
    }
  ],
  "totalGenerated": ${questionCount},
  "categories": ["job-specific", "field-related", "behavioral"]
}

CRITICAL: Every question MUST have category set to exactly one of: "job-specific", "field-related", or "behavioral"

Return ONLY the JSON object. Ensure all questions are unique and relevant to the ${jobData.jobTitle} role.`.trim()

    console.log('🤖 Generating practice questions with Gemini API...')

    let parsedResponse: GeneratedQuestions
    try {
      parsedResponse = await generateJson<GeneratedQuestions>({
        prompt,
        temperature: 0.3, // Lower temperature for consistent questions
        maxOutputTokens: 4096,
        thinkingBudget: 0, // Straightforward generation — thinking disabled for faster responses
      })
    } catch (error) {
      if (error instanceof AiJsonError && error.code === 'empty') {
        return {
          success: false,
          error: "Empty response from AI service"
        }
      }
      if (
        error instanceof AiJsonError &&
        (error.code === 'invalid_json' || error.code === 'truncated')
      ) {
        console.error('❌ Failed to parse questions response:', error)
        return {
          success: false,
          error: "Invalid response format from AI service"
        }
      }
      throw error
    }

    // Validate response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      return {
        success: false,
        error: "AI service returned invalid question data"
      }
    }

    console.log(`✅ Successfully generated ${parsedResponse.questions.length} practice questions`)

    return {
      success: true,
      data: parsedResponse
    }

  } catch (error) {
    console.error('❌ Error in generatePracticeQuestions:', error)
    return {
      success: false,
      error: "Failed to generate practice questions. Please try again."
    }
  }
}

/**
 * Evaluates an answer and provides feedback using STAR framework
 */
export async function evaluateAnswer(
  question: PracticeQuestion,
  answer: string,
  jobContext: InterviewJobData
): Promise<AnswerEvaluationResult> {
  try {
    if (!answer || answer.trim().length === 0) {
      return {
        success: false,
        error: "Answer is required"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    const prompt = `
ROLE: You are an expert interview coach and hiring manager with deep knowledge of the STAR framework and professional communication.

TASK: Evaluate this interview answer and provide comprehensive feedback including a professional rewrite.

CONTEXT:
- Question: "${question.question}"
- Category: ${question.category}
- Difficulty: ${question.difficulty}
- Job Role: ${jobContext.jobTitle}
- Company: ${jobContext.companyName}

CANDIDATE'S ANSWER:
"${answer}"

EVALUATION CRITERIA:
1. STAR Framework Analysis:
   - Situation: Is the context clearly described?
   - Task: Is the objective/challenge clearly stated?
   - Action: Are specific actions detailed?
   - Result: Is the outcome quantified and impactful?

2. Overall Quality Assessment:
   - Clarity and structure
   - Relevance to the role
   - Professional communication
   - Specific examples and details
   - Impact and achievements

3. Areas for Improvement:
   - Missing STAR elements
   - Vague statements
   - Lack of quantification
   - Poor structure
   - Irrelevant details

REQUIREMENTS:
1. Score the answer from 0-100
2. Identify 3-5 key strengths
3. Provide 3-5 specific improvements
4. Analyze each STAR component
5. Rewrite the answer professionally
6. Estimate speaking time (words ÷ 2.5 = seconds)

OUTPUT FORMAT:
{
  "score": 75,
  "strengths": [
    "Clear situation description",
    "Specific actions taken",
    "Quantified results"
  ],
  "improvements": [
    "Add more detail about the task/challenge",
    "Include specific metrics or numbers",
    "Better connect to role requirements"
  ],
  "starAnalysis": {
    "situation": { "present": true, "quality": "good" },
    "task": { "present": false, "quality": "poor" },
    "action": { "present": true, "quality": "excellent" },
    "result": { "present": true, "quality": "good" }
  },
  "rewrittenAnswer": "Professional rewrite of the answer following STAR framework...",
  "estimatedTime": 45
}

Return ONLY the JSON object.`.trim()

    console.log('🤖 Evaluating answer with Gemini API...')

    let parsedResponse: AnswerFeedback
    try {
      // No thinkingBudget here on purpose: this is a judgment/grading task. Disabling
      // thinking makes the score and feedback shallow and poorly calibrated, so we let
      // the model reason before it grades.
      //
      // Because thinking tokens count against the output budget on Gemini 2.5, the
      // limit is raised from 2048 so a long chain of thought can't starve the actual
      // JSON and trip the truncation path.
      parsedResponse = await generateJson<AnswerFeedback>({
        prompt,
        temperature: 0.3, // Lower temperature for consistent evaluation
        maxOutputTokens: 8192,
      })
    } catch (error) {
      if (error instanceof AiJsonError && error.code === 'empty') {
        return {
          success: false,
          error: "Empty response from AI service"
        }
      }
      if (
        error instanceof AiJsonError &&
        (error.code === 'invalid_json' || error.code === 'truncated')
      ) {
        console.error('❌ Failed to parse evaluation response:', error)
        return {
          success: false,
          error: "Invalid response format from AI service"
        }
      }
      throw error
    }

    console.log(`✅ Successfully evaluated answer with score: ${parsedResponse.score}`)

    return {
      success: true,
      data: parsedResponse
    }

  } catch (error) {
    console.error('❌ Error in evaluateAnswer:', error)
    return {
      success: false,
      error: "Failed to evaluate answer. Please try again."
    }
  }
}

/**
 * Conducts company research for interview preparation
 */
export async function conductCompanyResearch(
  companyName: string,
  jobTitle: string,
  industry?: string
): Promise<CompanyResearchResult> {
  try {
    if (!companyName || !jobTitle) {
      return {
        success: false,
        error: "Company name and job title are required"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    const prompt = `
ROLE: You are an expert business analyst and interview coach with deep knowledge of companies, industries, and hiring practices.

TASK: Conduct comprehensive research on this company for interview preparation purposes.

COMPANY INFORMATION:
- Company Name: ${companyName}
- Position: ${jobTitle}
- Industry: ${industry || 'Research and determine'}

RESEARCH REQUIREMENTS:
1. Company Overview: Brief description, size, founding, key facts
2. Mission & Vision: Core purpose and future goals
3. Values: Key company values and culture principles
4. Recent News: Major developments, achievements, challenges (last 2 years)
5. Industry Trends: Relevant trends affecting the company
6. Likely Interview Questions: 8-10 company-specific questions
7. Culture Fit: What type of candidates they typically hire
8. Competitor Information: Key competitors and differentiators

INSTRUCTIONS:
- Provide factual, up-to-date information when possible
- If specific information isn't available, provide general industry insights
- Focus on information relevant to interview preparation
- Include questions that demonstrate company knowledge
- Highlight cultural aspects important for role fit

OUTPUT FORMAT:
{
  "companyName": "${companyName}",
  "overview": "Comprehensive company description including size, founding, key business areas...",
  "mission": "Company mission statement and core purpose...",
  "values": [
    "Innovation and creativity",
    "Customer-first approach",
    "Collaborative teamwork",
    "Continuous learning"
  ],
  "recentNews": [
    "Recent product launch or expansion",
    "Key partnerships or acquisitions",
    "Awards or recognition received"
  ],
  "industryTrends": [
    "Digital transformation initiatives",
    "Sustainability focus",
    "Remote work adoption"
  ],
  "likelyQuestions": [
    "What interests you about our company's mission?",
    "How do you see yourself contributing to our team?",
    "What do you know about our recent product launch?"
  ],
  "cultureFit": [
    "Collaborative team players",
    "Self-motivated individuals",
    "Customer-focused mindset"
  ],
  "competitorInfo": [
    "Main competitor analysis",
    "Key differentiators",
    "Market positioning"
  ]
}

Return ONLY the JSON object with accurate, interview-relevant information.`.trim()

    console.log(`🤖 Researching company ${companyName} with Gemini API...`)

    let parsedResponse: CompanyResearch
    try {
      parsedResponse = await generateJson<CompanyResearch>({
        prompt,
        temperature: 0.4, // Balanced creativity for research
        maxOutputTokens: 3072,
        thinkingBudget: 0, // Straightforward generation — thinking disabled for faster responses
      })
    } catch (error) {
      if (error instanceof AiJsonError && error.code === 'empty') {
        return {
          success: false,
          error: "Empty response from AI service"
        }
      }
      if (
        error instanceof AiJsonError &&
        (error.code === 'invalid_json' || error.code === 'truncated')
      ) {
        console.error('❌ Failed to parse research response:', error)
        return {
          success: false,
          error: "Invalid response format from AI service"
        }
      }
      throw error
    }

    console.log(`✅ Successfully researched company: ${companyName}`)

    return {
      success: true,
      data: parsedResponse
    }

  } catch (error) {
    console.error('❌ Error in conductCompanyResearch:', error)
    return {
      success: false,
      error: "Failed to conduct company research. Please try again."
    }
  }
}

/**
 * Generates behavioral coaching content
 */
export async function generateBehavioralCoaching(
  jobTitle: string,
  experienceLevel: string = 'mid'
): Promise<BehavioralCoachingResult> {
  try {
    if (!jobTitle) {
      return {
        success: false,
        error: "Job title is required"
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: "Gemini API key not configured"
      }
    }

    const prompt = `
ROLE: Expert behavioral interview coach with deep knowledge of modern hiring practices.

TASK: Generate behavioral coaching content for ${jobTitle} at ${experienceLevel} level.

REQUIREMENTS:
1. Generate 6-8 common behavioral questions with STAR framework model answers
2. Include 4-5 situational scenarios with recommended approaches
3. Focus on: teamwork, problem-solving, communication, adaptability, results, time management

CRITICAL FORMATTING RULES:
- Return ONLY valid JSON - no markdown, no explanations, no extra text
- Keep all text content under 100 words each
- Use double quotes for all strings
- No trailing commas
- Escape any quotes or special characters in text content

OUTPUT FORMAT (return exactly this structure):
{
  "commonQuestions": [
    {
      "question": "Tell me about a challenging project you completed",
      "category": "Problem-solving", 
      "modelAnswer": "Brief STAR format answer",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ],
  "situationalScenarios": [
    {
      "scenario": "Brief scenario description",
      "approach": "Recommended approach summary", 
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ]
}

IMPORTANT: Return ONLY the JSON object above, nothing else.`.trim()

    console.log(`🎯 Generating behavioral coaching for: ${jobTitle} at level: ${experienceLevel}`)
    console.log(`🤖 Generating behavioral coaching for ${jobTitle} with Gemini API...`)
    
    let parsedResponse: BehavioralCoaching
    try {
      parsedResponse = await generateJson<BehavioralCoaching>({
        prompt,
        temperature: 0.3, // Lower temperature for more consistent output
        maxOutputTokens: 2048, // Increase for complete responses
        thinkingBudget: 0, // Straightforward generation, not judgment - thinking off for faster responses
      })
    } catch (error) {
      if (error instanceof AiJsonError && error.code === 'empty') {
        return {
          success: false,
          error: "Empty response from AI service"
        }
      }
      if (
        !(error instanceof AiJsonError) ||
        (error.code !== 'invalid_json' && error.code !== 'truncated')
      ) {
        throw error
      }

      console.error('❌ Failed to parse coaching response:', error)
      // A malformed AI response is a failure, not a result. The old code returned a
      // hardcoded generic coaching template with success:true here — fabricated content
      // presented as if the model wrote it for this role.
      return {
        success: false,
        error: "Invalid response format from AI service"
      }
    }

    console.log(`✅ Successfully generated behavioral coaching content`)

    return {
      success: true,
      data: parsedResponse
    }

  } catch (error) {
    console.error('❌ Error in generateBehavioralCoaching:', error)
    return {
      success: false,
      error: "Failed to generate behavioral coaching. Please try again."
    }
  }
}

/**
 * Creates a mock interview session
 */
export function createMockInterviewSession(
  questions: PracticeQuestion[]
): MockInterviewSession {
  const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    sessionId,
    questions,
    currentQuestionIndex: 0,
    answers: [],
    status: 'active',
    startedAt: new Date().toISOString()
  }
}

/**
 * Generates a comprehensive summary for a completed mock interview
 */
export function generateMockInterviewSummary(
  session: MockInterviewSession
): MockInterviewSummary {
  const answers = session.answers
  const totalQuestions = answers.length
  
  if (totalQuestions === 0) {
    return {
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      improvements: [],
      categoryScores: {},
      timeAnalysis: {
        totalTime: 0,
        averageTimePerQuestion: 0,
        fastestQuestion: 0,
        slowestQuestion: 0
      },
      starFrameworkUsage: {
        overall: 0,
        byQuestion: []
      }
    }
  }

  // Calculate overall score
  const overallScore = Math.round(
    answers.reduce((sum, answer) => sum + answer.feedback.score, 0) / totalQuestions
  )

  // Collect all strengths and improvements
  const allStrengths = answers.flatMap(answer => answer.feedback.strengths)
  const allImprovements = answers.flatMap(answer => answer.feedback.improvements)

  // Count frequency and get top items
  const strengthCounts = allStrengths.reduce((acc, strength) => {
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const improvementCounts = allImprovements.reduce((acc, improvement) => {
    acc[improvement] = (acc[improvement] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const strengths = Object.entries(strengthCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([strength]) => strength)

  const improvements = Object.entries(improvementCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([improvement]) => improvement)

  // Calculate category scores
  const categoryScores: Record<string, number> = {}
  const categoryAnswers: Record<string, number[]> = {}

  session.questions.forEach((question, index) => {
    const answer = answers.find(a => a.questionId === question.id)
    if (answer) {
      if (!categoryAnswers[question.category]) {
        categoryAnswers[question.category] = []
      }
      categoryAnswers[question.category].push(answer.feedback.score)
    }
  })

  Object.entries(categoryAnswers).forEach(([category, scores]) => {
    categoryScores[category] = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    )
  })

  // Time analysis
  const times = answers.map(answer => answer.timeSpent)
  const totalTime = times.reduce((sum, time) => sum + time, 0)
  const averageTimePerQuestion = Math.round(totalTime / totalQuestions)
  const fastestQuestion = Math.min(...times)
  const slowestQuestion = Math.max(...times)

  // STAR framework usage analysis
  const starScores = answers.map(answer => {
    const star = answer.feedback.starAnalysis
    const starScore = Object.values(star).reduce((sum, component) => {
      if (component.present) {
        switch (component.quality) {
          case 'excellent': return sum + 3
          case 'good': return sum + 2
          case 'poor': return sum + 1
          default: return sum
        }
      }
      return sum
    }, 0)
    return { questionId: answer.questionId, score: Math.round((starScore / 12) * 100) }
  })

  const overallStarUsage = Math.round(
    starScores.reduce((sum, item) => sum + item.score, 0) / starScores.length
  )

  // Generate weakness categories based on low-scoring areas
  const weaknesses: string[] = []
  if (overallStarUsage < 60) {
    weaknesses.push("STAR framework structure needs improvement")
  }
  if (categoryScores.behavioral && categoryScores.behavioral < 70) {
    weaknesses.push("Behavioral question responses need more specific examples")
  }
  if (categoryScores.technical && categoryScores.technical < 70) {
    weaknesses.push("Technical explanations could be clearer and more detailed")
  }
  if (averageTimePerQuestion > 180) { // 3 minutes
    weaknesses.push("Responses tend to be too lengthy - practice being more concise")
  }
  if (averageTimePerQuestion < 60) { // 1 minute
    weaknesses.push("Responses are too brief - add more detail and examples")
  }

  return {
    overallScore,
    strengths,
    weaknesses,
    improvements,
    categoryScores,
    timeAnalysis: {
      totalTime,
      averageTimePerQuestion,
      fastestQuestion,
      slowestQuestion
    },
    starFrameworkUsage: {
      overall: overallStarUsage,
      byQuestion: starScores
    }
  }
}

/**
 * Simulates progress tracking (in a real app, this would connect to a database)
 */
export function getInterviewProgress(userId: string): InterviewProgress {
  // This is a mock implementation - in a real app, you'd fetch from a database
  const mockProgress: InterviewProgress = {
    userId,
    sessionsCompleted: 8,
    totalQuestions: 67,
    averageScore: 78,
    confidenceScore: 82,
    improvementAreas: [
      "Technical depth in explanations",
      "STAR framework consistency",
      "Quantifying achievements"
    ],
    strengths: [
      "Clear communication",
      "Problem-solving approach",
      "Professional demeanor"
    ],
    lastSessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    weeklyProgress: [
      { week: "Week 1", sessions: 2, averageScore: 65 },
      { week: "Week 2", sessions: 3, averageScore: 72 },
      { week: "Week 3", sessions: 2, averageScore: 78 },
      { week: "Week 4", sessions: 1, averageScore: 85 }
    ]
  }

  return mockProgress
}