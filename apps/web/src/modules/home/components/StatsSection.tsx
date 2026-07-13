import { PageContainer } from '@/components/layout/PageContainer'

import type { HomeStat } from '@/modules/home/types/home.types'

type StatsSectionProps = {
  stats: HomeStat[]
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="pt-6">
      <PageContainer>
        <div className="border-y border-border bg-white/70">
          <div className="grid grid-cols-2 gap-x-[18px] gap-y-[22px] px-2.5 py-7 md:grid-cols-4 md:px-3">
            {stats.map((item) => (
              <article key={item.label} className="text-center">
                <p className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.06em] text-primary-dark">
                  {item.value}
                </p>
                <p className="mt-2 text-[13px] font-bold tracking-[-0.02em] text-navy">
                  {item.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
