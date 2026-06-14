'use client'

import { useEffect, useMemo, useState, type RefObject } from 'react'

export type UseIntersectionObserverOptions = IntersectionObserverInit & {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  options: UseIntersectionObserverOptions = {},
): {
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
} {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const isIntersecting = entry?.isIntersecting ?? false
  const frozen = options.freezeOnceVisible === true && isIntersecting
  const thresholdKey = useMemo(() => {
    if (Array.isArray(options.threshold)) {
      return options.threshold.join(',')
    }

    return options.threshold?.toString() ?? ''
  }, [options.threshold])

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      ref.current === null ||
      frozen
    ) {
      return undefined
    }

    const node = ref.current
    const observerOptions: IntersectionObserverInit = {}

    if (options.root !== undefined) {
      observerOptions.root = options.root
    }

    if (options.rootMargin !== undefined) {
      observerOptions.rootMargin = options.rootMargin
    }

    if (options.threshold !== undefined) {
      observerOptions.threshold = options.threshold
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        if (observerEntry !== undefined) {
          setEntry(observerEntry)
        }
      },
      observerOptions,
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [
    frozen,
    options.root,
    options.rootMargin,
    options.threshold,
    ref,
    thresholdKey,
  ])

  return {
    isIntersecting,
    entry,
  }
}
