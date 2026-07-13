'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

export interface WindowSize {
  width: number
  height: number
}

const SERVER_WINDOW_SIZE_SNAPSHOT = '0:0'

function parseWindowSizeSnapshot(snapshot: string): WindowSize {
  const [width = '0', height = '0'] = snapshot.split(':')

  return {
    width: Number(width),
    height: Number(height),
  }
}

export function useWindowSize(): WindowSize {
  const subscribe = useCallback((onStoreChange: () => void): (() => void) => {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    let frameId: number | null = null
    const handleResize = (): void => {
      if (frameId !== null) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null
        onStoreChange()
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])
  const getSnapshot = useCallback((): string => {
    if (typeof window === 'undefined') {
      return SERVER_WINDOW_SIZE_SNAPSHOT
    }

    return `${window.innerWidth}:${window.innerHeight}`
  }, [])
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_WINDOW_SIZE_SNAPSHOT,
  )

  return useMemo<WindowSize>(
    () => parseWindowSizeSnapshot(snapshot),
    [snapshot],
  )
}
