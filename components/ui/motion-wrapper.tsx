import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Entrance-animation wrappers — deliberately inert.
 *
 * These used to render children at `opacity-0` until a client-side timer fired,
 * then swap in an `animate-{name}` class. But those keyframes were never defined
 * anywhere, so there was never any animation — only a flash of hidden content and
 * a direct LCP penalty, with above-the-fold copy invisible until JS hydrated.
 *
 * The design system calls for subtle motion and no decorative entrance animation,
 * so content now paints immediately. The component and its props are kept so the
 * ~20 existing call sites don't need to change, and so a real, considered motion
 * treatment can be introduced here later in exactly one place.
 */

type Animation =
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'slide-in-right'
  | 'slide-in-left'
  | 'slide-in-up'
  | 'scale-in'
  | 'bounce-in'

interface MotionWrapperProps {
  children: ReactNode
  className?: string
  /** Accepted for API compatibility; intentionally unused. */
  animation?: Animation
  /** Accepted for API compatibility; intentionally unused. */
  delay?: number
  /** Accepted for API compatibility; intentionally unused. */
  duration?: string
}

export function MotionWrapper({ children, className = '' }: MotionWrapperProps) {
  return <div className={cn(className)}>{children}</div>
}

interface StaggeredContainerProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  animation?: Animation
}

export function StaggeredContainer({ children, className = '' }: StaggeredContainerProps) {
  return <div className={className}>{children}</div>
}
