import { randomBytes, createHash } from "crypto"

/**
 * Opaque API-token helpers for the browser extension.
 *
 * A token is a 256-bit random secret (NOT the user id). Only its SHA-256 hash is
 * ever stored, and it carries an expiry. This module has no framework/db imports
 * so it stays trivially unit-testable.
 */

/** How long an issued extension API token stays valid. */
export const API_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

/** Hash a raw token for storage/lookup. */
export function hashApiToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}

/**
 * Mint a new opaque bearer token.
 * Returns the RAW token (shown to the client once), its hash to persist, and expiry.
 */
export function generateApiToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = randomBytes(32).toString("hex")
  return {
    raw,
    hash: hashApiToken(raw),
    expiresAt: new Date(Date.now() + API_TOKEN_TTL_MS),
  }
}
