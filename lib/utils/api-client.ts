/**
 * API Client with Credit Update Detection
 * 
 * Enhanced fetch wrapper that automatically detects credit balance changes
 * and triggers UI updates
 */

import { triggerCreditUpdate } from './credit-events'

/**
 * Enhanced fetch that automatically handles credit updates
 */
export async function apiCall(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options)
  
  // Check for credit update headers
  const creditBalanceUpdated = response.headers.get('X-Credit-Balance-Updated')
  const creditsSpent = response.headers.get('X-Credits-Spent')
  
  if (creditBalanceUpdated) {
    // Trigger credit update event for all components
    triggerCreditUpdate()
    
    // Optional: Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Credits updated: ${creditsSpent} spent, new balance: ${creditBalanceUpdated}`)
    }
  }
  
  return response
}

/**
 * Convenience wrapper for JSON API calls with credit update detection
 */
export async function apiCallJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await apiCall(url, options)
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * POST request with credit update detection
 */
export async function apiPost<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
  return apiCallJson<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  })
}

/**
 * GET request with credit update detection
 */
export async function apiGet<T = any>(url: string, options?: RequestInit): Promise<T> {
  return apiCallJson<T>(url, {
    method: 'GET',
    ...options,
  })
}

/**
 * PUT request with credit update detection
 */
export async function apiPut<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
  return apiCallJson<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  })
}

/**
 * DELETE request with credit update detection
 */
export async function apiDelete<T = any>(url: string, options?: RequestInit): Promise<T> {
  return apiCallJson<T>(url, {
    method: 'DELETE',
    ...options,
  })
}
