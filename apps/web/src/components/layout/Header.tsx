'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'

import { Badge, Button, Drawer } from '@/components/ui'
import { HEADER_NAV, ROUTES, SITE, UI_MODAL_IDS } from '@/constants'
import { useCart } from '@/features/cart/hooks/useCart'
import { useScrollY } from '@/hooks/useScrollY'
import { cn } from '@/lib/cn'
import {
  selectIsMobileMenuOpen,
  useUIStore,
} from '@/stores/uiStore'
import { Container } from './Container'

export interface HeaderProps extends React.ComponentPropsWithoutRef<'header'> {
  transparent?: boolean
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, transparent = true, ...props }, ref) => {
    const scrollY = useScrollY()
    const { itemCount } = useCart()
    const isMobileMenuOpen = useUIStore(selectIsMobileMenuOpen)
    const closeMobileMenu = useUIStore((state) => state.closeMobileMenu)
    const openMobileMenu = useUIStore((state) => state.openMobileMenu)
    const openModal = useUIStore((state) => state.openModal)
    const isScrolled = scrollY > 16
    const shouldUseSolidBackground = !transparent || isScrolled

    return (
      <>
        <header
          ref={ref}
          className={cn(
            'sticky top-0 z-z-sticky border-b transition-base',
            shouldUseSolidBackground
              ? 'border-border bg-background/90 shadow-sm backdrop-blur-xl'
              : 'border-transparent bg-background/0',
            className,
          )}
          {...props}
        >
          <Container className="flex h-[var(--header-height)] items-center justify-between gap-4">
            <Link
              href={ROUTES.home}
              className="flex shrink-0 items-center gap-3"
              aria-label={`${SITE.name} home`}
            >
              <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
                BF
              </span>
              <span className="font-display text-body-xl font-semibold text-text-primary">
                {SITE.name}
              </span>
            </Link>

            <nav
              className="hidden items-center gap-6 lg:flex"
              aria-label="Điều hướng chính"
            >
              {HEADER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-body-sm font-semibold text-text-secondary transition-base hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Tìm kiếm"
                className="hidden size-10 items-center justify-center rounded-md text-text-secondary transition-base hover:bg-surface hover:text-text-primary md:flex"
              >
                <Search className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Mở giỏ hàng"
                className="relative flex size-10 items-center justify-center rounded-md text-text-secondary transition-base hover:bg-surface hover:text-text-primary"
                onClick={() => openModal(UI_MODAL_IDS.CART_DRAWER)}
              >
                <ShoppingBag className="size-5" aria-hidden="true" />
                {itemCount > 0 ? (
                  <Badge
                    variant="primary"
                    size="sm"
                    className="absolute -right-2 -top-2 min-w-5 justify-center px-1"
                  >
                    {itemCount}
                  </Badge>
                ) : null}
              </button>
              <Button asChild className="hidden md:inline-flex">
                <Link href={ROUTES.creatorStudio}>Tạo ngay</Link>
              </Button>
              <button
                type="button"
                aria-label="Mở menu"
                className="flex size-10 items-center justify-center rounded-md text-text-secondary transition-base hover:bg-surface hover:text-text-primary lg:hidden"
                onClick={openMobileMenu}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </div>
          </Container>
        </header>

        <Drawer
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          title="Menu"
          position="right"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-body-xl font-semibold">
                {SITE.name}
              </span>
              <button
                type="button"
                aria-label="Đóng menu"
                className="rounded-md p-2 text-text-muted transition-base hover:bg-surface hover:text-text-primary"
                onClick={closeMobileMenu}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="grid gap-2" aria-label="Điều hướng mobile">
              {HEADER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-3 text-body-md font-semibold text-text-primary transition-base hover:bg-surface"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Button asChild className="mt-4">
              <Link href={ROUTES.creatorStudio} onClick={closeMobileMenu}>
                Tạo ngay
              </Link>
            </Button>
          </div>
        </Drawer>
      </>
    )
  },
)

Header.displayName = 'Header'
