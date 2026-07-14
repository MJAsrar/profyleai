/**
 * Stripe Webhook Handler
 * 
 * POST /api/credits/webhooks/stripe - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature, processWebhookEvent } from "@/lib/services/stripe-service"

export async function POST(req: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      )
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET environment variable not set")
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 }
      )
    }

    // Get raw body
    const payload = await req.text()

    // Verify webhook signature and construct event
    const event = verifyWebhookSignature(payload, signature, webhookSecret)

    // Process the webhook event
    const result = await processWebhookEvent(event)

    if (result.processed) {
      console.log(`Successfully processed webhook event: ${event.type}`)
      return NextResponse.json({
        received: true,
        message: result.message
      })
    }

    if (result.retryable) {
      // A handled event failed transiently (e.g. DB down). Return 5xx so Stripe
      // retries with backoff — otherwise the customer is charged but never credited.
      console.error(`Retryable failure processing webhook event: ${event.type} - ${result.message}`)
      return NextResponse.json({
        received: false,
        message: result.message
      }, { status: 500 })
    }

    // Permanent / unhandled event (bad metadata, event type we don't act on):
    // acknowledge with 200 so Stripe stops retrying.
    console.warn(`Not processed (no retry): ${event.type} - ${result.message}`)
    return NextResponse.json({
      received: true,
      message: result.message
    }, { status: 200 })

  } catch (error) {
    console.error("Webhook error:", error)
    
    // Return 400 for signature verification errors
    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      )
    }

    // Return 500 for other errors
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
