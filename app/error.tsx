'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCw } from 'lucide-react'

/**
 * Route-level error boundary. Without this, an unhandled render error anywhere in
 * the app showed Next's raw error screen instead of anything recoverable.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Replace with a real error reporter (Sentry et al.) when one is wired up.
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground">
            That page didn&apos;t load. Nothing you were working on has been lost — try again,
            and if it keeps happening, let us know.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/70 font-mono pt-2">
              Reference: {error.digest}
            </p>
          )}
        </div>

        <Button onClick={reset} className="w-full">
          <RotateCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  )
}
