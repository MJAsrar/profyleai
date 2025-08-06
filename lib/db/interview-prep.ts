import { PrismaClient } from '@prisma/client'
import { 
  PracticeQuestion, 
  CompanyResearch, 
  BehavioralCoaching,
  MockInterviewSession,
  MockInterviewSummary,
  AnswerFeedback,
  InterviewProgress,
  InterviewJobData
} from '@/lib/services/interview-service'

const prisma = new PrismaClient()

export interface InterviewPrepData {
  id: string
  userId: string
  title: string
  companyName: string
  jobTitle: string
  jobDescription: string
  industry?: string
  experienceLevel: string
  questions: PracticeQuestion[]
  companyResearch?: CompanyResearch
  behavioralCoaching?: BehavioralCoaching
  questionsGenerated: boolean
  researchCompleted: boolean
  coachingLoaded: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MockInterviewData {
  id: string
  userId: string
  interviewPrepId: string
  sessionId: string
  title: string
  status: string
  questions: PracticeQuestion[]
  currentQuestionIndex: number
  startedAt: Date
  completedAt?: Date
  totalTime?: number
  overallScore?: number
  summary?: MockInterviewSummary
  answers: InterviewAnswerData[]
}

export interface InterviewAnswerData {
  id: string
  mockInterviewId: string
  questionId: string
  question: string
  answer: string
  category: string
  difficulty: string
  score: number
  feedback: AnswerFeedback
  timeSpent: number
  starAnalysis: any
}

/**
 * Create a new interview prep session
 */
export async function createInterviewPrep(
  userId: string,
  jobData: InterviewJobData,
  questions: PracticeQuestion[]
): Promise<InterviewPrepData> {
  const title = `${jobData.jobTitle} at ${jobData.companyName}`
  
  const interviewPrep = await prisma.interviewPrep.create({
    data: {
      userId,
      title,
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      jobDescription: jobData.jobDescription,
      industry: jobData.industry,
      experienceLevel: jobData.experienceLevel || 'mid',
      questions: questions as any,
      questionsGenerated: true,
    }
  })

  return {
    ...interviewPrep,
    questions: questions,
    companyResearch: undefined,
    behavioralCoaching: undefined,
  }
}

/**
 * Get all interview preps for a user
 */
export async function getUserInterviewPreps(userId: string): Promise<InterviewPrepData[]> {
  const preps = await prisma.interviewPrep.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  })

  return preps.map(prep => ({
    ...prep,
    questions: prep.questions as PracticeQuestion[],
    companyResearch: prep.companyResearch as CompanyResearch | undefined,
    behavioralCoaching: prep.behavioralCoaching as BehavioralCoaching | undefined,
  }))
}

/**
 * Get a specific interview prep by ID
 */
export async function getInterviewPrep(id: string, userId: string): Promise<InterviewPrepData | null> {
  const prep = await prisma.interviewPrep.findFirst({
    where: { id, userId }
  })

  if (!prep) return null

  return {
    ...prep,
    questions: prep.questions as PracticeQuestion[],
    companyResearch: prep.companyResearch as CompanyResearch | undefined,
    behavioralCoaching: prep.behavioralCoaching as BehavioralCoaching | undefined,
  }
}

/**
 * Update interview prep with company research
 */
export async function updateInterviewPrepResearch(
  id: string,
  userId: string,
  research: CompanyResearch
): Promise<void> {
  await prisma.interviewPrep.update({
    where: { id },
    data: {
      companyResearch: research as any,
      researchCompleted: true,
      updatedAt: new Date()
    }
  })
}

/**
 * Update interview prep with behavioral coaching
 */
export async function updateInterviewPrepCoaching(
  id: string,
  userId: string,
  coaching: BehavioralCoaching
): Promise<void> {
  await prisma.interviewPrep.update({
    where: { id },
    data: {
      behavioralCoaching: coaching as any,
      coachingLoaded: true,
      updatedAt: new Date()
    }
  })
}

/**
 * Create a new mock interview session
 */
export async function createMockInterview(
  userId: string,
  interviewPrepId: string,
  sessionId: string,
  questions: PracticeQuestion[]
): Promise<MockInterviewData> {
  const interviewPrep = await prisma.interviewPrep.findFirst({
    where: { id: interviewPrepId, userId }
  })

  if (!interviewPrep) {
    throw new Error('Interview prep not found')
  }

  const title = `Mock Interview - ${interviewPrep.jobTitle}`

  const mockInterview = await prisma.mockInterview.create({
    data: {
      userId,
      interviewPrepId,
      sessionId,
      title,
      status: 'active',
      questions: questions as any,
      currentQuestionIndex: 0,
    },
    include: {
      answers: true
    }
  })

  return {
    ...mockInterview,
    questions: questions,
    summary: undefined,
    answers: []
  }
}

