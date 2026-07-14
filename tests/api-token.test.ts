import { describe, it, expect } from 'vitest'
import { generateApiToken, hashApiToken, API_TOKEN_TTL_MS } from '@/lib/api-token'

// These tests lock in the security invariants of the extension token scheme that
// replaced the old "Bearer token == user id" vulnerability.
describe('api-token', () => {
  describe('hashApiToken', () => {
    it('is deterministic and returns a 64-char hex sha256', () => {
      const h1 = hashApiToken('abc')
      const h2 = hashApiToken('abc')
      expect(h1).toBe(h2)
      expect(h1).toMatch(/^[0-9a-f]{64}$/)
    })

    it('produces different hashes for different inputs', () => {
      expect(hashApiToken('abc')).not.toBe(hashApiToken('abd'))
    })
  })

  describe('generateApiToken', () => {
    it('returns a 64-char hex raw secret whose hash matches hashApiToken', () => {
      const { raw, hash } = generateApiToken()
      expect(raw).toMatch(/^[0-9a-f]{64}$/)
      expect(hash).toBe(hashApiToken(raw))
    })

    it('never stores the raw token (hash != raw)', () => {
      const { raw, hash } = generateApiToken()
      expect(hash).not.toBe(raw)
    })

    it('sets an expiry ~30 days in the future', () => {
      const before = Date.now()
      const { expiresAt } = generateApiToken()
      const delta = expiresAt.getTime() - before
      expect(delta).toBeGreaterThan(API_TOKEN_TTL_MS - 5000)
      expect(delta).toBeLessThanOrEqual(API_TOKEN_TTL_MS + 5000)
    })

    it('produces a unique token each call (high entropy)', () => {
      const tokens = new Set(Array.from({ length: 100 }, () => generateApiToken().raw))
      expect(tokens.size).toBe(100)
    })

    it('SECURITY: the token is not a guessable Mongo ObjectId (>= 40 chars vs 24)', () => {
      // A Mongo ObjectId is 24 hex chars. The old scheme accepted the user id as a
      // token; the new token is far longer and random, so an id can never be a token.
      const mongoObjectId = 'a'.repeat(24)
      const { raw } = generateApiToken()
      expect(raw.length).toBeGreaterThanOrEqual(40)
      expect(raw).not.toBe(mongoObjectId)
    })
  })
})
