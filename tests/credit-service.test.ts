import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { creditService } from '@/lib/services/credit-service'

/**
 * Integration tests for the money path, against a real database.
 *
 * These cover the invariants that, if broken, cost real money: double-crediting a
 * duplicate webhook, overspending under concurrency, and letting a refunded customer
 * keep their credits. They are skipped automatically when DATABASE_URL is absent, so
 * `vitest` still runs clean in environments without a database.
 */

const prisma = new PrismaClient()
const hasDb = !!process.env.DATABASE_URL

const CREDITS = 100
const SPEND_COST = 50 // VIDEO_INTERVIEW

const balanceOf = async (id: string) =>
  (await prisma.user.findUnique({ where: { id }, select: { credits: true } }))!.credits

describe.skipIf(!hasDb)('credit service (integration)', () => {
  let userId: string
  let purchaseId: string

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `credit-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`,
        name: 'Credit Test',
        credits: 0,
        totalCreditsEarned: 0,
      },
    })
    userId = user.id

    const purchase = await prisma.creditPurchase.create({
      data: {
        userId,
        packageType: 'starter',
        creditsAmount: CREDITS,
        dollarAmount: 10,
        creditsPerDollar: 10,
        paymentProvider: 'stripe',
        checkoutSessionId: `cs_test_${Date.now()}`,
        status: 'PENDING',
      },
    })
    purchaseId = purchase.id
  })

  afterAll(async () => {
    if (userId) {
      await prisma.creditTransaction.deleteMany({ where: { userId } })
      await prisma.creditPurchase.deleteMany({ where: { userId } })
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  it('grants credits when a purchase completes', async () => {
    await creditService.completeCreditPurchase(purchaseId, 'pi_test')

    expect(await balanceOf(userId)).toBe(CREDITS)

    const purchase = await prisma.creditPurchase.findUnique({ where: { id: purchaseId } })
    expect(purchase?.status).toBe('COMPLETED')

    const earned = await prisma.creditTransaction.count({
      where: { userId, type: 'EARNED_PURCHASE' },
    })
    expect(earned).toBe(1)
  })

  it('does NOT double-credit a duplicate webhook delivery', async () => {
    // Stripe delivers at-least-once; completing twice must not pay out twice.
    await expect(creditService.completeCreditPurchase(purchaseId, 'pi_test')).rejects.toBeDefined()
    expect(await balanceOf(userId)).toBe(CREDITS)
  })

  it('cannot be overspent by concurrent requests', async () => {
    // 100 credits, 50 per spend => exactly two of five racers may win. The rest must
    // lose cleanly, and the balance must never go negative.
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => creditService.spendCredits(userId, 'VIDEO_INTERVIEW'))
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    expect(succeeded).toBe(CREDITS / SPEND_COST)

    const balance = await balanceOf(userId)
    expect(balance).toBe(0)
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  it('claws credits back when the payment is refunded', async () => {
    // Top up so there is something to reclaim, then refund the original purchase.
    await creditService.addCredits(userId, CREDITS, 'EARNED_ADMIN')
    const before = await balanceOf(userId)

    await creditService.clawbackPurchase(purchaseId, 'Payment refunded (test)')

    expect(await balanceOf(userId)).toBe(before - CREDITS)

    const purchase = await prisma.creditPurchase.findUnique({ where: { id: purchaseId } })
    expect(purchase?.status).toBe('REFUNDED')

    const clawbacks = await prisma.creditTransaction.count({
      where: { userId, type: 'CLAWBACK_REFUND' },
    })
    expect(clawbacks).toBe(1)
  })

  it('treats a duplicate refund event as a no-op', async () => {
    const before = await balanceOf(userId)
    await creditService.clawbackPurchase(purchaseId, 'Payment refunded (duplicate)')
    expect(await balanceOf(userId)).toBe(before)
  })

  it('keeps the ledger reconciled with the balance', async () => {
    const txs = await prisma.creditTransaction.findMany({ where: { userId } })
    const ledgerSum = txs.reduce((sum, t) => sum + t.amount, 0)
    expect(ledgerSum).toBe(await balanceOf(userId))
  })
})
