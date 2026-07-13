'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { useIntersectionObserver } from '@lego-shop/hooks'

import { Button } from '@/components/ui'
import { cn } from '@lego-shop/ui'

export interface SectionHeaderProps
  extends Omit<HTMLMotionProps<'div'>, 'title'> {
  eyebrow?: string
  title: string
  subtitle?: string
  cta?: {
    label: string
    href: string
  }
  align?: 'left' | 'center'
}

export const SectionHeader = React.forwardRef<
  HTMLDivElement,
  SectionHeaderProps
>(
  (
    { align = 'left', className, cta, eyebrow, subtitle, title, ...props },
    forwardedRef,
  ) => {
    const localRef = React.useRef<HTMLDivElement | null>(null)
    const { isIntersecting } = useIntersectionObserver(localRef, {
      freezeOnceVisible: true,
      threshold: 0.2,
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
        initial={{ opacity: 0, y: 18 }}
        animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.45 }}
        className={cn(
          'mb-10 flex flex-col gap-4',
          align === 'center' && 'items-center text-center',
          align === 'left' && 'items-start text-left',
          className,
        )}
        {...props}
      >
        {eyebrow ? (
          <p className="text-body-sm font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        ) : null}
        <div className="max-w-wide space-y-3">
          <h2 className="text-display-md text-text-primary md:text-display-lg">
            {title}
          </h2>
          {subtitle ? (
            <p className="max-w-content text-body-lg text-text-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
        {cta ? (
          <Button asChild variant="outline" rightIcon={<ArrowRight className="size-4" />}>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        ) : null}
      </motion.div>
    )
  },
)

SectionHeader.displayName = 'SectionHeader'
