import Link from 'next/link'

import { PageContainer } from '@/components/layout/PageContainer'
import type { HomeHero } from '@/modules/home/types/home.types'

type HeroSectionProps = {
  hero: HomeHero
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="pt-8 md:pt-10">
      <PageContainer className="max-w-[1280px]">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-11">
          <div className="grid gap-6">
            <span className="inline-flex w-fit font-serif text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
              {hero.eyebrow}
            </span>
            <h1 className="max-w-[520px] font-serif text-[clamp(3.2rem,7vw,5.55rem)] font-bold leading-[0.94] tracking-[-0.06em] text-[#202020]">
              {hero.title}
            </h1>
            <p className="max-w-[470px] font-serif text-[15px] leading-8 text-[#4e4e4e]">
              {hero.description}
            </p>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-button bg-[#114bbd] px-6 font-serif text-[14px] font-bold text-white shadow-soft transition-base hover:-translate-y-0.5 hover:bg-[#0e43a6]"
              >
                Mở Công Cụ Thiết Kế
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-button border border-[#114bbd] bg-white px-6 font-serif text-[14px] font-bold text-[#114bbd] transition-base hover:-translate-y-0.5 hover:bg-[#eef4ff]"
              >
                Khám phá Bộ sưu tập
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <div className="flex items-center rounded-full border border-border bg-white px-2.5 py-2 shadow-[0_12px_32px_-24px_rgba(16,32,51,0.18)]">
                <div className="flex items-center">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f8edd0] text-[10px] font-extrabold text-primary">
                    F
                  </span>
                  <span className="-ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f0fb] text-[10px] font-extrabold text-primary">
                    L
                  </span>
                  <span className="-ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f8edf0] text-[10px] font-extrabold text-primary">
                    B
                  </span>
                </div>
                <p className="ml-3 font-serif text-[12px] font-semibold text-[#555]">
                  <span className="font-bold text-[#d39e1f]">4.9/5</span> đánh
                  giá • 2.400+ đơn hàng
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#f6f3ee_0%,#ffffff_36%,#f4f0ea_100%)] shadow-[0_28px_70px_-38px_rgba(16,32,51,0.25)]">
              <img
                src={hero.image}
                alt="BrickFrames hero visual"
                className="block aspect-[1.14/0.82] w-full object-cover"
              />
            </div>

            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2.5 rounded-[18px] border border-white/80 bg-white/92 px-3.5 py-3 shadow-[0_20px_44px_-28px_rgba(16,32,51,0.22)]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#114bbd] text-[11px] font-extrabold text-white">
                A
              </span>
              <div>
                <p className="font-serif text-[12px] font-bold text-[#2d2d2d]">
                  {hero.customerName}
                </p>
                <p className="font-serif text-[11px] leading-[1.4] text-[#717171]">
                  {hero.customerMeta}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
