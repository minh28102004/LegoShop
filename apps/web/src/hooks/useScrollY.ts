'use client'

import { useCallback, useSyncExternalStore } from 'react'

export function useScrollY(): number {
  const subscribe = useCallback((onStoreChange: () => void): (() => void) => {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    let frameId: number | null = null
    const handleScroll = (): void => {
      if (frameId !== null) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null
        onStoreChange()
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])
  const getSnapshot = useCallback((): number => {
    if (typeof window === 'undefined') {
      return 0
    }

    return window.scrollY
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => 0)
}
