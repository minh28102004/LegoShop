'use client'

import { useCallback, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void): (() => void) => {
      if (typeof window === 'undefined') {
        return () => undefined
      }

      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onStoreChange)

      return () => {
        mediaQueryList.removeEventListener('change', onStoreChange)
      }
    },
    [query],
  )
  const getSnapshot = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(query).matches
  }, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
