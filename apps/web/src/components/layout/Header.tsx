"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@lego-shop/ui";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Badge } from "@/components/ui/Badge";
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

const STUDIO_NAV_ITEMS = [
  {
    key: "frame",
    href: ROUTES.studioFrame,
  },
  {
    key: "character",
    href: ROUTES.studioCharacter,
  },
] as const;

const COLLECTION_NAV_ITEMS = [
  {
    key: "templates",
    href: ROUTES.collection,
  },
  {
    key: "characters",
    href: `${ROUTES.collection}?type=characters`,
  },
  {
    key: "parts",
    href: `${ROUTES.collection}?type=parts`,
  },
] as const;

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
  const [isStudioMenuOpen, setIsStudioMenuOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [activeDesktopMenuItem, setActiveDesktopMenuItem] = useState<
    string | null
  >(null);
  const [isMobileStudioOpen, setIsMobileStudioOpen] = useState(false);
  const [isMobileCollectionOpen, setIsMobileCollectionOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const studioMenuRef = useRef<HTMLDivElement>(null);
  const studioToggleRef = useRef<HTMLButtonElement>(null);
  const collectionMenuRef = useRef<HTMLDivElement>(null);
  const collectionToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHasMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      closeMobileMenu();
      setIsStudioMenuOpen(false);
      setIsCollectionMenuOpen(false);
      setActiveDesktopMenuItem(null);
      setIsMobileStudioOpen(false);
      setIsMobileCollectionOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [closeMobileMenu, pathname]);

  useEffect(() => {
    if (!isStudioMenuOpen) return;

    const closeStudioMenu = (event: PointerEvent) => {
      if (!studioMenuRef.current?.contains(event.target as Node)) {
        setIsStudioMenuOpen(false);
        setActiveDesktopMenuItem(null);
      }
    };
    const handleStudioKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStudioMenuOpen(false);
        setActiveDesktopMenuItem(null);
        studioToggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeStudioMenu);
    document.addEventListener("keydown", handleStudioKeys);
    return () => {
      document.removeEventListener("pointerdown", closeStudioMenu);
      document.removeEventListener("keydown", handleStudioKeys);
    };
  }, [isStudioMenuOpen]);

  useEffect(() => {
    if (!isCollectionMenuOpen) return;

    const closeCollectionMenu = (event: PointerEvent) => {
      if (!collectionMenuRef.current?.contains(event.target as Node)) {
        setIsCollectionMenuOpen(false);
        setActiveDesktopMenuItem(null);
      }
    };
    const handleCollectionKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCollectionMenuOpen(false);
        setActiveDesktopMenuItem(null);
        collectionToggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeCollectionMenu);
    document.addEventListener("keydown", handleCollectionKeys);
    return () => {
      document.removeEventListener("pointerdown", closeCollectionMenu);
      document.removeEventListener("keydown", handleCollectionKeys);
    };
  }, [isCollectionMenuOpen]);

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
      className="fixed inset-0 overflow-hidden lg:hidden"
      style={{
        zIndex: 1300,
        pointerEvents: isMobileMenuOpen ? "auto" : "none",
      }}
      aria-hidden={!isMobileMenuOpen}
      inert={!isMobileMenuOpen}
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

                if (item.key === "studio") {
                  return (
                    <div key={item.href} className="grid gap-1">
                      <button
                        type="button"
                        aria-label={t("header.studioMenu.open")}
                        aria-expanded={isMobileStudioOpen}
                        aria-controls="mobile-studio-navigation"
                        onClick={() => {
                          setIsMobileCollectionOpen(false);
                          setIsMobileStudioOpen((current) => !current);
                        }}
                        className={cn(
                          "flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[16px] font-medium transition-colors duration-fast",
                          isActive || isMobileStudioOpen
                            ? "bg-[#eef7ff] text-[#2f91d0]"
                            : "text-navy hover:bg-[#f8fbff] hover:text-[#2f91d0]",
                        )}
                      >
                        <span
                          className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full",
                            isActive ? "bg-[#2f91d0]" : "bg-slate-300",
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {t("header.nav.studio")}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform duration-200",
                            isMobileStudioOpen && "rotate-180",
                          )}
                        />
                      </button>

                      <div
                        id="mobile-studio-navigation"
                        className={cn(
                          "grid overflow-hidden pl-4 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                          isMobileStudioOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="min-h-0">
                          <div className="grid gap-1 border-l border-[#dbe7f1] py-1 pl-3">
                            {STUDIO_NAV_ITEMS.map(
                              ({ key: studioMode, href }) => (
                                <Link
                                  key={studioMode}
                                  href={href}
                                  onClick={closeMobileMenu}
                                  className={cn(
                                    "flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                                    isNavItemActive(pathname, href)
                                      ? "bg-[#eef7ff] text-primary"
                                      : "text-slate-700 hover:bg-slate-50 hover:text-primary",
                                  )}
                                >
                                  {t(`header.studioMenu.${studioMode}.title`)}
                                </Link>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.key === "legoFrame") {
                  return (
                    <div key={item.href} className="grid gap-1">
                      <button
                        type="button"
                        aria-label={t("header.collectionMenu.open")}
                        aria-expanded={isMobileCollectionOpen}
                        aria-controls="mobile-collection-navigation"
                        onClick={() => {
                          setIsMobileStudioOpen(false);
                          setIsMobileCollectionOpen((current) => !current);
                        }}
                        className={cn(
                          "flex min-h-12 w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[16px] font-medium transition-colors duration-fast",
                          isActive || isMobileCollectionOpen
                            ? "bg-[#eef7ff] text-[#2f91d0]"
                            : "text-navy hover:bg-[#f8fbff] hover:text-[#2f91d0]",
                        )}
                      >
                        <span
                          className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full",
                            isActive ? "bg-[#2f91d0]" : "bg-slate-300",
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {t("header.nav.legoFrame")}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform duration-200",
                            isMobileCollectionOpen && "rotate-180",
                          )}
                        />
                      </button>

                      <div
                        id="mobile-collection-navigation"
                        className={cn(
                          "grid overflow-hidden pl-4 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                          isMobileCollectionOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="min-h-0">
                          <div className="grid gap-1 border-l border-[#dbe7f1] py-1 pl-3">
                            {COLLECTION_NAV_ITEMS.map(
                              ({ key: collectionMode, href }) => (
                                <Link
                                  key={collectionMode}
                                  href={href}
                                  onClick={() => {
                                    setIsMobileCollectionOpen(false);
                                    closeMobileMenu();
                                  }}
                                  className="flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#eef7ff] hover:text-primary"
                                >
                                  {t(`header.collectionMenu.${collectionMode}`)}
                                </Link>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

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
          "fixed inset-x-0 top-0 z-60 w-full border-b border-[#e3edf4] bg-white transition-[border-color,box-shadow] duration-300 ease-out",
          isScrolled
            ? "border-[#d7e5ee] shadow-[0_8px_24px_-22px_rgba(18,45,78,0.28)]"
            : "shadow-[0_2px_10px_-8px_rgba(18,45,78,0.16)]",
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid min-h-[62px] grid-cols-[minmax(0,auto)_1fr_auto] items-center gap-3 transition-[min-height] duration-300 ease-out lg:min-h-[46px] xl:gap-7">
            <BrandLogo className="min-w-0 shrink-0" />

            <nav className="hidden min-w-0 items-center justify-center lg:flex">
              <div className="flex flex-wrap items-center justify-center gap-1 xl:gap-2">
                {HEADER_NAV_ITEMS.map((item) => {
                  const isActive = isNavItemActive(pathname, item.href);

                  if (item.key === "studio") {
                    return (
                      <div
                        key={item.href}
                        ref={studioMenuRef}
                        className="relative flex items-center"
                        onMouseEnter={() => {
                          setIsCollectionMenuOpen(false);
                          setIsStudioMenuOpen(true);
                          setActiveDesktopMenuItem(null);
                        }}
                        onMouseLeave={() => {
                          setIsStudioMenuOpen(false);
                          setActiveDesktopMenuItem(null);
                        }}
                      >
                        <button
                          ref={studioToggleRef}
                          type="button"
                          aria-label={t("header.studioMenu.open")}
                          aria-haspopup="menu"
                          aria-expanded={isStudioMenuOpen}
                          onMouseEnter={() => setActiveDesktopMenuItem(null)}
                          onClick={() => {
                            setIsCollectionMenuOpen(false);
                            setActiveDesktopMenuItem(null);
                            setIsStudioMenuOpen((current) => !current);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "ArrowDown") {
                              event.preventDefault();
                              setIsStudioMenuOpen(true);
                              window.requestAnimationFrame(() => {
                                studioMenuRef.current
                                  ?.querySelector<HTMLAnchorElement>(
                                    '[role="menuitem"]',
                                  )
                                  ?.focus();
                              });
                            }
                          }}
                          className={cn(
                            "group relative inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[15px] font-[550] tracking-normal text-slate-800 transition-colors duration-fast hover:text-primary xl:px-3.5 xl:text-[15.5px]",
                            (isActive || isStudioMenuOpen) &&
                              activeDesktopMenuItem === null &&
                              "font-semibold text-[#2f91d0]",
                          )}
                        >
                          <span>{t("header.nav.studio")}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200",
                              isStudioMenuOpen && "rotate-180",
                            )}
                            strokeWidth={2}
                          />
                          <span
                            className={cn(
                              "pointer-events-none absolute inset-x-2 -bottom-px h-[2px] origin-center rounded-full bg-linear-to-r from-[#7bc7f0] via-[#2f91d0] to-[#7bc7f0] transition-transform duration-300 ease-out xl:inset-x-4",
                              (isActive || isStudioMenuOpen) &&
                                activeDesktopMenuItem === null
                                ? "scale-x-100"
                                : "scale-x-0 group-hover:scale-x-100",
                            )}
                          />
                        </button>

                        <div
                          className={cn(
                            "absolute left-0 top-full z-80 w-max min-w-full pt-[9px] transition-[opacity,visibility] duration-150 ease-out motion-reduce:transition-none",
                            isStudioMenuOpen
                              ? "visible opacity-100"
                              : "invisible opacity-0",
                          )}
                        >
                          <div
                            role="menu"
                            aria-label={t("header.nav.studio")}
                            className="rounded-[16px] border border-[#d7e5ee] bg-white p-2 shadow-[0_18px_42px_-28px_rgba(18,45,78,0.34)]"
                          >
                            {STUDIO_NAV_ITEMS.map(
                              ({ key: studioMode, href }) => {
                                const menuItemKey = `studio-${studioMode}`;
                                const isMenuItemActive =
                                  activeDesktopMenuItem === menuItemKey;

                                return (
                                  <Link
                                    key={studioMode}
                                    role="menuitem"
                                    href={href}
                                    onMouseEnter={() =>
                                      setActiveDesktopMenuItem(menuItemKey)
                                    }
                                    onMouseLeave={() =>
                                      setActiveDesktopMenuItem(null)
                                    }
                                    onFocus={() =>
                                      setActiveDesktopMenuItem(menuItemKey)
                                    }
                                    onBlur={() =>
                                      setActiveDesktopMenuItem(null)
                                    }
                                    onClick={() => {
                                      setIsStudioMenuOpen(false);
                                      setActiveDesktopMenuItem(null);
                                    }}
                                    className={cn(
                                      "flex min-h-11 items-center whitespace-nowrap rounded-[11px] px-3 py-2.5 text-[14.5px] font-semibold text-slate-700 outline-none transition-colors hover:text-primary focus-visible:text-primary",
                                      isMenuItemActive && "text-primary",
                                    )}
                                  >
                                    <span className="relative">
                                      {t(
                                        `header.studioMenu.${studioMode}.title`,
                                      )}
                                      <span
                                        className={cn(
                                          "pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] origin-center rounded-full bg-linear-to-r from-[#7bc7f0] via-[#2f91d0] to-[#7bc7f0] transition-transform duration-300 ease-out",
                                          isMenuItemActive
                                            ? "scale-x-100"
                                            : "scale-x-0",
                                        )}
                                      />
                                    </span>
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item.key === "legoFrame") {
                    return (
                      <div
                        key={item.href}
                        ref={collectionMenuRef}
                        className="relative flex items-center"
                        onMouseEnter={() => {
                          setIsStudioMenuOpen(false);
                          setIsCollectionMenuOpen(true);
                          setActiveDesktopMenuItem(null);
                        }}
                        onMouseLeave={() => {
                          setIsCollectionMenuOpen(false);
                          setActiveDesktopMenuItem(null);
                        }}
                      >
                        <button
                          ref={collectionToggleRef}
                          type="button"
                          aria-label={t("header.collectionMenu.open")}
                          aria-haspopup="menu"
                          aria-expanded={isCollectionMenuOpen}
                          onMouseEnter={() => setActiveDesktopMenuItem(null)}
                          onClick={() => {
                            setIsStudioMenuOpen(false);
                            setActiveDesktopMenuItem(null);
                            setIsCollectionMenuOpen((current) => !current);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "ArrowDown") {
                              event.preventDefault();
                              setIsCollectionMenuOpen(true);
                              window.requestAnimationFrame(() => {
                                collectionMenuRef.current
                                  ?.querySelector<HTMLAnchorElement>(
                                    '[role="menuitem"]',
                                  )
                                  ?.focus();
                              });
                            }
                          }}
                          className={cn(
                            "group relative inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[15px] font-[550] tracking-normal text-slate-800 transition-colors duration-fast hover:text-primary xl:px-3.5 xl:text-[15.5px]",
                            (isActive || isCollectionMenuOpen) &&
                              activeDesktopMenuItem === null &&
                              "font-semibold text-[#2f91d0]",
                          )}
                        >
                          <span>{t("header.nav.legoFrame")}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200",
                              isCollectionMenuOpen && "rotate-180",
                            )}
                            strokeWidth={2}
                          />
                          <span
                            className={cn(
                              "pointer-events-none absolute inset-x-2 -bottom-px h-[2px] origin-center rounded-full bg-linear-to-r from-[#7bc7f0] via-[#2f91d0] to-[#7bc7f0] transition-transform duration-300 ease-out xl:inset-x-4",
                              (isActive || isCollectionMenuOpen) &&
                                activeDesktopMenuItem === null
                                ? "scale-x-100"
                                : "scale-x-0 group-hover:scale-x-100",
                            )}
                          />
                        </button>

                        <div
                          className={cn(
                            "absolute left-0 top-full z-80 w-max min-w-full pt-[9px] transition-[opacity,visibility] duration-150 ease-out motion-reduce:transition-none",
                            isCollectionMenuOpen
                              ? "visible opacity-100"
                              : "invisible opacity-0",
                          )}
                        >
                          <div
                            role="menu"
                            aria-label={t("header.nav.legoFrame")}
                            className="rounded-[16px] border border-[#d7e5ee] bg-white p-2 shadow-[0_20px_48px_-28px_rgba(18,45,78,0.38)]"
                          >
                            {COLLECTION_NAV_ITEMS.map(
                              ({ key: collectionMode, href }) => {
                                const menuItemKey = `collection-${collectionMode}`;
                                const isMenuItemActive =
                                  activeDesktopMenuItem === menuItemKey;

                                return (
                                  <Link
                                    key={collectionMode}
                                    role="menuitem"
                                    href={href}
                                    onMouseEnter={() =>
                                      setActiveDesktopMenuItem(menuItemKey)
                                    }
                                    onMouseLeave={() =>
                                      setActiveDesktopMenuItem(null)
                                    }
                                    onFocus={() =>
                                      setActiveDesktopMenuItem(menuItemKey)
                                    }
                                    onBlur={() =>
                                      setActiveDesktopMenuItem(null)
                                    }
                                    onClick={() => {
                                      setIsCollectionMenuOpen(false);
                                      setActiveDesktopMenuItem(null);
                                    }}
                                    className={cn(
                                      "flex min-h-11 items-center whitespace-nowrap rounded-[11px] px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors hover:text-primary focus-visible:text-primary",
                                      isMenuItemActive && "text-primary",
                                    )}
                                  >
                                    <span className="relative">
                                      {t(
                                        `header.collectionMenu.${collectionMode}`,
                                      )}
                                      <span
                                        className={cn(
                                          "pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] origin-center rounded-full bg-linear-to-r from-[#7bc7f0] via-[#2f91d0] to-[#7bc7f0] transition-transform duration-300 ease-out",
                                          isMenuItemActive
                                            ? "scale-x-100"
                                            : "scale-x-0",
                                        )}
                                      />
                                    </span>
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

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
                  <Badge
                    variant="highlight"
                    size="sm"
                    className="absolute -right-1 -top-1 h-6 min-w-6 justify-center px-1 text-[12.5px] font-bold"
                  >
                    {itemCount}
                  </Badge>
                ) : null}
              </button>

              <LanguageSwitcher
                compact
                className="hidden lg:ml-3 lg:flex xl:ml-4"
              />

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
