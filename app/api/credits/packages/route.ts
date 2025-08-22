/**
 * Credit Packages API
 * 
 * GET /api/credits/packages - Get available credit packages for purchase
 */

import { NextRequest, NextResponse } from "next/server"
import { CREDIT_PACKAGES } from "@/lib/types/credits"

export async function GET(req: NextRequest) {
  try {
    // Return available credit packages
    const packages = Object.values(CREDIT_PACKAGES).map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      creditsPerDollar: pkg.creditsPerDollar,
      bonusPercentage: pkg.bonusPercentage,
      description: pkg.description,
      popular: pkg.popular,
      // Calculate savings vs base rate
      savings: pkg.bonusPercentage > 0 ? {
        percentage: pkg.bonusPercentage,
        bonusCredits: pkg.credits - Math.floor(pkg.price * 10), // 10 credits per dollar is base
        dollarsOff: (pkg.credits - Math.floor(pkg.price * 10)) * 0.1, // Value of bonus credits
      } : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        packages,
        baseCreditValue: 0.10, // $0.10 per credit base rate
        currency: "USD"
      }
    })

  } catch (error) {
    console.error("Error getting credit packages:", error)
    return NextResponse.json(
      { error: "Failed to get credit packages" },
      { status: 500 }
    )
  }
}
