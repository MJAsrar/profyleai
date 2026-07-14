/**
 * Credit Middleware
 * 
 * This middleware provides credit validation and enforcement for API routes.
 * It ensures users have sufficient credits before performing expensive operations
 * and provides consistent error handling across the application.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { creditService } from "@/lib/services/credit-service"
import {
  CreditAction,
  CreditErrorType,
  InsufficientCreditsError,
  CreditMiddlewareOptions,
  CREDIT_COSTS,
  isCreditAction,
} from "@/lib/types/credits"

// =============================================================================
// MIDDLEWARE TYPES
// =============================================================================

/**
 * Enhanced request with credit context
 */
export interface CreditRequest extends NextRequest {
  user?: {
    id: string
    email?: string
    name?: string
  }
  creditContext?: {
    action: CreditAction
    cost: number
    balance: number
    hasEnoughCredits: boolean
  }
}

/**
 * API route handler type with credit context
 */
export type CreditRouteHandler = (
  req: CreditRequest,
  context: { params?: any }
) => Promise<NextResponse>

/**
 * Credit middleware result
 */
type CreditMiddlewareResult = {
  success: true
  user: { id: string; email?: string; name?: string }
  creditContext: {
    action: CreditAction
    cost: number
    balance: number
    hasEnoughCredits: boolean
  }
} | {
  success: false
  response: NextResponse
}

// =============================================================================
// CORE MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Higher-order function that creates credit validation middleware for API routes
 * 
 * Usage:
 * ```typescript
 * export const POST = withCreditCheck('VIDEO_INTERVIEW')(async (req, context) => {
 *   // Your route logic here - credits are automatically validated
 *   // and deducted after successful operation
 * })
 * ```
 */
export function withCreditCheck(
  action: CreditAction,
  options: Partial<CreditMiddlewareOptions> = {}
) {
  return function middleware(handler: CreditRouteHandler) {
    return async function wrappedHandler(
      req: NextRequest,
      // Shape must satisfy Next 15's RouteContext (params is a required Promise),
      // otherwise the generated route type validator rejects the exported handler.
      context: { params: Promise<any> }
    ): Promise<NextResponse> {
      try {
        // Validate and enrich request with credit context
        const middlewareResult = await validateCreditsMiddleware(req, action, options)
        
        if (!middlewareResult.success) {
          return middlewareResult.response
        }
        
        // Add credit context to request
        const creditRequest = req as CreditRequest
        creditRequest.user = middlewareResult.user
        creditRequest.creditContext = middlewareResult.creditContext
        
        // If insufficient credits and not skipping on insufficient, return error
        if (!middlewareResult.creditContext.hasEnoughCredits && !options.skipOnInsufficientCredits) {
          return createInsufficientCreditsResponse(
            middlewareResult.creditContext.balance,
            middlewareResult.creditContext.cost,
            action
          )
        }
        
        // Execute the actual route handler
        const response = await handler(creditRequest, context)
        
        // If operation was successful (2xx status) and user had enough credits, deduct them
        if (
          response.status >= 200 && 
          response.status < 300 && 
          middlewareResult.creditContext.hasEnoughCredits
        ) {
          try {
            // Extract reference ID from response if available
            const responseData = await response.clone().json().catch(() => ({}))
            const referenceId = responseData.id || responseData.sessionId || responseData.resumeId
            
            // Spend credits after successful operation
            const transaction = await creditService.spendCredits(
              middlewareResult.user.id,
              action,
              referenceId,
              options.metadata
            )

            // Add credit update header to trigger frontend refresh
            response.headers.set('X-Credit-Balance-Updated', transaction.balanceAfter.toString())
            response.headers.set('X-Credits-Spent', Math.abs(transaction.amount).toString())
            
          } catch (error) {
            console.error('Failed to deduct credits after successful operation:', error)
            // Continue with response - don't fail the operation due to credit deduction issues
          }
        }
        
        return response
        
      } catch (error) {
        console.error('Credit middleware error:', error)
        return NextResponse.json(
          { 
            error: 'credit_middleware_error',
            message: 'Failed to validate credits'
          },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Simple credit check middleware that only validates but doesn't deduct credits
 * Useful for read-only operations that still need credit awareness
 */
export function withCreditValidation(action: CreditAction) {
  return withCreditCheck(action, { skipOnInsufficientCredits: true })
}

/**
 * Middleware for operations that require exact credit balance (no more, no less)
 */
export function withExactCreditCheck(action: CreditAction) {
  return withCreditCheck(action, { requireExactBalance: true })
}

// =============================================================================
// CORE VALIDATION LOGIC
// =============================================================================

/**
 * Core middleware validation logic
 */
async function validateCreditsMiddleware(
  req: NextRequest,
  action: CreditAction,
  options: Partial<CreditMiddlewareOptions>
): Promise<CreditMiddlewareResult> {
  // Validate action
  if (!isCreditAction(action)) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: CreditErrorType.INVALID_ACTION,
          message: `Invalid credit action: ${action}`
        },
        { status: 400 }
      )
    }
  }
  
  // Get user session
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Authentication required'
        },
        { status: 401 }
      )
    }
  }
  
  const user = {
    id: session.user.id,
    email: session.user.email ?? undefined,
    name: session.user.name ?? undefined,
  }
  
  try {
    // Get user's credit balance and check if they have enough
    const balance = await creditService.getCreditBalance(user.id)
    const cost = CREDIT_COSTS[action]
    const hasEnoughCredits = balance >= cost
    
    // Check for exact balance requirement
    if (options.requireExactBalance && balance !== cost) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: CreditErrorType.INSUFFICIENT_CREDITS,
            message: `Exact balance required. You have ${balance} credits but need exactly ${cost}.`,
            currentBalance: balance,
            requiredCredits: cost,
          },
          { status: 402 }
        )
      }
    }
    
    return {
      success: true,
      user,
      creditContext: {
        action,
        cost,
        balance,
        hasEnoughCredits,
      }
    }
    
  } catch (error) {
    console.error('Error checking credits:', error)
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: CreditErrorType.TRANSACTION_FAILED,
          message: 'Failed to check credit balance'
        },
        { status: 500 }
      )
    }
  }
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create standardized insufficient credits response
 */