/**
 * Save an interview answer with AI analysis
 */
export async function saveInterviewAnswer(
  mockInterviewId: string,
  questionId: string,
  question: string,
  answer: string,
  category: string,
  difficulty: string,
  feedback: AnswerFeedback,
  timeSpent: number,
  userId: string
): Promise<InterviewAnswerData> {
  // Resolve the mockInterviewId to actual database ID
  const resolvedId = await resolveMockInterviewId(mockInterviewId, userId)
  if (!resolvedId) {
    throw new Error('Mock interview not found')
  }

  const answerData = await prisma.interviewAnswer.create({
    data: {
      mockInterviewId: resolvedId,
      questionId,
      question,
      answer,
      category,
      difficulty,
      score: feedback.score,
      feedback: feedback as any,
      timeSpent,
      starAnalysis: feedback.starAnalysis as any
    }
  })

  return {
    ...answerData,
    feedback: feedback,
    starAnalysis: feedback.starAnalysis
  }
}

/**
 * Update mock interview progress
 */
export async function updateMockInterviewProgress(
  mockInterviewId: string,
  currentQuestionIndex: number,
  userId: string
): Promise<void> {
  // Resolve the mockInterviewId to actual database ID
  const resolvedId = await resolveMockInterviewId(mockInterviewId, userId)
  if (!resolvedId) {
    throw new Error('Mock interview not found')
  }

  await prisma.mockInterview.update({
    where: { id: resolvedId },
    data: {
      currentQuestionIndex,
      updatedAt: new Date()
    }
  })
}

/**
 * Complete a mock interview and generate summary
 */
export async function completeMockInterview(
  mockInterviewId: string,
  totalTime: number,
  summary: MockInterviewSummary,
  userId: string
): Promise<MockInterviewData> {
  // Resolve the mockInterviewId to actual database ID
  const resolvedId = await resolveMockInterviewId(mockInterviewId, userId)
  if (!resolvedId) {
    throw new Error('Mock interview not found')
  }

  const updatedInterview = await prisma.mockInterview.update({
    where: { id: resolvedId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      totalTime,
      overallScore: summary.overallScore,
      summary: summary as any,
      updatedAt: new Date()
    },
    include: {
      answers: true
    }
  })

  // Update user's progress
  await updateUserProgress(updatedInterview.userId, summary)

  return {
    ...updatedInterview,
    questions: updatedInterview.questions as PracticeQuestion[],
    summary: summary,
    answers: updatedInterview.answers.map(answer => ({
      ...answer,
      feedback: answer.feedback as AnswerFeedback,
      starAnalysis: answer.starAnalysis
    }))
  }
}

/**
 * Get mock interview with all answers
 */
