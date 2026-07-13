import Link from 'next/link'

import { PageContainer } from '@/components/layout/PageContainer'
import { ROUTES } from '@/config/routes'

export function CorporateBanner() {
  return (
    <section className="pt-14 md:pt-[88px]">
      <PageContainer>
        <div
          id="corporate"
          className="overflow-hidden rounded-card border border-border bg-[linear-gradient(135deg,rgba(223,243,255,0.92)_0%,#ffffff_46%,rgba(238,246,255,0.96)_100%)] shadow-soft"
        >
          <div className="grid gap-7 p-7 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.88fr)] md:items-stretch md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)] lg:gap-9 lg:p-[34px]">
            <div className="grid gap-[18px]">
              <span className="inline-flex w-fit rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-dark">
                Figure Lab for teams
              </span>
              <div className="space-y-3">
                <h2 className="font-display text-[clamp(2rem,9vw,3.4rem)] font-extrabold leading-[1.08] tracking-[-0.06em] text-navy">
                  Quà tặng doanh nghiệp, lớp học và sự kiện
                </h2>
                <p className="max-w-[620px] text-sm leading-8 text-muted md:text-[15px]">
                  Thiết kế cá nhân hóa theo concept riêng, hỗ trợ duyệt mẫu demo
                  trước khi sản xuất số lượng lớn. Chất lượng đồng đều, bao bì
                  chỉn chu và mức chiết khấu phù hợp cho từng quy mô đặt hàng.
                </p>
              </div>
              <Link
                href={ROUTES.business}
                className="inline-flex min-h-[50px] w-fit items-center justify-center rounded-button bg-primary px-6 text-[15px] font-bold text-white shadow-soft transition-base hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Nhận tư vấn
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="relative min-h-[280px] overflow-hidden rounded-card border border-white/80 bg-[linear-gradient(140deg,rgba(255,255,255,0.76),rgba(255,255,255,0.16)),radial-gradient(circle_at_16%_18%,rgba(77,169,220,0.18),transparent_28%),radial-gradient(circle_at_76%_82%,rgba(255,225,106,0.28),transparent_24%),linear-gradient(180deg,hsl(var(--color-surface-soft))_0%,#ffffff_100%)]">
                <div className="absolute right-[34px] top-[42px] h-[86px] w-[86px] rounded-card border border-primary/15 bg-white/60 shadow-[0_18px_48px_-30px_rgba(16,32,51,0.14)]" />
                <div className="absolute bottom-9 left-9 right-9 h-24 rounded-[28px] bg-[linear-gradient(90deg,rgba(77,169,220,0.08),rgba(77,169,220,0.02)),rgba(255,255,255,0.74)] shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