function createInsufficientCreditsResponse(
  currentBalance: number,
  requiredCredits: number,
  action: CreditAction
): NextResponse {
  const shortfall = requiredCredits - currentBalance
  
  // Find the smallest package that covers the shortfall
  const suggestedPackage = Object.values(CREDIT_PACKAGES).find(
    pkg => pkg.credits >= shortfall
  ) || Object.values(CREDIT_PACKAGES)[0]
  
  const insufficientError: InsufficientCreditsError = {
    type: CreditErrorType.INSUFFICIENT_CREDITS,
    message: `Insufficient credits for ${action}. You have ${currentBalance} credits but need ${requiredCredits}.`,
    code: 'INSUFFICIENT_CREDITS',
    currentBalance,
    requiredCredits,
    shortfall,
    suggestedPackage,
    retryable: false,
  }
  
  return NextResponse.json(insufficientError, { status: 402 })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Manual credit check without middleware (for use in components/services)
 */
export async function checkUserCredits(
  userId: string,
  action: CreditAction
): Promise<{
  hasEnoughCredits: boolean
  balance: number
  cost: number
  shortfall?: number
}> {
  try {
    const balance = await creditService.getCreditBalance(userId)
    const cost = CREDIT_COSTS[action]
    const hasEnoughCredits = balance >= cost
    
    return {
      hasEnoughCredits,
      balance,
      cost,
      shortfall: hasEnoughCredits ? undefined : cost - balance,
    }
  } catch (error) {
    console.error('Error checking user credits:', error)
    return {
      hasEnoughCredits: false,
      balance: 0,
      cost: CREDIT_COSTS[action],
      shortfall: CREDIT_COSTS[action],
    }
  }
}

/**
 * Get credit context from request (for use within route handlers)
 */
export function getCreditContext(req: CreditRequest) {
  return req.creditContext
}

/**
 * Get user from credit request
 */
export function getCreditUser(req: CreditRequest) {
  return req.user
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

/*
Example of how to use the credit middleware in API routes:

```typescript
// app/api/video-interview/create/route.ts
import { withCreditCheck } from '@/lib/middleware/credit-middleware'

export const POST = withCreditCheck('VIDEO_INTERVIEW')(async (req, context) => {
  // Credits are automatically validated before this runs
  // If insufficient credits, user gets 402 error response
  
  const user = getCreditUser(req)
  const creditContext = getCreditContext(req)
  
  // Your video interview creation logic here
  const interview = await createVideoInterview(user.id, data)
  
  // Credits are automatically deducted after successful response
  return NextResponse.json({ id: interview.id })
})

// app/api/resume-tailoring/route.ts
export const POST = withCreditCheck('RESUME_TAILORING', {
  metadata: { feature: 'resume_tailoring' }
})(async (req, context) => {
  // Tailoring logic here
  const tailoredResume = await tailorResume(data)
  
  return NextResponse.json({ id: tailoredResume.id })
})

// For read-only operations that need credit awareness:
export const GET = withCreditValidation('VIDEO_INTERVIEW')(async (req, context) => {
  // This checks credits but doesn't deduct them
  // Useful for showing "you can't afford this" messages
})
```
*/

// Import CREDIT_PACKAGES from types file (this should be at the top, but TypeScript needs it here for the function)
import { CREDIT_PACKAGES } from "@/lib/types/credits"
