import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use a transaction to ensure all data is deleted atomically
    await prisma.$transaction(async (tx) => {
      // Delete user's data in the correct order (due to foreign key constraints)
      
      // Delete video interview analytics first
      await tx.videoInterviewAnalytics.deleteMany({
        where: {
          videoInterview: {
            userId: user.id
          }
        }
      })

      // Delete video interview responses
      await tx.videoInterviewResponse.deleteMany({
        where: {
          videoInterview: {
            userId: user.id
          }
        }
      })

      // Delete interview answers
      await tx.interviewAnswer.deleteMany({
        where: {
          mockInterview: {
            userId: user.id
          }
        }
      })

      // Delete mock interviews
      await tx.mockInterview.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete video interviews
      await tx.videoInterview.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete interview preps
      await tx.interviewPrep.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete tailored resumes
      await tx.tailoredResume.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete cover letters
      await tx.coverLetter.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete resumes
      await tx.resume.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete interview progress
      await tx.interviewProgress.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete sessions
      await tx.session.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Delete accounts
      await tx.account.deleteMany({
        where: {
          userId: user.id
        }
      })

      // Finally, delete the user
      await tx.user.delete({
        where: {
          id: user.id
        }
      })
    })

    return NextResponse.json({ 
      success: true, 
      message: "Account and all associated data have been permanently deleted" 
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
