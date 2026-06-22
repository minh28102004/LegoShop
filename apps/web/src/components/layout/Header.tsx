'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'

import { Drawer } from '@/components/ui'
import { HEADER_NAV, ROUTES, SITE, UI_MODAL_IDS } from '@/constants'
import { useCart } from '@/features/cart/hooks/useCart'
import { useScrollY } from '@/hooks/useScrollY'
import { selectIsMobileMenuOpen, useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

export interface HeaderProps extends React.ComponentPropsWithoutRef<'header'> {
  transparent?: boolean
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, transparent = false, ...props }, ref) => {
    const scrollY = useScrollY()
    const pathname = usePathname()
    const { itemCount, openCart } = useCart()
    const isMobileMenuOpen = useUIStore(selectIsMobileMenuOpen)
    const closeMobileMenu = useUIStore((state) => state.closeMobileMenu)
    const openMobileMenu = useUIStore((state) => state.openMobileMenu)
    const openModal = useUIStore((state) => state.openModal)
    const user = useAuthStore((state) => state.user)
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
      setMounted(true)
    }, [])
    const openCartDrawer = React.useCallback(() => {
      openCart()
      openModal(UI_MODAL_IDS.CART_DRAWER)
      window.dispatchEvent(new CustomEvent('legoshop:open-cart'))
    }, [openCart, openModal])
    const handleCartKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return
      }

      event.preventDefault()
      openCartDrawer()
    }, [openCartDrawer])
    const isScrolled = scrollY > 8

    return (
      <>
        <header
          ref={ref}
          {...props}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            height: 60,
            background: '#fff',
            borderBottom: isScrolled ? 'none' : '1px solid #f3f4f6',
            boxShadow: isScrolled ? '0 1px 0 #f3f4f6' : 'none',
            transition: 'box-shadow 0.2s',
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo */}
            <Link
              href={ROUTES.home}
              style={{ textDecoration: 'none', flexShrink: 0 }}
              aria-label={`${SITE.name} home`}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: 14,
                  color: '#0f0f0f',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {SITE.name}
              </span>
            </Link>

            {/* Nav — center */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {HEADER_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      padding: '6px 14px',
                      fontSize: 12.5,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#0f0f0f' : '#6b7280',
                      textDecoration: 'none',
                      borderRadius: 6,
                      transition: 'color 0.15s',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right — icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                aria-label="Tìm kiếm"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Search size={16} />
              </button>

              {mounted && user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={() => useAuthStore.getState().logout()}
                    style={{
                      fontSize: 12,
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Thoát
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  aria-label="Tài khoản"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  <User size={16} />
                </Link>
              )}

              <button
                type="button"
                aria-label="Mở giỏ hàng"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  touchAction: 'manipulation',
                }}
                data-cart-trigger="true"
                onMouseDown={openCartDrawer}
                onTouchStart={openCartDrawer}
                onKeyDown={handleCartKeyDown}
                onClick={openCartDrawer}
              >
                <ShoppingBag size={16} />
                {mounted && itemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile toggle — hidden on desktop */}
              <button
                type="button"
                aria-label="Menu"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginLeft: 2,
                }}
                onClick={openMobileMenu}
                className="lg:hidden"
              >
                <Menu size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        <Drawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu} title={SITE.name} position="right" size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f0f0f' }}>
                {SITE.name}
              </span>
              <button
                type="button"
                onClick={closeMobileMenu}
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <nav style={{ display: 'grid', gap: 2 }}>
              {HEADER_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  style={{
                    padding: '10px 12px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: 8,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href={ROUTES.studio}
              onClick={closeMobileMenu}
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                padding: '12px 0',
                borderRadius: 8,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Bắt đầu thiết kế →
            </Link>
          </div>
        </Drawer>
      </>
    )
  },
)

Header.displayName = 'Header'
