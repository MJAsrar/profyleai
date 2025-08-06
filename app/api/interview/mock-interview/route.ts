import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { 
  createMockInterview,
  getMockInterview,
  saveInterviewAnswer,
  updateMockInterviewProgress,
  completeMockInterview,
  getUserMockInterviews
} from '@/lib/db/interview-prep'
import { evaluateAnswer } from '@/lib/services/interview-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      const { interviewPrepId, questions } = body

      if (!interviewPrepId || !questions || !Array.isArray(questions)) {
        return NextResponse.json(
          { success: false, error: 'Interview prep ID and questions array are required' },
          { status: 400 }
        )
      }

      // Select 10 questions for the mock interview (mix of categories)
      const selectedQuestions = selectMockInterviewQuestions(questions, 10)
      const sessionId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

      const mockInterview = await createMockInterview(
        user.id,
        interviewPrepId,
        sessionId,
        selectedQuestions
      )
      
      console.log('✅ Created new mock interview session:', mockInterview.sessionId)

      return NextResponse.json({
        success: true,
        data: mockInterview
      })

    } else if (action === 'answer') {
      const { mockInterviewId, questionId, question, answer, category, difficulty, timeSpent, jobContext } = body

      if (!mockInterviewId || !questionId || !answer || !question) {
        return NextResponse.json(
          { success: false, error: 'Mock interview ID, question ID, question, and answer are required' },
          { status: 400 }
        )
      }

      console.log('🎯 Evaluating answer for mock interview question')

      // Get AI evaluation of the answer
      const evaluationResult = await evaluateAnswer(
        { id: questionId, question, category, difficulty } as any,
        answer,
        jobContext
      )

      if (!evaluationResult.success) {
        return NextResponse.json(
          { success: false, error: evaluationResult.error },
          { status: 500 }
        )
      }

      // Save the answer and feedback to database
      const savedAnswer = await saveInterviewAnswer(
        mockInterviewId,
        questionId,
        question,
        answer,
        category,
        difficulty,
        evaluationResult.data!,
        timeSpent,
        user.id
      )

      console.log('✅ Saved interview answer with score:', evaluationResult.data!.score)

      return NextResponse.json({
        success: true,
        data: {
          answer: savedAnswer,
          feedback: evaluationResult.data
        }
      })

    } else if (action === 'progress') {
      const { mockInterviewId, currentQuestionIndex } = body

      if (!mockInterviewId || currentQuestionIndex === undefined) {
        return NextResponse.json(
          { success: false, error: 'Mock interview ID and current question index are required' },
          { status: 400 }
        )
      }

      await updateMockInterviewProgress(mockInterviewId, currentQuestionIndex, user.id)

      return NextResponse.json({
        success: true,
        message: 'Progress updated'
      })

    } else if (action === 'complete') {
      const { mockInterviewId, totalTime } = body

      if (!mockInterviewId || !totalTime) {
        return NextResponse.json(
          { success: false, error: 'Mock interview ID and total time are required' },
          { status: 400 }
        )
      }

      // Get the mock interview with all answers
      const mockInterview = await getMockInterview(mockInterviewId, user.id)
      if (!mockInterview) {
        return NextResponse.json(
          { success: false, error: 'Mock interview not found' },
          { status: 404 }
        )
      }

      // Generate real summary based on actual answers
      console.log('🔍 Mock interview data for summary generation:', {
        id: mockInterview.id,
        sessionId: mockInterview.sessionId,
        answersCount: mockInterview.answers?.length || 0,
        answers: mockInterview.answers?.map(a => ({ id: a.id, score: a.score, questionId: a.questionId })) || []
      })
      const summary = generateRealMockInterviewSummary(mockInterview)

      const completedInterview = await completeMockInterview(mockInterviewId, totalTime, summary, user.id)
      
      console.log('✅ Completed mock interview with real score:', summary.overallScore)

      return NextResponse.json({
        success: true,
        data: completedInterview
      })

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "create", "answer", "progress", or "complete"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error in mock-interview API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const mockInterviewId = searchParams.get('id')

    if (mockInterviewId) {
      // Get specific mock interview
      const mockInterview = await getMockInterview(mockInterviewId, user.id)
      if (!mockInterview) {
        return NextResponse.json(
          { success: false, error: 'Mock interview not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: mockInterview
      })
    } else {
      // Get all mock interviews for user
      const mockInterviews = await getUserMockInterviews(user.id)

      return NextResponse.json({
        success: true,
        data: mockInterviews
      })
    }

  } catch (error) {
    console.error('❌ Error in get mock interviews API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Select exactly 10 questions for mock interview with specific distribution:
 * - 4 job-specific questions (exactly related to the job and its requirements)
 * - 3 field-related questions (generally about the field of the job)
 * - 3 behavioral/soft skills questions
 */
function selectMockInterviewQuestions(allQuestions: any[], count: number = 10): any[] {
  const categories = ['job-specific', 'field-related', 'behavioral']
  const difficulties = ['easy', 'medium', 'hard']
  
  // Exact distribution as requested
  const targetDistribution = {
    'job-specific': 4,     // 4 questions exactly related to job requirements
    'field-related': 3,    // 3 questions about the field/industry
    'behavioral': 3        // 3 soft skills/behavioral questions
  }

  const selected: any[] = []
  const questionsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = allQuestions.filter(q => q.category === cat)
    return acc
  }, {} as Record<string, any[]>)

  // Select questions by category with exact counts
  for (const [category, targetCount] of Object.entries(targetDistribution)) {
    const categoryQuestions = questionsByCategory[category] || []
    
    if (categoryQuestions.length === 0) {
      console.warn(`⚠️ No questions found for category: ${category}`)
      continue
    }
    
    // Mix difficulties within category
    const easyCount = Math.ceil(targetCount * 0.3)
    const mediumCount = Math.ceil(targetCount * 0.5) 
    const hardCount = targetCount - easyCount - mediumCount

    const easy = categoryQuestions.filter(q => q.difficulty === 'easy').slice(0, easyCount)
    const medium = categoryQuestions.filter(q => q.difficulty === 'medium').slice(0, mediumCount)
    const hard = categoryQuestions.filter(q => q.difficulty === 'hard').slice(0, hardCount)

    let categorySelected = [...easy, ...medium, ...hard]
    
    // If we don't have enough questions in the preferred difficulties, fill with any available
    if (categorySelected.length < targetCount) {
      const remaining = targetCount - categorySelected.length
      const unused = categoryQuestions.filter(q => !categorySelected.find(s => s.id === q.id))
      categorySelected.push(...unused.slice(0, remaining))
    }
    
    // Take exactly the target count
    selected.push(...categorySelected.slice(0, targetCount))
  }

  // If we don't have exactly 10 questions, fill with any remaining questions
  const totalSelected = selected.length
  if (totalSelected < count) {
    const remaining = count - totalSelected
    const unused = allQuestions.filter(q => !selected.find(s => s.id === q.id))
    selected.push(...unused.slice(0, remaining))
  }

  console.log(`✅ Selected mock interview questions:`, {
    'job-specific': selected.filter(q => q.category === 'job-specific').length,
    'field-related': selected.filter(q => q.category === 'field-related').length,
    'behavioral': selected.filter(q => q.category === 'behavioral').length,
    total: selected.length
  })

  // Shuffle the final selection while maintaining the exact count
  return selected.sort(() => Math.random() - 0.5).slice(0, count)
}

/**
 * Generate real summary based on actual interview answers
 */
function generateRealMockInterviewSummary(mockInterview: any): any {
  const answers = mockInterview.answers || []
  
  console.log('📊 Generating summary with answers:', {
    totalAnswers: answers.length,
    answersData: answers.map(a => ({ 
      id: a.id, 
      score: a.score, 
      questionId: a.questionId,
      hasfeedback: !!a.feedback,
      feedbackType: typeof a.feedback
    }))
  })
  
  if (answers.length === 0) {
    console.log('⚠️ No answers found, returning default summary')
    return {
      overallScore: 0,
      strengths: [],
      weaknesses: ['No answers provided'],
      improvements: ['Complete the interview to get feedback'],
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
  const overallScore = Math.round(answers.reduce((sum: number, answer: any) => sum + answer.score, 0) / answers.length)

  // Aggregate strengths and improvements
  const allStrengths = answers.flatMap((answer: any) => answer.feedback.strengths || [])
  const allImprovements = answers.flatMap((answer: any) => answer.feedback.improvements || [])

  // Count frequency and get top items
  const strengthCounts = allStrengths.reduce((acc: any, strength: string) => {
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, {})

  const improvementCounts = allImprovements.reduce((acc: any, improvement: string) => {
    acc[improvement] = (acc[improvement] || 0) + 1
    return acc
  }, {})

  const strengths = Object.entries(strengthCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([strength]) => strength)

  const improvements = Object.entries(improvementCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([improvement]) => improvement)

  // Calculate category scores
  const categoryScores: Record<string, number> = {}
  const categoryAnswers: Record<string, number[]> = {}

  answers.forEach((answer: any) => {
    if (!categoryAnswers[answer.category]) {
      categoryAnswers[answer.category] = []
    }
    categoryAnswers[answer.category].push(answer.score)
  })

  Object.entries(categoryAnswers).forEach(([category, scores]) => {
    categoryScores[category] = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  })

  // Time analysis
  const times = answers.map((answer: any) => answer.timeSpent)
  const totalTime = times.reduce((sum: number, time: number) => sum + time, 0)
  const averageTimePerQuestion = Math.round(totalTime / answers.length)

  // STAR framework analysis
  const starScores = answers.map((answer: any) => {
    const star = answer.feedback.starAnalysis || {}
    const starScore = Object.values(star).reduce((sum: number, component: any) => {
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

  // Generate weaknesses based on analysis
  const weaknesses: string[] = []
  if (overallStarUsage < 60) {
    weaknesses.push("STAR framework structure needs improvement")
  }
  if (categoryScores.behavioral && categoryScores.behavioral < 70) {
    weaknesses.push("Behavioral responses need more specific examples")
  }
  if (categoryScores.technical && categoryScores.technical < 70) {
    weaknesses.push("Technical explanations could be clearer")
  }
  if (averageTimePerQuestion > 180) {
    weaknesses.push("Responses tend to be too lengthy")
  }
  if (averageTimePerQuestion < 60) {
    weaknesses.push("Responses are too brief - add more detail")
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
      fastestQuestion: Math.min(...times),
      slowestQuestion: Math.max(...times)
    },
    starFrameworkUsage: {
      overall: overallStarUsage,
      byQuestion: starScores
    }
  }
}