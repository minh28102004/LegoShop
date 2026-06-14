'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/cn'
import {
  fadeIn,
  scaleIn,
  scrollRevealFade,
  scrollRevealUp,
  slideInLeft,
  slideInRight,
  slideUp,
} from '@/lib/motion'

const revealVariants = {
  fade: scrollRevealFade,
  up: scrollRevealUp,
  slideUp,
  slideLeft: slideInLeft,
  slideRight: slideInRight,
  scale: scaleIn,
  fadeIn,
} as const satisfies Record<string, Variants>

export interface ScrollRevealProps
  extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: keyof typeof revealVariants
  delay?: number
  once?: boolean
  children: React.ReactNode
}

export const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    { children, className, delay = 0, once = true, variant = 'up', ...props },
    forwardedRef,
  ) => {
    const localRef = React.useRef<HTMLDivElement | null>(null)
    const { isIntersecting } = useIntersectionObserver(localRef, {
      freezeOnceVisible: once,
      threshold: 0.16,
    })
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null): void => {
        localRef.current = node

        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef !== null) {
          forwardedRef.current = node
        }
      },
      [forwardedRef],
    )

    return (
      <motion.div
        ref={setRefs}
        initial="hidden"
        animate={isIntersecting ? 'visible' : 'hidden'}
        variants={revealVariants[variant]}
        transition={{ delay }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

ScrollReveal.displayName = 'ScrollReveal'
