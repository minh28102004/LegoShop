import Link from 'next/link'

import { Button } from '@/components/ui'
import { Container } from '@/components/layout/Container'
import { ROUTES } from '@/config/routes'

export default function NotFound() {
  return (
    <section className="min-h-[70dvh] bg-background py-24">
      <Container size="lg">
        <div className="mx-auto flex max-w-content flex-col items-center text-center">
          <p className="text-body-sm font-semibold uppercase tracking-wide text-primary">
            404
          </p>
          <h1 className="mt-4 text-display-lg text-text-primary">
            404 — Trang không tồn tại
          </h1>
          <p className="mt-4 text-body-lg text-text-secondary">
            Đường dẫn này có thể đã được di chuyển hoặc không còn tồn tại.
            Hãy quay lại trang chủ hoặc khám phá các bộ sưu tập Figure Lab.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={ROUTES.home}>Về trang chủ</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.collections}>Xem bộ sưu tập</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
