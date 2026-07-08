'use client'

import Image from 'next/image'
import Link from 'next/link'

import { ROUTES } from '@/config/routes'
import { SITE } from '@/config/site'
import { cn } from '@lego-shop/ui'

type BrandLogoProps = {
  className?: string
  compact?: boolean
}

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${SITE.name} home`}
      className={cn('inline-flex items-center gap-3 no-underline', className)}
    >
      <Image
        src="/brand/figure-lab-logo.png"
        alt="Figure Lab logo"
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-[12px]"
        priority
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            'font-sans text-[1.9rem] font-bold leading-none tracking-[-0.05em] text-[#2f91d0]',
            compact && 'text-[1.65rem]',
          )}
        >
          Figure Lab
        </span>
      </span>
    </Link>
  )
}
