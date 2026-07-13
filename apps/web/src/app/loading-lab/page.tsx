import type { Metadata } from 'next'

import { LoadingLabClient } from '@/modules/loading-lab/components/LoadingLabClient'

export const metadata: Metadata = {
  title: 'Loading Lab',
  description: 'Preview Figure Lab loading animations.',
}

export default function LoadingLabPage() {
  return <LoadingLabClient />
}
