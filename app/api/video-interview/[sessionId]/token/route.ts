import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, createAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { creditService } from '@/lib/services/credit-service'
import { rateLimit, rateLimitKey, rateLimitResponse } from '@/lib/rate-limit'

interface RouteParams {
  params: Promise<{ sessionId: string }>
}

/**
 * POST /api/video-interview/[sessionId]/token
 *
 * Issues a short-lived ElevenLabs signed URL for a realtime interview.
 *
 * This is the gate for the expensive resource. Previously the browser connected to
 * the agent using only the public agentId, so anyone could extract it and run
 * unlimited voice sessions for free — the 50-credit charge protected nothing but a
 * database row. Now the connection requires a server-minted token, and that token is
 * only issued to the session's owner, after credits are actually taken.
 *
 * Credits are charged HERE rather than at record creation, so a session that never
 * starts is never billed; if the token cannot be minted, the charge is refunded.
 *
 * NOTE: this only fully closes the hole if the ElevenLabs agent is set to PRIVATE in
 * the ElevenLabs dashboard. A public agent remains reachable with the agentId alone.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  let chargedTransactionId: string | null = null
  let claimedInterviewId: string | null = null

  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return createAuthError()
    }

    const limit = rateLimit(rateLimitKey(request, 'vi-token', user.id), 10, 60_000)
    if (!limit.ok) {
      return rateLimitResponse(limit) as NextResponse
    }

    const { sessionId } = await params

    const agentId = process.env.ELEVENLABS_AGENT_ID
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!agentId || !apiKey) {
      console.error('ElevenLabs server credentials are not configured')
      return NextResponse.json(
        { success: false, error: 'Voice interviews are not configured' },
        { status: 503 }
      )
    }

    // Ownership: scoped by userId so one user cannot start another user's interview.
    const interview = await prisma.videoInterview.findFirst({
      where: { sessionId, userId: user.id },
      select: { id: true, status: true },
    })

    if (!interview) {
      return NextResponse.json(
        { success: false, error: 'Interview session not found' },
        { status: 404 }
      )
    }

    if (interview.status === 'completed' || interview.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: `Interview is already ${interview.status}` },
        { status: 409 }
      )
    }

    // Claim the session atomically. Only the first caller flips scheduled -> active,
    // so reconnecting to an already-active session does not charge again.
    const claimed = await prisma.videoInterview.updateMany({
      where: { id: interview.id, status: 'scheduled' },
      data: { status: 'active', startedAt: new Date() },
    })

    const isFirstStart = claimed.count === 1

    if (isFirstStart) {
      claimedInterviewId = interview.id
      try {
        const transaction = await creditService.spendCredits(
          user.id,
          'VIDEO_INTERVIEW',
          interview.id,
          { sessionId }
        )
        chargedTransactionId = transaction.id
        await prisma.videoInterview.update({
          where: { id: interview.id },
          data: { creditTransactionId: transaction.id },
        })
      } catch (error) {
        // Could not take payment — release the claim so the user can retry later.
        await prisma.videoInterview.updateMany({
          where: { id: interview.id, status: 'active' },
          data: { status: 'scheduled', startedAt: null },
        })
        console.error('Credit charge failed for video interview:', error)
        return NextResponse.json(
          { success: false, error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
          { status: 402 }
        )
      }
    }

    // Mint the short-lived signed URL with the SERVER-ONLY key.
    const signedUrl = await mintSignedUrl(agentId, apiKey)

    return NextResponse.json({
      success: true,
      data: { signedUrl, charged: isFirstStart },
    })

  } catch (error) {
    console.error('❌ Failed to issue video-interview token:', error)

    // The user paid but cannot start — give the credits back and release the claim.
    if (chargedTransactionId && claimedInterviewId) {
      try {
        const owner = await prisma.videoInterview.findUnique({
          where: { id: claimedInterviewId },
          select: { userId: true },
        })
        if (owner) {
          await creditService.refundCredits(
            owner.userId,
            chargedTransactionId,
            'Voice session could not be started'
          )
        }
        await prisma.videoInterview.updateMany({
          where: { id: claimedInterviewId, status: 'active' },
          data: { status: 'scheduled', startedAt: null, creditTransactionId: null },
        })
      } catch (refundError) {
        console.error(
          `CREDIT REFUND FAILED — user was charged for a voice session that never started (tx ${chargedTransactionId})`,
          refundError
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Could not start the voice session' },
      { status: 502 }
    )
  }
}

/** Ask ElevenLabs for a short-lived signed WebSocket URL for this agent. */
async function mintSignedUrl(agentId: string, apiKey: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey }, signal: controller.signal }
    )

    if (!res.ok) {
      throw new Error(`ElevenLabs signed-url request failed: ${res.status} ${await res.text()}`)
    }

    const data = (await res.json()) as { signed_url?: string }
    if (!data.signed_url) {
      throw new Error('ElevenLabs did not return a signed_url')
    }

    return data.signed_url
  } finally {
    clearTimeout(timeout)
  }
}
