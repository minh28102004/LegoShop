'use client'

import type { ReactNode } from 'react'

export interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Add future providers here.
  return children
}
