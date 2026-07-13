import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { ROUTES } from '@/config/routes'

import type { HomeFeaturedProduct } from '@/modules/home/types/home.types'
import { ProductCard } from './ProductCard'

type FeaturedProductsProps = {
  products: HomeFeaturedProduct[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="pt-14 md:pt-[88px]">
      <PageContainer>
        <div className="mb-8 flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="grid gap-3">
            <span className="inline-flex w-fit rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-dark">
              Collector&apos;s picks
            </span>
            <div className="space-y-2">
              <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-[-0.06em] text-navy">
                Những món quà được yêu thích
              </h2>
              <p className="max-w-[720px] text-sm leading-8 text-muted md:text-[15px]">
                Một shortlist giàu cảm xúc cho sinh nhật, tốt nghiệp, kỷ niệm và
                những dịp cần một món quà thật có gu.
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.collection}
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary-dark"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
