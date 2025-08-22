/**
 * Credit Purchase API
 * 
 * POST /api/credits/purchase - Initiate credit purchase with Stripe
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { creditService } from "@/lib/services/credit-service"
import { createCreditPurchaseIntent } from "@/lib/services/stripe-service"
import { z } from "zod"
import { 
  CreditPackageId, 
  isCreditPackageId, 
  CREDIT_PACKAGES,
  CreditErrorType 
} from "@/lib/types/credits"

const purchaseSchema = z.object({
  packageId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const { packageId, successUrl, cancelUrl } = purchaseSchema.parse(body)

    // Validate package ID
    if (!isCreditPackageId(packageId)) {
      return NextResponse.json(
        { error: "Invalid package ID" },
        { status: 400 }
      )
    }

    const package_ = CREDIT_PACKAGES[packageId as CreditPackageId]

    // Create purchase record in database
    const purchaseRecord = await creditService.initiateCreditPurchase(
      session.user.id,
      packageId as CreditPackageId
    )

    // Create Stripe payment intent
    const paymentIntent = await createCreditPurchaseIntent(
      packageId as CreditPackageId,
      session.user.id,
      purchaseRecord.purchaseId,
      {
        userEmail: session.user.email || "",
        userName: session.user.name || "",
        successUrl: successUrl || "",
        cancelUrl: cancelUrl || "",
      }
    )

    // Update purchase record with Stripe payment intent ID
    await creditService.updatePurchaseRecord(
      purchaseRecord.purchaseId,
      paymentIntent.id
    )

    return NextResponse.json({
      success: true,
      data: {
        purchaseId: purchaseRecord.purchaseId,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: package_.price,
        credits: package_.credits,
        packageName: package_.name,
      }
    })

  } catch (error) {
    console.error("Error creating credit purchase:", error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Handle specific credit errors
    if (error && typeof error === 'object' && 'type' in error) {
      const creditError = error as { type: CreditErrorType; message: string }
      
      if (creditError.type === CreditErrorType.PACKAGE_NOT_FOUND) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        )
      }
      
      if (creditError.type === CreditErrorType.USER_NOT_FOUND) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to create credit purchase" },
      { status: 500 }
    )
  }
}
