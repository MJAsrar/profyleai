import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"

// Since preferences aren't in the current schema, we'll store them in localStorage on the client
// But we can provide a basic API structure for future database storage

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return default preferences for now
    // In the future, these could be stored in the database
    const defaultPreferences = {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      autoSave: true,
      notifications: {
        email: true,
        push: true,
        sound: false
      },
      resume: {
        defaultTemplate: 'modern',
        autoOptimize: true,
        showTips: true
      },
      privacy: {
        analytics: true,
        crashReports: true
      }
    }

    return NextResponse.json(defaultPreferences)
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await req.json()
    
    // Validate preferences structure
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: "Invalid preferences data" }, { status: 400 })
    }

    // In the future, save to database
    // For now, just return success
    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error("Error saving preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
