import {
  BriefcaseBusiness,
  Gift,
  PencilRuler,
  Sparkles,
} from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'

import type { HomeValueProp } from '@/modules/home/types/home.types'
import { SectionHeader } from './SectionHeader'

type WhyChooseUsProps = {
  items: HomeValueProp[]
}

const ICONS = {
  sparkles: Sparkles,
  drafting: PencilRuler,
  gift: Gift,
  briefcase: BriefcaseBusiness,
} as const

export function WhyChooseUs({ items }: WhyChooseUsProps) {
  return (
    <section id="about-figure-lab" className="pt-14 md:pt-[88px]">
      <PageContainer>
        <div className="overflow-hidden rounded-card border border-border bg-[radial-gradient(circle_at_top_center,rgba(223,243,255,0.88),transparent_26%),rgba(255,255,255,0.9)] px-6 py-7 shadow-soft">
          <SectionHeader
            align="center"
            eyebrow="Why Figure Lab"
            title="Vì sao khách hàng chọn Figure Lab"
            subtitle="Không chỉ là quà tặng, đây là trải nghiệm thiết kế riêng được chăm chút từ ý tưởng đến thành phẩm."
            className="mb-9"
          />

          <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const Icon = ICONS[item.icon]

              return (
                <article
                  key={item.title}
                  className="flex h-full flex-col items-center rounded-card border border-border bg-white/95 px-[22px] py-[30px] text-center"
                >
                  <span className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white shadow-[0_12px_30px_-20px_rgba(16,32,51,0.16)]">
                    <Icon className="h-6 w-6 text-primary-dark" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold leading-[1.35] tracking-[-0.03em] text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {item.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
