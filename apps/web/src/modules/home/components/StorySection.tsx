import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'

import type { HomeStory } from '@/modules/home/types/home.types'

type StorySectionProps = {
  story: HomeStory
}

export function StorySection({ story }: StorySectionProps) {
  return (
    <section className="pt-14 md:pt-[88px]">
      <PageContainer>
        <div className="overflow-hidden rounded-card border border-border bg-white p-6 shadow-soft lg:p-[30px]">
          <div className="grid items-center gap-7 md:grid-cols-[minmax(0,0.88fr)_minmax(0,0.92fr)] md:gap-8 lg:gap-[54px]">
            <div className="relative">
              <div className="overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#122d4e,#0d1f36)] shadow-[0_28px_70px_-42px_rgba(16,32,51,0.34)]">
                <img
                  src={story.image}
                  alt="Figure Lab framed creation"
                  className="block aspect-[0.9/1.1] w-full object-cover"
                />
              </div>
            </div>

            <div className="grid gap-[18px]">
              <span className="inline-flex w-fit rounded-full bg-primary-light px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-dark">
                {story.eyebrow}
              </span>
              <h2 className="font-display text-[clamp(2rem,9vw,3.4rem)] font-extrabold leading-[1.08] tracking-[-0.06em] text-navy">
                {story.title}
              </h2>
              <p className="max-w-[620px] text-sm leading-8 text-muted md:text-[15px]">
                {story.lead}
              </p>
              <div className="grid gap-4">
                {story.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-8 text-muted md:text-[15px]">
                    {paragraph}
                  </p>
                ))}
              </div>
              <Link
                href={story.cta.href}
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary-dark no-underline"
              >
                {story.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
