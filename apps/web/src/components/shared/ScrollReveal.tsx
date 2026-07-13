'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { useIntersectionObserver } from '@lego-shop/hooks'

import { cn } from '@lego-shop/ui'
import {
  fadeIn,
  scaleIn,
  scrollRevealFade,
  scrollRevealUp,
  slideInLeft,
  slideInRight,
  slideUp,
} from '@lego-shop/ui'

const revealVariants = {
  fade: scrollRevealFade,
  up: scrollRevealUp,
  slideUp,
  slideLeft: slideInLeft,
  slideRight: slideInRight,
  scale: scaleIn,
  fadeIn,
} as const satisfies Record<string, Record<string, unknown>>

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
        variants={revealVariants[variant as keyof typeof revealVariants]}
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
