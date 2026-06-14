'use client'

import { useEffect } from 'react'

export interface UseKeyPressOptions {
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
}

function matchesModifier(
  expected: boolean | undefined,
  actual: boolean,
): boolean {
  return expected === undefined || expected === actual
}

export function useKeyPress(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: UseKeyPressOptions = {},
): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase()
      const isModifierMatch =
        matchesModifier(options.ctrlKey, event.ctrlKey) &&
        matchesModifier(options.metaKey, event.metaKey) &&
        matchesModifier(options.shiftKey, event.shiftKey)

      if (isKeyMatch && isModifierMatch) {
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [callback, key, options.ctrlKey, options.metaKey, options.shiftKey])
}
