import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GoogleGenAI } from "@google/genai"

// Initialize Gemini client - same as tailoring service
function getGeminiClient() {
  if (typeof window === 'undefined') {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  }
  return null
}

// Validation schema for the request
const extractJobDataSchema = z.object({
  rawPageContent: z.string().min(10),
  url: z.string().url()
})

interface ExtractedJobInfo {
  title: string
  company: string
  description: string
  location?: string | null
  salary?: string | null
  jobType?: string | null
  requirements?: string[] | null
  benefits?: string | null
  isJobPosting: boolean
}

/**
 * POST /api/extract-job-data
 * Uses LLM to extract job information from raw page content
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = extractJobDataSchema.parse(body)

    console.log(`🔍 Extracting job data from page: ${validatedData.url}`)

    // Use Gemini to extract job information from raw page content
    const extractedJobInfo = await extractJobInfoWithGemini(
      validatedData.rawPageContent,
      validatedData.url
    )

    if (!extractedJobInfo.isJobPosting) {
      return NextResponse.json({
        success: false,
        error: "This page doesn't appear to contain job posting information",
        code: "NOT_A_JOB_POSTING"
      }, { status: 400 })
    }

    console.log(`✅ Job data extracted successfully: ${extractedJobInfo.title} at ${extractedJobInfo.company}`)

    return NextResponse.json({
      success: true,
      jobData: {
        title: extractedJobInfo.title,
        company: extractedJobInfo.company,
        description: extractedJobInfo.description,
        location: extractedJobInfo.location,
        salary: extractedJobInfo.salary,
        jobType: extractedJobInfo.jobType,
        requirements: extractedJobInfo.requirements,
        benefits: extractedJobInfo.benefits,
        url: validatedData.url,
        source: determineSource(validatedData.url),
        extractedAt: Date.now(),
        confidence: 1.0 // High confidence since LLM processed it
      }
    })

  } catch (error) {
    console.error("❌ POST /api/extract-job-data error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to extract job data",
        code: "EXTRACTION_FAILED"
      },
      { status: 500 }
    )
  }
}

async function extractJobInfoWithGemini(
  pageContent: string, 
  url: string
): Promise<ExtractedJobInfo> {
  try {
    const client = getGeminiClient()
    if (!client) {
      throw new Error('Gemini client not available')
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const prompt = `You are an expert at extracting job posting information from web page content. 

Analyze the following page content and extract job information if it exists:

URL: ${url}
Page Content:
${pageContent}

Instructions:
1. Determine if this page contains a job posting/listing
2. If it's a job posting, extract the following information:
   - Job title
   - Company name
   - Job description (full description, requirements, responsibilities)
   - Location (city, state/country)
   - Salary/compensation (if mentioned)
   - Job type (full-time, part-time, contract, etc.)
   - Key requirements (skills, experience, education)
   - Benefits (if mentioned)

3. If it's NOT a job posting, set isJobPosting to false

Return ONLY a valid JSON object with this exact structure:
{
  "isJobPosting": boolean,
  "title": "string",
  "company": "string", 
  "description": "string",
  "location": "string or null",
  "salary": "string or null",
  "jobType": "string or null",
  "requirements": ["array of strings or null"],
  "benefits": "string or null"
}

Important:
- Extract the COMPLETE job description including responsibilities and requirements
- Be thorough but accurate
- If information is not available, use null
- Ensure the JSON is properly formatted`

    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096
      }
    })

    // Use the same response handling as the existing service
    const responseText = result.text || ""
    
    console.log('🤖 Gemini API response:', {
      hasText: !!responseText,
      textLength: responseText.length,
      preview: responseText.substring(0, 200) + '...'
    })
    
    if (!responseText) {
      throw new Error('Empty response from Gemini API')
    }

    // Extract JSON from response - same pattern as existing service
    let extractedInfo: ExtractedJobInfo
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      // Try to extract JSON if it's wrapped in other text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse
      
      extractedInfo = JSON.parse(jsonString) as ExtractedJobInfo
      
      console.log('✅ Successfully parsed job extraction result:', {
        isJobPosting: extractedInfo.isJobPosting,
        title: extractedInfo.title,
        company: extractedInfo.company
      })
      
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError)
      console.error('📄 Raw response:', responseText)
      throw new Error('Invalid JSON response from Gemini API')
    }
    
    // Validate the response structure
    if (typeof extractedInfo.isJobPosting !== 'boolean') {
      throw new Error('Invalid LLM response structure')
    }

    return extractedInfo

  } catch (error) {
    console.error('Error extracting job info with Gemini:', error)
    
    // Return a fallback response
    return {
      isJobPosting: false,
      title: '',
      company: '',
      description: '',
      location: null,
      salary: null,
      jobType: null,
      requirements: null,
      benefits: null
    }
  }
}

function determineSource(url: string): 'linkedin' | 'indeed' | 'glassdoor' | 'company-site' | 'unknown' {
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('indeed.com')) return 'indeed'
  if (url.includes('glassdoor.com')) return 'glassdoor'
  if (url.includes('.jobs') || url.includes('/jobs') || url.includes('/careers')) return 'company-site'
  return 'unknown'
}