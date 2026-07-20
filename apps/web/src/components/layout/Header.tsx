"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@lego-shop/ui";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HEADER_NAV_ITEMS, ROUTES, UI_MODAL_IDS } from "@/config/routes";
import { useCart } from "@/features/cart/hooks/useCart";
import { selectIsMobileMenuOpen, useUIStore } from "@/features/ui/store";
import { useI18n } from "@/lib/i18n/useI18n";

function isNavItemActive(pathname: string, href: string) {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }

  if (href.startsWith("/#")) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { t } = useI18n();

  const isMobileMenuOpen = useUIStore(selectIsMobileMenuOpen);
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu);
  const openMobileMenu = useUIStore((state) => state.openMobileMenu);
  const openModal = useUIStore((state) => state.openModal);

  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHasMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [closeMobileMenu, pathname]);

  useEffect(() => {
    const scrollRoot = document.getElementById("site-scroll-root");

    const updateScrollState = () => {
      if (scrollRoot) {
        setIsScrolled(scrollRoot.scrollTop > 10);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };

    updateScrollState();

    if (scrollRoot) {
      scrollRoot.addEventListener("scroll", updateScrollState, {
        passive: true,
      });

      return () => {
        scrollRoot.removeEventListener("scroll", updateScrollState);
      };
    }

    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const { body, documentElement } = document;
    const scrollRoot = document.getElementById("site-scroll-root");

    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlTouchAction = documentElement.style.touchAction;
    const previousScrollRootOverflow = scrollRoot?.style.overflow ?? "";
    const previousScrollRootTouchAction = scrollRoot?.style.touchAction ?? "";
    const previousScrollRootOverscroll =
      scrollRoot?.style.overscrollBehavior ?? "";

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "none";
    documentElement.style.overflow = "hidden";
    documentElement.style.touchAction = "none";

    if (scrollRoot) {
      scrollRoot.style.overflow = "hidden";
      scrollRoot.style.touchAction = "none";
      scrollRoot.style.overscrollBehavior = "none";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    const handlePointerDown = (event: PointerEvent | MouseEvent) => {
      const target = event.target as Node | null;

      // If click is inside the drawer or on the menu button, do nothing
      if (
        drawerRef.current?.contains(target as Node) ||
        menuButtonRef.current?.contains(target as Node) ||
        closeButtonRef.current?.contains(target as Node)
      ) {
        return;
      }

      // Otherwise close the mobile menu
      closeMobileMenu();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      body.style.overscrollBehavior = previousBodyOverscroll;
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.touchAction = previousHtmlTouchAction;

      if (scrollRoot) {
        scrollRoot.style.overflow = previousScrollRootOverflow;
        scrollRoot.style.touchAction = previousScrollRootTouchAction;
        scrollRoot.style.overscrollBehavior = previousScrollRootOverscroll;
      }

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  const openCartDrawer = useCallback(() => {
    openCart();
    openModal(UI_MODAL_IDS.CART_DRAWER);
  }, [openCart, openModal]);

  const mobileDrawer = (
    <div
      className="fixed inset-0 lg:hidden"
      style={{
        zIndex: 1300,
        pointerEvents: isMobileMenuOpen ? "auto" : "none",
      }}
      aria-hidden={!isMobileMenuOpen}
    >
      <div
        aria-hidden="true"
        onClick={closeMobileMenu}
        className={cn(
          "fixed inset-0 transition-opacity duration-300 ease-out",
          isMobileMenuOpen ? "opacity-100" : "opacity-0",
        )}
        style={{
          zIndex: 1300,
          background: "rgba(0, 0, 0, 0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: isMobileMenuOpen ? "block" : "none",
        }}
      />

      <aside
        ref={drawerRef}
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("header.mobileMenuTitle")}
        className="fixed flex flex-col overflow-hidden border-l border-[#dbe7f1] bg-white shadow-[-30px_0_70px_-28px_rgba(18,45,78,0.45)] transition-transform duration-300 ease-out will-change-transform"
        style={{
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 1310,
          width: "min(78dvw, 390px)",
          maxWidth: "calc(100dvw - 96px)",
          height: "100dvh",
          transform: isMobileMenuOpen
            ? "translate3d(0, 0, 0)"
            : "translate3d(100%, 0, 0)",
        }}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-[#dbe7f1] px-4 sm:px-5">
          <BrandLogo compact className="min-w-0" />

          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t("header.closeMenu")}
            onClick={closeMobileMenu}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-button text-navy transition-colors duration-fast hover:bg-primary-light hover:text-primary-dark"
          >
            <X className="h-6 w-6" strokeWidth={2.1} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 sm:px-5">
            <nav className="grid gap-2">
              {HEADER_NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "group flex items-center justify-between gap-4 rounded-lg px-4 py-3.5 text-[16px] font-medium tracking-[-0.01em] transition-all duration-fast",
                      isActive
                        ? "bg-[#eef7ff] text-[#2f91d0] shadow-[inset_0_0_0_1px_rgba(126,191,233,0.34)]"
                        : "text-navy hover:bg-[#f8fbff] hover:text-[#2f91d0]",
                    )}
                  >
                    <span className="inline-flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-200",
                          isActive
                            ? "bg-[#2f91d0]"
                            : "bg-slate-300 group-hover:bg-[#9ed8f4]",
                        )}
                      />

                      <span className="truncate">
                        {t(`header.nav.${item.key}`)}
                      </span>
                    </span>

                    <ChevronRight
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                        isActive
                          ? "translate-x-0 text-[#2f91d0]"
                          : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#2f91d0]",
                      )}
                      strokeWidth={2.2}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="shrink-0 overflow-visible bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 sm:px-5">
            <div className="rounded-[22px] border border-[#dbe7f1] bg-white px-5 py-5 shadow-[0_18px_42px_-34px_rgba(18,45,78,0.24)]">
              <LanguageSwitcher className="w-fit" portal={true} side="top" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-60 w-full bg-white transition-shadow duration-300 ease-out",
          isScrolled
            ? "shadow-[0_10px_28px_-24px_rgba(18,45,78,0.22)]"
            : "shadow-none",
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid min-h-[50px] grid-cols-[minmax(0,auto)_1fr_auto] items-center gap-3 transition-[min-height] duration-300 ease-out lg:min-h-[46px] xl:gap-7">
            <BrandLogo className="min-w-0 shrink-0" />

            <nav className="hidden min-w-0 items-center justify-center lg:flex">
              <div className="flex flex-wrap items-center justify-center gap-1 xl:gap-2">
                {HEADER_NAV_ITEMS.map((item) => {
                  const isActive = isNavItemActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative inline-flex items-center justify-center rounded-md px-2 py-2 text-[15px] font-[550] tracking-normal text-slate-800 transition-colors duration-fast hover:text-primary xl:px-3.5 xl:text-[15.5px]",
                        isActive && "font-semibold text-[#2f91d0]",
                      )}
                    >
                      <span>{t(`header.nav.${item.key}`)}</span>

                      <span
                        className={cn(
                          "pointer-events-none absolute inset-x-2 -bottom-px h-[2px] origin-center rounded-full bg-linear-to-r from-[#7bc7f0] via-[#2f91d0] to-[#7bc7f0] transition-transform duration-300 ease-out xl:inset-x-4",
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                aria-label={t("header.openCart")}
                onClick={openCartDrawer}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-button border border-transparent bg-transparent text-slate-700 transition-all duration-fast hover:bg-primary-light hover:text-primary-dark"
              >
                <ShoppingCart className="h-6 w-6" strokeWidth={1.8} />

                {hasMounted && itemCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f6d76b] px-1 text-[12.5px] font-bold text-navy">
                    {itemCount}
                  </span>
                ) : null}
              </button>

              <LanguageSwitcher compact className="hidden lg:flex" />

              <button
                ref={menuButtonRef}
                type="button"
                aria-label={
                  isMobileMenuOpen
                    ? t("header.closeMenu")
                    : t("header.openMenu")
                }
                aria-controls="mobile-navigation-drawer"
                aria-expanded={isMobileMenuOpen}
                onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                className="inline-flex h-11 w-11 items-center justify-center rounded-button text-navy transition-colors duration-fast hover:bg-primary-light hover:text-primary-dark lg:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" strokeWidth={2.1} />
                ) : (
                  <Menu className="h-6 w-6" strokeWidth={2.1} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {hasMounted && typeof document !== "undefined"
        ? createPortal(mobileDrawer, document.body)
        : mobileDrawer}
    </>
  );
}
