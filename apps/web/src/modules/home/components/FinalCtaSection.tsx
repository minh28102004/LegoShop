import Link from 'next/link'

import { PageContainer } from '@/components/layout/PageContainer'

import type {
  HomeFinalCta,
  HomeSocialPost,
} from '@/modules/home/types/home.types'

type FinalCtaSectionProps = {
  cta: HomeFinalCta
  items: HomeSocialPost[]
}

export function FinalCtaSection({ cta, items }: FinalCtaSectionProps) {
  return (
    <section className="pt-14 md:pt-[88px]">
      <PageContainer>
        <div className="overflow-hidden rounded-card border border-border bg-[radial-gradient(circle_at_top_left,rgba(223,243,255,0.94),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-7 shadow-soft">
          <div className="grid gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-8 lg:gap-9">
            <div className="grid gap-5">
              <span className="inline-flex w-fit rounded-full bg-primary-light px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-dark">
                {cta.eyebrow}
              </span>
              <h2 className="max-w-[620px] font-display text-[clamp(2rem,9vw,3.4rem)] font-extrabold leading-[1.08] tracking-[-0.06em] text-navy">
                {cta.title}
              </h2>
              <p className="max-w-[560px] text-sm leading-8 text-muted md:text-[15px]">
                {cta.description}
              </p>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={cta.primaryCta.href}
                  className="inline-flex min-h-[50px] w-fit items-center justify-center rounded-button bg-primary px-6 text-[15px] font-bold text-white shadow-soft transition-base hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  {cta.primaryCta.label}
                </Link>
                <Link
                  href={cta.secondaryCta.href}
                  className="inline-flex min-h-[50px] w-fit items-center justify-center rounded-button border border-border bg-white px-6 text-[15px] font-bold text-primary-dark transition-base hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-light"
                >
                  {cta.secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="grid content-start gap-[18px] md:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[22px] border border-border bg-white"
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="block aspect-square w-full object-cover"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
