/**
 * Credit Event Utilities
 * 
 * Utilities for triggering real-time credit balance updates across the application
 */

/**
 * Trigger a credit update event to refresh all credit balance components
 */
export function triggerCreditUpdate(): void {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('credit-updated', {
      detail: { timestamp: Date.now() }
    })
    window.dispatchEvent(event)
  }
}

/**
 * Trigger credit update with specific balance information
 */
export function triggerCreditUpdateWithBalance(newBalance: number): void {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('credit-updated', {
      detail: { 
        timestamp: Date.now(),
        newBalance 
      }
    })
    window.dispatchEvent(event)
  }
}

/**
 * Listen for credit updates (for components that need custom handling)
 */
export function onCreditUpdate(callback: (detail?: any) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {} // No-op for SSR
  }

  const handleUpdate = (event: CustomEvent) => {
    callback(event.detail)
  }

  window.addEventListener('credit-updated', handleUpdate as EventListener)
  
  return () => {
    window.removeEventListener('credit-updated', handleUpdate as EventListener)
  }
}
