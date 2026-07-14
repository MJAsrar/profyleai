'use client'

import { useEffect } from 'react'

/**
 * Last-resort boundary: catches errors thrown in the root layout itself, which
 * app/error.tsx cannot. Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Fatal application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1.5rem',
          margin: 0,
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            The app failed to load. Please reload the page.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #ddd',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
