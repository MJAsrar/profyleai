import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { CreditTransactionType } from "@prisma/client"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists using raw MongoDB
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and initial credit transaction in a single transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create user (credits default to 50 from schema)
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          }
        })

        // Create initial credit transaction for signup bonus
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            type: CreditTransactionType.EARNED_SIGNUP,
            amount: 50, // Signup bonus
            description: "Welcome Bonus",
            balanceBefore: 0,
            balanceAfter: 50,
            metadata: {
              timestamp: new Date().toISOString(),
              signupMethod: "email",
              userAgent: req.headers.get("user-agent") || "unknown",
            }
          }
        })

        return user
      })

      // Return user without password
      const { password: _, ...userWithoutPassword } = result

      return NextResponse.json(
        { 
          user: userWithoutPassword, 
          message: "User created successfully",
          credits: 50 // Let the frontend know about initial credits
        },
        { status: 201 }
      )
    } catch (prismaError: any) {
      // If Prisma fails with transaction error, try direct MongoDB operation
      if (prismaError.code === 'P2031') {
        console.log("Falling back to direct MongoDB insert due to transaction error")
        
        try {
          // Use direct MongoDB insert without transactions for user
          const userResult = await prisma.$runCommandRaw({
            insert: "User",
            documents: [{
              name,
              email,
              password: hashedPassword,
              subscriptionTier: "FREE",
              credits: 50,
              totalCreditsEarned: 50,
              totalCreditsSpent: 0,
              lastCreditUpdate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }]
          })
          
          // Get the created user ID
          const insertedId = userResult.insertedIds?.[0]
          
          if (insertedId) {
            // Create initial credit transaction
            await prisma.$runCommandRaw({
              insert: "CreditTransaction",
              documents: [{
                userId: insertedId,
                type: "EARNED_SIGNUP",
                amount: 50,
                description: "Welcome Bonus",
                balanceBefore: 0,
                balanceAfter: 50,
                isReversed: false,
                metadata: {
                  timestamp: new Date().toISOString(),
                  signupMethod: "email",
                  userAgent: req.headers.get("user-agent") || "unknown",
                },
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            })
          }

          return NextResponse.json(
            { 
              message: "User created successfully (fallback method)",
              credits: 50
            },
            { status: 201 }
          )
        } catch (fallbackError) {
          console.error("Fallback user creation failed:", fallbackError)
          throw fallbackError
        }
      }
      throw prismaError
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}