import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        resumes: {
          include: {
            template: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        coverLetters: {
          include: {
            template: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        interviewPreps: {
          include: {
            mockInterviews: true,
            videoInterviews: true
          }
        },
        accounts: {
          select: {
            provider: true,
            type: true
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const exportData = {
      profile: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        subscriptionTier: userData.subscriptionTier,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      resumes: userData.resumes.map(resume => ({
        id: resume.id,
        title: resume.title,
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        certifications: resume.certifications,
        template: resume.template,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      })),
      coverLetters: userData.coverLetters.map(letter => ({
        id: letter.id,
        title: letter.title,
        jobDetails: letter.jobDetails,
        personalInfo: letter.personalInfo,
        content: letter.content,
        tone: letter.tone,
        template: letter.template,
        createdAt: letter.createdAt,
        updatedAt: letter.updatedAt
      })),
      interviews: userData.interviewPreps.map(prep => ({
        id: prep.id,
        title: prep.title,
        companyName: prep.companyName,
        jobTitle: prep.jobTitle,
        jobDescription: prep.jobDescription,
        industry: prep.industry,
        experienceLevel: prep.experienceLevel,
        questions: prep.questions,
        createdAt: prep.createdAt,
        updatedAt: prep.updatedAt,
        mockInterviews: prep.mockInterviews.length,
        videoInterviews: prep.videoInterviews.length
      })),
      connectedAccounts: userData.accounts,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }

    // Create JSON response
    const jsonData = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="profyle-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
