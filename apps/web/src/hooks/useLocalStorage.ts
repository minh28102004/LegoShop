'use client'

import { useCallback, useEffect, useState } from 'react'

type SetValue<T> = (value: T | ((previousValue: T) => T)) => void

function parseStoredValue<T>(storedValue: string | null, fallback: T): T {
  if (storedValue === null) {
    return fallback
  }

  try {
    return JSON.parse(storedValue) as T
  } catch {
    return fallback
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): {
  value: T
  setValue: SetValue<T>
  removeValue: () => void
} {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    return parseStoredValue(window.localStorage.getItem(key), initialValue)
  }, [initialValue, key])
  const [value, setStoredValue] = useState<T>(() => readValue())

  const setValue = useCallback<SetValue<T>>(
    (nextValue) => {
      setStoredValue((previousValue) => {
        const resolvedValue =
          typeof nextValue === 'function'
            ? (nextValue as (previousValue: T) => T)(previousValue)
            : nextValue

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue))
        }

        return resolvedValue
      })
    },
    [key],
  )

  const removeValue = useCallback((): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }

    setStoredValue(initialValue)
  }, [initialValue, key])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleStorage = (event: StorageEvent): void => {
      if (event.key === key) {
        setStoredValue(parseStoredValue(event.newValue, initialValue))
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [initialValue, key])

  return {
    value,
    setValue,
    removeValue,
  }
}
