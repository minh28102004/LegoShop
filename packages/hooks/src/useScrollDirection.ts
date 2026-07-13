'use client'

import { useEffect, useRef, useState } from 'react'

import { useScrollY } from './useScrollY'

export type ScrollDirection = 'up' | 'down' | 'none'

const DEFAULT_SCROLL_THRESHOLD = 10

export function useScrollDirection(
  threshold: number = DEFAULT_SCROLL_THRESHOLD,
): ScrollDirection {
  const scrollY = useScrollY()
  const previousScrollYRef = useRef<number>(0)
  const [direction, setDirection] = useState<ScrollDirection>('none')

  useEffect(() => {
    const previousScrollY = previousScrollYRef.current
    const delta = scrollY - previousScrollY

    if (Math.abs(delta) < threshold) {
      return
    }

    setDirection(delta > 0 ? 'down' : 'up')
    previousScrollYRef.current = scrollY
  }, [scrollY, threshold])

  return direction
}
