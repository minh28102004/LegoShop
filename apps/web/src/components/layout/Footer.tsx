'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Camera,
  CreditCard,
  MessageCircle,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'

import { Button, Input } from '@/components/ui'
import {
  BUSINESS_HOURS,
  FOOTER_LINKS,
  ROUTES,
  SITE,
  SOCIAL_LINKS,
} from '@/constants'
import { cn } from '@/lib/cn'
import { Container } from './Container'

export interface FooterProps extends React.ComponentPropsWithoutRef<'footer'> {
  showNewsletter?: boolean
}

const TRUST_BADGES = [
  {
    label: 'SSL bảo mật',
    icon: ShieldCheck,
  },
  {
    label: 'Thanh toán an toàn',
    icon: CreditCard,
  },
  {
    label: 'Đổi trả linh hoạt',
    icon: RotateCcw,
  },
] as const

const SOCIAL_ITEMS = [
  {
    label: 'Facebook',
    href: SOCIAL_LINKS.facebook,
    icon: MessageCircle,
  },
  {
    label: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    icon: Camera,
  },
  {
    label: 'YouTube',
    href: SOCIAL_LINKS.youtube,
    icon: PlayCircle,
  },
] as const

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, showNewsletter = true, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn('border-t border-border bg-surface text-text-primary', className)}
      {...props}
    >
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-6">
            <Link href={ROUTES.home} className="inline-flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
                BF
              </span>
              <span className="font-display text-body-xl font-semibold">
                {SITE.name}
              </span>
            </Link>
            <p className="max-w-content text-body-md text-text-secondary">
              {SITE.description}
            </p>
            <div className="space-y-1 text-body-sm text-text-muted">
              <p>{SITE.address}</p>
              <p>{SITE.phone}</p>
              <p>{SITE.email}</p>
              <p>{BUSINESS_HOURS.weekdays}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon

                return (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-body-sm text-text-secondary"
                  >
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    {badge.label}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="space-y-4">
                <h3 className="text-body-md font-semibold text-text-primary">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body-sm text-text-secondary transition-base hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {showNewsletter ? (
          <div className="mt-12 rounded-md border border-border bg-background p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h3 className="text-display-sm text-text-primary">
                  Nhận ý tưởng trưng bày mới
                </h3>
                <p className="mt-2 text-body-md text-text-secondary">
                  Cập nhật bộ sưu tập, chất liệu khung và ưu đãi theo mùa.
                </p>
              </div>
              <form className="flex flex-col gap-3 sm:flex-row">
                <Input
                  name="newsletter-email"
                  type="email"
                  placeholder="Email của bạn"
                  aria-label="Email nhận newsletter"
                />
                <Button type="submit">Đăng ký</Button>
              </form>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-sm text-text-muted">
            © 2026 {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-2">
            {SOCIAL_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className="grid size-10 place-items-center rounded-md text-text-muted transition-base hover:bg-background hover:text-primary"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </div>
      </Container>
    </footer>
  ),
)

Footer.displayName = 'Footer'
