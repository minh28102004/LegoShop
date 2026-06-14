import type { Metadata } from 'next'

import { LoadingLabClient } from '@/features/loading-lab/components/LoadingLabClient'

export const metadata: Metadata = {
  title: 'Loading Lab',
  description: 'Preview BrickFrames loading animations.',
}

export default function LoadingLabPage() {
  return <LoadingLabClient />
}
