import { defineConfig } from 'vitest/config'
import fs from 'fs'
import path from 'path'

/**
 * Load .env for tests.
 *
 * Deliberately does NOT use vite's `loadEnv`: `vite` is only a transitive dependency
 * of vitest, so importing it directly resolves locally but fails in the production
 * build (where this file is type-checked under a stricter module layout).
 */
function loadDotEnv(): Record<string, string> {
  const envPath = path.resolve(__dirname, '.env')
  if (!fs.existsSync(envPath)) return {}

  const env: Record<string, string> = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!match || line.trim().startsWith('#')) continue

    let value = (match[2] ?? '').trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[match[1]] = value
  }
  return env
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    // Integration tests need DATABASE_URL. Tests that require a database skip
    // themselves when it is absent, so this stays safe in CI.
    env: loadDotEnv(),
    // The credit integration test is an ordered sequence against shared rows.
    fileParallelism: false,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
