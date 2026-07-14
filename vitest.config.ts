import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => ({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    // Load .env so integration tests can reach the database. Tests that need a DB
    // skip themselves when DATABASE_URL is absent, so this stays safe in CI.
    env: loadEnv(mode ?? 'test', process.cwd(), ''),
    // The credit integration test is an ordered sequence against shared rows.
    fileParallelism: false,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
}))
