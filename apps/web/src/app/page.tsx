import { HomePage } from '@/modules/home/components/HomePage'

// Homepage content is managed from the admin app. Render it dynamically so a
// newly activated feedback, banner, collection, or product is visible on the
// storefront immediately instead of serving the previous page for up to an
// hour.
export const dynamic = 'force-dynamic'

export default function Page() {
  return <HomePage />
}
