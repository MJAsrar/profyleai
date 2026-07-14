import { describe, it, expect } from 'vitest'
import {
  CREDIT_COSTS,
  calculateTotalCredits,
  isCreditAction,
  isCreditPackageId,
  suggestPackageForCredits,
  CREDIT_PACKAGES,
} from '@/lib/types/credits'

describe('credit costs & helpers', () => {
  it('prices each action with a positive integer cost', () => {
    for (const [action, cost] of Object.entries(CREDIT_COSTS)) {
      expect(cost, action).toBeGreaterThan(0)
      expect(Number.isInteger(cost), action).toBe(true)
    }
  })

  describe('calculateTotalCredits', () => {
    it('sums the cost of multiple actions', () => {
      const total = calculateTotalCredits(['RESUME_TAILORING', 'COVER_LETTER'])
      expect(total).toBe(CREDIT_COSTS.RESUME_TAILORING + CREDIT_COSTS.COVER_LETTER)
    })

    it('returns 0 for no actions', () => {
      expect(calculateTotalCredits([])).toBe(0)
    })
  })

  describe('isCreditAction', () => {
    it('accepts known actions and rejects unknown ones', () => {
      expect(isCreditAction('VIDEO_INTERVIEW')).toBe(true)
      expect(isCreditAction('NOT_A_REAL_ACTION')).toBe(false)
    })
  })

  describe('isCreditPackageId', () => {
    it('rejects an obviously invalid package id', () => {
      expect(isCreditPackageId('definitely_not_a_package')).toBe(false)
    })

    it('accepts every real package id', () => {
      for (const id of Object.keys(CREDIT_PACKAGES)) {
        expect(isCreditPackageId(id)).toBe(true)
      }
    })
  })

  describe('suggestPackageForCredits', () => {
    it('returns the smallest package that covers the need', () => {
      const pkg = suggestPackageForCredits(1)
      expect(pkg).not.toBeNull()
      expect(pkg!.credits).toBeGreaterThanOrEqual(1)
      // No smaller package should also have been sufficient.
      const smaller = Object.values(CREDIT_PACKAGES).filter(p => p.credits >= 1 && p.credits < pkg!.credits)
      expect(smaller.length).toBe(0)
    })

    it('falls back to the largest package when none is sufficient', () => {
      const huge = 1_000_000
      const pkg = suggestPackageForCredits(huge)
      const maxCredits = Math.max(...Object.values(CREDIT_PACKAGES).map(p => p.credits))
      expect(pkg).not.toBeNull()
      expect(pkg!.credits).toBe(maxCredits)
    })
  })
})
