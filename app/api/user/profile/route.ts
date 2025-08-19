import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        // Add custom profile fields if they exist in your schema
        // bio: true,
        // location: true,
        // website: true,
        // linkedin: true,
        // github: true,
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, bio, location, website, linkedin, github } = body

    // Validate input
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        // Add other fields if they exist in your schema
        // bio: bio || undefined,
        // location: location || undefined,
        // website: website || undefined,
        // linkedin: linkedin || undefined,
        // github: github || undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
