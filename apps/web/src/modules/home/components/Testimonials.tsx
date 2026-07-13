import { Star } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'

import type { HomeTestimonial } from '@/modules/home/types/home.types'
import { SectionHeader } from './SectionHeader'

type TestimonialsProps = {
  items: HomeTestimonial[]
}

export function Testimonials({ items }: TestimonialsProps) {
  return (
    <section className="pt-14 md:pt-[88px]">
      <PageContainer>
        <SectionHeader
          align="center"
          eyebrow="Testimonials"
          title="Khách hàng nói gì về Figure Lab"
          subtitle="Những phản hồi thật từ các đơn hàng kỷ niệm, sinh nhật và quà tặng doanh nghiệp."
          className="mb-9"
        />

        <div className="grid gap-[18px] lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col rounded-card border border-border bg-white p-6 shadow-soft"
            >
              <div className="mb-3.5 flex items-center gap-1 text-accent-dark">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-8 text-muted md:text-[15px]">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-[22px] flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-sm font-extrabold text-primary-dark">
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-navy">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