export async function getMockInterview(
  mockInterviewId: string,
  userId: string
): Promise<MockInterviewData | null> {
  // First try to find by ID (ObjectId)
  let mockInterview = await prisma.mockInterview.findFirst({
    where: { id: mockInterviewId, userId },
    include: {
      answers: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  // If not found and the ID doesn't look like an ObjectId, try sessionId
  if (!mockInterview && !isValidObjectId(mockInterviewId)) {
    mockInterview = await prisma.mockInterview.findFirst({
      where: { sessionId: mockInterviewId, userId },
      include: {
        answers: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
  }

  if (!mockInterview) return null

  return {
    ...mockInterview,
    questions: mockInterview.questions as PracticeQuestion[],
    summary: mockInterview.summary as MockInterviewSummary | undefined,
    answers: mockInterview.answers.map(answer => ({
      ...answer,
      feedback: answer.feedback as AnswerFeedback,
      starAnalysis: answer.starAnalysis
    }))
  }
}

/**
 * Helper function to check if a string is a valid ObjectId
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Helper function to resolve mockInterviewId (could be database ID or sessionId) to actual database ID
 */
async function resolveMockInterviewId(mockInterviewId: string, userId: string): Promise<string | null> {
  // If it's already a valid ObjectId, return it
  if (isValidObjectId(mockInterviewId)) {
    return mockInterviewId
  }
  
  // Otherwise, try to find by sessionId
  const mockInterview = await prisma.mockInterview.findFirst({
    where: { sessionId: mockInterviewId, userId },
    select: { id: true }
  })
  
  return mockInterview?.id || null
}

/**
 * Get all mock interviews for a user
 */
export async function getUserMockInterviews(userId: string): Promise<MockInterviewData[]> {
  const interviews = await prisma.mockInterview.findMany({
    where: { userId },
    include: {
      answers: true,
      interviewPrep: {
        select: {
          companyName: true,
          jobTitle: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return interviews.map(interview => ({
    ...interview,
    questions: interview.questions as PracticeQuestion[],
    summary: interview.summary as MockInterviewSummary | undefined,
    answers: interview.answers.map(answer => ({
      ...answer,
      feedback: answer.feedback as AnswerFeedback,
      starAnalysis: answer.starAnalysis
    }))
  }))
}

/**
 * Update user's interview progress
 */
async function updateUserProgress(userId: string, summary: MockInterviewSummary): Promise<void> {
  const existingProgress = await prisma.interviewProgress.findUnique({
    where: { userId }
  })

  const currentDate = new Date()
  const weekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay())
  const weekKey = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`

  if (existingProgress) {
    // Update existing progress
    const newTotalSessions = existingProgress.totalSessions + 1
    const newTotalQuestions = existingProgress.totalQuestions + Object.keys(summary.categoryScores).length
    const newAverageScore = ((existingProgress.averageScore * existingProgress.totalSessions) + summary.overallScore) / newTotalSessions

    // Update weekly stats
    const weeklyStats = existingProgress.weeklyStats as any[] || []
    const currentWeekIndex = weeklyStats.findIndex((week: any) => week.week === weekKey)
    
    if (currentWeekIndex >= 0) {
      weeklyStats[currentWeekIndex].sessions += 1
      weeklyStats[currentWeekIndex].averageScore = ((weeklyStats[currentWeekIndex].averageScore * (weeklyStats[currentWeekIndex].sessions - 1)) + summary.overallScore) / weeklyStats[currentWeekIndex].sessions
    } else {
      weeklyStats.push({
        week: weekKey,
        sessions: 1,
        averageScore: summary.overallScore
      })
    }

    // Keep only last 8 weeks
    const sortedWeeks = weeklyStats.sort((a, b) => b.week.localeCompare(a.week)).slice(0, 8)

    // Calculate confidence score based on improvement trend
    const confidenceScore = Math.min(100, Math.max(0, 
      Math.round(newAverageScore + (sortedWeeks.length > 1 ? 
        (sortedWeeks[0].averageScore - sortedWeeks[sortedWeeks.length - 1].averageScore) : 0))
    ))

    await prisma.interviewProgress.update({
      where: { userId },
      data: {
        totalSessions: newTotalSessions,
        totalQuestions: newTotalQuestions,
        averageScore: newAverageScore,
        confidenceScore,
        strengths: summary.strengths as any,
        improvementAreas: summary.improvements as any,
        weeklyStats: sortedWeeks as any,
        lastSessionDate: currentDate,
        lastUpdated: currentDate
      }
    })
  } else {
    // Create new progress record
    await prisma.interviewProgress.create({
      data: {
        userId,
        totalSessions: 1,
        totalQuestions: Object.keys(summary.categoryScores).length,
        averageScore: summary.overallScore,
        confidenceScore: Math.min(100, Math.max(50, summary.overallScore)),
        strengths: summary.strengths as any,
        improvementAreas: summary.improvements as any,
        weeklyStats: [{
          week: weekKey,
          sessions: 1,
          averageScore: summary.overallScore
        }] as any,
        lastSessionDate: currentDate
      }
    })
  }
}

/**
 * Get user's interview progress
 */
export async function getUserInterviewProgress(userId: string): Promise<InterviewProgress | null> {
  const progress = await prisma.interviewProgress.findUnique({
    where: { userId }
  })

  if (!progress) return null

  return {
    userId: progress.userId,
    sessionsCompleted: progress.totalSessions,
    totalQuestions: progress.totalQuestions,
    averageScore: progress.averageScore,
    confidenceScore: progress.confidenceScore,
    improvementAreas: progress.improvementAreas as string[],
    strengths: progress.strengths as string[],
    lastSessionDate: progress.lastSessionDate?.toISOString() || '',
    weeklyProgress: progress.weeklyStats as Array<{
      week: string
      sessions: number
      averageScore: number
    }>
  }
}

/**
 * Delete an interview prep and all associated data
 */
export async function deleteInterviewPrep(id: string, userId: string): Promise<void> {
  // First delete all associated mock interviews and their answers
  const mockInterviews = await prisma.mockInterview.findMany({
    where: { interviewPrepId: id, userId }
  })

  for (const mockInterview of mockInterviews) {
    await prisma.interviewAnswer.deleteMany({
      where: { mockInterviewId: mockInterview.id }
    })
  }

  await prisma.mockInterview.deleteMany({
    where: { interviewPrepId: id, userId }
  })

  // Then delete the interview prep
  await prisma.interviewPrep.delete({
    where: { id }
  })
}