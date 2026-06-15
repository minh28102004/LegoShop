'use client'

import * as React from 'react'
import Link from 'next/link'

import { ROUTES, SITE } from '@/constants'
import { cn } from '@/lib/cn'
import { Container } from './Container'

export interface FooterProps extends React.ComponentPropsWithoutRef<'footer'> {
  showNewsletter?: boolean
}

const FOOTER_NAV = [
  { label: 'Chính sách bảo mật', href: '/privacy' },
  { label: 'Điều khoản dịch vụ', href: '/terms' },
  { label: 'Vận chuyển', href: '/shipping' },
  { label: 'Liên hệ', href: '/business' },
] as const

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn('bg-white border-t border-border', className)}
      {...props}
    >
      <Container className="py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-black text-xs">L</span>
              </div>
              <span className="font-black text-base text-text-primary tracking-tight uppercase">{SITE.name}</span>
            </Link>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              © 2024 {SITE.name}. Not an official LEGO product.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {FOOTER_NAV.map(item => (
              <Link key={item.href} href={item.href}
                className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  ),
)

Footer.displayName = 'Footer'

