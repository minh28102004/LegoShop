import { PageContainer } from '@/components/layout/PageContainer'
import { cn } from '@lego-shop/ui'

import type { HomeOrderStep } from '@/modules/home/types/home.types'
import { SectionHeader } from './SectionHeader'

type HowToOrderProps = {
  steps: HomeOrderStep[]
}

export function HowToOrder({ steps }: HowToOrderProps) {
  return (
    <section id="how-to-order" className="pt-14 md:pt-[88px]">
      <PageContainer>
        <SectionHeader
          align="center"
          eyebrow="How it works"
          title="Hướng dẫn đặt hàng"
          subtitle="Quy trình gọn gàng để món quà của bạn vừa đẹp vừa đúng câu chuyện cần kể."
          className="mb-9"
        />

        <div className="hidden lg:block">
          <div className="relative grid grid-cols-4 gap-[26px]">
            <div className="absolute left-[12.5%] right-[12.5%] top-6 h-px bg-border" />
            {steps.map((step, index) => (
              <article key={step.step} className="relative text-center">
                <span
                  className={cn(
                    'relative z-[1] mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border text-sm font-extrabold',
                    index === steps.length - 1
                      ? 'border-primary bg-primary text-white shadow-soft'
                      : 'border-primary/20 bg-white text-primary-dark',
                  )}
                >
                  {step.step}
                </span>
                <h3 className="mt-[18px] text-lg font-bold leading-[1.35] tracking-[-0.03em] text-navy">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-7 text-muted">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          {steps.map((step, index) => (
            <article
              key={step.step}
              className="relative rounded-[22px] border border-border bg-white p-5"
            >
              {index < steps.length - 1 ? (
                <span className="absolute bottom-4 left-[29px] top-[52px] w-px bg-border" />
              ) : null}
              <div className="flex gap-4">
                <span
                  className={cn(
                    'relative z-[1] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold',
                    index === steps.length - 1
                      ? 'border-primary bg-primary text-white shadow-soft'
                      : 'border-primary/20 bg-white text-primary-dark',
                  )}
                >
                  {step.step}
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-bold leading-[1.35] tracking-[-0.03em] text-navy">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-7 text-muted">{step.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  )
}
