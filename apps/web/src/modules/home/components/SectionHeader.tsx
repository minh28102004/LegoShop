import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@lego-shop/ui'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  eyebrow?: string
  cta?: {
    label: string
    href: string
  }
  className?: string | undefined
}

export function SectionHeader({
  align = 'left',
  className,
  cta,
  eyebrow,
  subtitle,
  title,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary-dark">
          {eyebrow}
        </span>
      ) : null}
      <div className={cn('space-y-3', align === 'center' && 'max-w-2xl')}>
        <h2 className="font-display text-[2rem] font-extrabold tracking-[-0.05em] text-navy sm:text-[2.35rem]">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-muted sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {cta ? (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-dark no-underline"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}
