import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

    // Create user with $db.runCommandRaw to bypass transaction requirement
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      })

      // Return user without password
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json(
        { user: userWithoutPassword, message: "User created successfully" },
        { status: 201 }
      )
    } catch (prismaError: any) {
      // If Prisma fails with transaction error, try direct MongoDB operation
      if (prismaError.code === 'P2031') {
        console.log("Falling back to direct MongoDB insert due to transaction error")
        
        // Use direct MongoDB insert without transactions
        const result = await prisma.$runCommandRaw({
          insert: "User",
          documents: [{
            name,
            email,
            password: hashedPassword,
            subscriptionTier: "FREE",
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        })

        return NextResponse.json(
          { message: "User created successfully (fallback method)" },
          { status: 201 }
        )
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