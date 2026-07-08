'use client'

import { useEffect, type RefObject } from 'react'

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent): void => {
      const element = ref.current
      const target = event.target

      if (
        element === null ||
        !(target instanceof Node) ||
        element.contains(target)
      ) {
        return
      }

      callback()
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [callback, ref])
}
