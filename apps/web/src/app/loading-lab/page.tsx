import type { Metadata } from 'next'

import { LoadingLabClient } from '@/modules/loading-lab/components/LoadingLabClient'
import { vi } from '@/lib/i18n/dictionaries/vi'

export const metadata: Metadata = {
  title: vi.loadingLab.metadataTitle,
  description: vi.loadingLab.metadataDescription,
}

export default function LoadingLabPage() {
  return <LoadingLabClient />
}
