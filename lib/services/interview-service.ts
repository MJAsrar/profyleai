import { GoogleGenAI } from "@google/genai"

// Initialize the Gemini API client only when needed (server-side only)
let genAI: any = null

function getGeminiClient() {
  if (!genAI && typeof window === 'undefined') {
    // Only initialize on server-side
    genAI = new GoogleGenAI({})
  }
  return genAI
}

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
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific' | 'general'
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

export interface QuestionGenerationResult {
  success: boolean
  data?: {
    questions: PracticeQuestion[]
    totalGenerated: number
    categories: string[]
  }
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
1. Generate questions across these categories:
   - Behavioral (40%): Past experience and soft skills
   - Technical (30%): Role-specific technical competencies
   - Situational (20%): Hypothetical scenarios
   - Company-specific (10%): Company culture and values

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
   - Relevant to the specific role and industry
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
    }
  ],
  "totalGenerated": ${questionCount},
  "categories": ["behavioral", "technical", "situational", "company-specific"]
}

Return ONLY the JSON object. Ensure all questions are unique and relevant to the ${jobData.jobTitle} role.`.trim()

    console.log('🤖 Generating practice questions with Gemini API...')
    
    const client = getGeminiClient()
    if (!client) {
      throw new Error('Gemini client not available')
    }

    const result = await client.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0.7, // Higher creativity for diverse questions
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
        thinkingConfig: {
          thinkingBudget: 0,
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

    // Parse JSON response with improved error handling
    let parsedResponse: any
    try {
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Remove or escape control characters that break JSON parsing
      cleanedResponse = cleanedResponse.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      
      // Fix common JSON issues
      cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
      
      // Extract JSON object if there's extra text
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse questions response:', parseError)
      console.error('Response length:', responseText.length)
      return {
        success: false,
        error: "Invalid response format from AI service"
      }
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
    
    const client = getGeminiClient()
    if (!client) {
      throw new Error('Gemini client not available')
    }

    const result = await client.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0.3, // Lower temperature for consistent evaluation
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0,
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

    // Parse JSON response with improved error handling
    let parsedResponse: any
    try {
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Remove or escape control characters that break JSON parsing
      cleanedResponse = cleanedResponse.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      
      // Fix common JSON issues
      cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
      
      // Extract JSON object if there's extra text
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse evaluation response:', parseError)
      console.error('Response length:', responseText.length)
      return {
        success: false,
        error: "Invalid response format from AI service"
      }
    }

    console.log(`✅ Successfully evaluated answer with score: ${parsedResponse.score}`)

    return {
      success: true,
      data: parsedResponse as AnswerFeedback
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
    
    const client = getGeminiClient()
    if (!client) {
      throw new Error('Gemini client not available')
    }

    const result = await client.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0.4, // Balanced creativity for research
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 3072,
        thinkingConfig: {
          thinkingBudget: 0,
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

    // Parse JSON response with improved error handling
    let parsedResponse: any
    try {
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Remove or escape control characters that break JSON parsing
      cleanedResponse = cleanedResponse.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      
      // Fix common JSON issues
      cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
      
      // Extract JSON object if there's extra text
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse research response:', parseError)
      console.error('Response length:', responseText.length)
      return {
        success: false,
        error: "Invalid response format from AI service"
      }
    }

    console.log(`✅ Successfully researched company: ${companyName}`)

    return {
      success: true,
      data: parsedResponse as CompanyResearch
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

CRITICAL: Return ONLY valid JSON. Keep model answers concise (max 100 words each).

OUTPUT FORMAT:
{
  "commonQuestions": [
    {
      "question": "Tell me about a challenging project you completed",
      "category": "Problem-solving",
      "modelAnswer": "Brief STAR format answer focusing on situation, task, action, and result",
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

Return ONLY the JSON object.`.trim()

    console.log(`🤖 Generating behavioral coaching for ${jobTitle} with Gemini API...`)
    
    const client = getGeminiClient()
    if (!client) {
      throw new Error('Gemini client not available')
    }

    const result = await client.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0.5, // Balanced for coaching content
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1536, // Further reduced to prevent truncation
        thinkingConfig: {
          thinkingBudget: 0,
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

    // Parse JSON response with better error handling
    let parsedResponse: any
    try {
      // Clean the response text more thoroughly
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Remove or escape control characters that break JSON parsing
      // Replace problematic control characters (except for normal whitespace)
      cleanedResponse = cleanedResponse.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      
      // Fix common JSON issues
      // Remove any trailing commas before closing braces/brackets
      cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1')
      
      // Try to find and extract just the JSON object if there's extra text
      const jsonStart = cleanedResponse.indexOf('{')
      const jsonEnd = cleanedResponse.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1)
      }
      
      // Check if JSON appears to be truncated (common issue with large responses)
      if (!cleanedResponse.trim().endsWith('}')) {
        console.warn('⚠️ JSON appears to be truncated, attempting to fix...')
        // Try to close any open structures
        const openBraces = (cleanedResponse.match(/{/g) || []).length
        const closeBraces = (cleanedResponse.match(/}/g) || []).length
        const openBrackets = (cleanedResponse.match(/\[/g) || []).length
        const closeBrackets = (cleanedResponse.match(/\]/g) || []).length
        
        // Add missing closing braces/brackets
        for (let i = 0; i < (openBrackets - closeBrackets); i++) {
          cleanedResponse += ']'
        }
        for (let i = 0; i < (openBraces - closeBraces); i++) {
          cleanedResponse += '}'
        }
      }
      
      // Attempt to fix unterminated strings by finding unmatched quotes
      const lines = cleanedResponse.split('\n')
      const fixedLines = lines.map((line: string) => {
        // If line ends with an unescaped quote that's not properly closed, try to fix it
        if (line.match(/[^\\]"[^"]*$/)) {
          return line + '"'
        }
        return line
      })
      cleanedResponse = fixedLines.join('\n')
      
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse coaching response:', parseError)
      console.error('Response text length:', responseText.length)
      console.error('First 500 chars:', responseText.substring(0, 500))
      console.error('Last 500 chars:', responseText.substring(Math.max(0, responseText.length - 500)))
      
      // Return a fallback response instead of failing completely
      return {
        success: true,
        data: {
          commonQuestions: [
            {
              question: "Tell me about a time when you had to work with a difficult team member.",
              category: "Teamwork",
              modelAnswer: "In my previous role, I encountered a situation where a team member was consistently missing deadlines, which was affecting our project timeline. I approached them privately to understand if there were any challenges they were facing. It turned out they were overwhelmed with their workload. I worked with them to prioritize tasks and offered to help with some of their responsibilities. As a result, we were able to get back on track and deliver the project successfully. This experience taught me the importance of open communication and supporting team members when they're struggling.",
              tips: [
                "Focus on your communication and problem-solving skills",
                "Show empathy and understanding",
                "Highlight positive outcomes and what you learned",
                "Demonstrate your ability to work collaboratively"
              ]
            },
            {
              question: "Describe a time when you had to learn something new quickly.",
              category: "Learning & Adaptability",
              modelAnswer: "When I joined my current role, I needed to quickly learn a new programming framework that was critical to our project. I dedicated extra time outside of work hours to take online courses and practice coding exercises. I also reached out to colleagues who were experienced with the framework for guidance. Within two weeks, I was able to contribute meaningfully to the project and even identified a more efficient approach to implement one of the features. This experience reinforced my ability to quickly adapt and learn new technologies.",
              tips: [
                "Emphasize your learning methodology",
                "Show initiative and resourcefulness",
                "Mention specific actions you took",
                "Highlight the positive outcome"
              ]
            },
            {
              question: "Tell me about a time when you had to deal with a challenging deadline.",
              category: "Time Management",
              modelAnswer: "Our team was given a project with a very tight deadline due to a client's urgent need. I immediately broke down the project into smaller, manageable tasks and created a detailed timeline. I identified which tasks could be done in parallel and which team members had the right skills for each task. I also set up daily check-ins to monitor progress and address any blockers quickly. Despite the challenging timeline, we delivered the project on time and the client was very satisfied with the quality of our work.",
              tips: [
                "Demonstrate your project management skills",
                "Show how you handle pressure",
                "Mention specific strategies you used",
                "Highlight successful outcomes"
              ]
            }
          ],
          situationalScenarios: [
            {
              scenario: "You're given a project with an unrealistic deadline",
              approach: "Assess scope, communicate constraints, propose alternatives",
              keyPoints: [
                "Demonstrate project management skills",
                "Show communication with stakeholders",
                "Highlight problem-solving approach",
                "Emphasize collaboration and negotiation"
              ]
            },
            {
              scenario: "A team member disagrees with your approach",
              approach: "Listen to their concerns, discuss alternatives, find common ground",
              keyPoints: [
                "Show emotional intelligence",
                "Demonstrate conflict resolution skills",
                "Highlight collaborative decision-making",
                "Emphasize respect for different perspectives"
              ]
            }
          ]
        }
      }
    }

    console.log(`✅ Successfully generated behavioral coaching content`)

    return {
      success: true,
      data: parsedResponse as BehavioralCoaching
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