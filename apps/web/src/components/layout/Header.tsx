"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useScrollY } from "@lego-shop/hooks";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui";
import { HEADER_NAV, ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { SITE } from "@/config/site";
import { useCart } from "@/features/cart/hooks/useCart";
import { selectIsMobileMenuOpen, useUIStore } from "@/features/ui/store";
import { cn } from "@lego-shop/ui";

export function Header() {
  const pathname = usePathname();
  const scrollY = useScrollY();
  const { itemCount, openCart } = useCart();
  const isMobileMenuOpen = useUIStore(selectIsMobileMenuOpen);
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu);
  const openMobileMenu = useUIStore((state) => state.openMobileMenu);
  const openModal = useUIStore((state) => state.openModal);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    closeMobileMenu();
  }, [closeMobileMenu, pathname]);

  const openCartDrawer = useCallback(() => {
    openCart();
    openModal(UI_MODAL_IDS.CART_DRAWER);
  }, [openCart, openModal]);

  const isScrolled = scrollY > 12;

  return (
    <>
      <header className="sticky top-0 z-z-sticky">
        <div className="bg-primary-dark px-4 py-1.5 text-center text-[11px] font-semibold tracking-[0.02em] text-white sm:text-xs">
          {SITE.tagline}
        </div>

        <div
          className={cn(
            "relative border-b border-border bg-white/95 backdrop-blur-xl",
            isScrolled && "shadow-soft",
          )}
        >
          <PageContainer className="max-w-none px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
            <div className="flex min-h-16 items-center justify-between gap-4 lg:min-h-[86px]">
              <BrandLogo className="shrink-0" compact />

              <nav className="hidden min-w-0 flex-1 items-center justify-center gap-7 lg:flex xl:gap-9 2xl:gap-11">
                {HEADER_NAV.map((item) => {
                  const isAnchor = item.href.startsWith("/#");
                  const isActive =
                    item.href === ROUTES.home
                      ? pathname === ROUTES.home
                      : !isAnchor &&
                        (pathname === item.href ||
                          pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative inline-flex items-center justify-center whitespace-nowrap py-2 text-[15px] font-semibold leading-none text-slate-800 transition-all duration-200 hover:text-[#2f91d0]",
                        isActive && "text-[#2f91d0]",
                        item.tone === "accent" && !isActive && "text-pink-300 hover:text-pink-400",
                      )}
                    >
                      {item.label}
                      {isActive ? (
                        <span className="absolute inset-x-0 -bottom-[17px] h-0.5 rounded-full bg-[#63afe3]" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-2 lg:gap-4 xl:gap-5">
                <button
                  type="button"
                  aria-label="Mở giỏ hàng"
                  onClick={openCartDrawer}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-transparent bg-transparent text-slate-700 transition-all duration-200 hover:bg-[#edf8ff] hover:text-[#2f91d0]"
                >
                  <ShoppingCart className="h-6 w-6" strokeWidth={1.8} />
                  {mounted && itemCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-navy">
                      {itemCount}
                    </span>
                  ) : null}
                </button>

                <LanguageSwitcher className="hidden xl:flex" />

                <Button
                  asChild
                  size="md"
                  className="hidden min-w-[198px] rounded-[18px] bg-[#2457c5] px-8 text-[15px] font-semibold text-white hover:bg-[#1f4db0] lg:inline-flex"
                >
                  <Link href={ROUTES.studio}>Tạo Khung Ngay</Link>
                </Button>

                <button
                  type="button"
                  aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                  onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-navy transition-base hover:bg-primary-light lg:hidden"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </PageContainer>

          {isMobileMenuOpen ? (
            <div className="absolute inset-x-0 top-full z-z-modal border-t border-border bg-white shadow-soft lg:hidden">
              <PageContainer className="max-w-[1280px] px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-5">
                  <nav className="grid gap-2">
                    {HEADER_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-navy transition-base hover:border-border hover:bg-surface-soft"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="w-fit">
                    <LanguageSwitcher className="shrink-0" />
                  </div>

                  <Button asChild size="lg" className="w-full">
                    <Link href={ROUTES.studio} onClick={closeMobileMenu}>
                      Tạo Khung Ngay
                    </Link>
                  </Button>
                </div>
              </PageContainer>
            </div>
          ) : null}
        </div>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Đóng menu điều hướng"
          className="fixed inset-0 top-[88px] z-z-overlay bg-transparent lg:hidden"
          onClick={closeMobileMenu}
        />
      ) : null}
    </>
  );
}
