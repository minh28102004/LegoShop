'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type AdminNavIcon,
  ADMIN_NAV_SECTIONS,
  ADMIN_ROUTES,
} from '@/common/constants/routes';
import { cn } from '@/common/utils/cn';
import { useI18n } from '@/lib/i18n/useI18n';
import { useAdminSidebar } from '@/modules/admin/hooks/useAdminSidebar';

const sidebarItemBaseClass =
  'group relative flex min-h-[55px] w-full min-w-0 max-w-full items-center gap-[9px] overflow-hidden rounded-[14px] border border-transparent bg-transparent px-[11px] outline-none transition-all duration-200 ease-out hover:translate-x-0.5 active:translate-x-0';

const sidebarFocusClass =
  'focus-visible:border-blue-300 focus-visible:ring-4 focus-visible:ring-blue-100';

const sidebarHoverClass =
  'hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700';

function normalizePath(path: string) {
  const clean = path.split('?')[0].replace(/\/+$/, '');
  return clean || '/';
}

function isActivePath(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  return current === target || current.startsWith(`${target}/`);
}

function Icon({ name, className }: { name: AdminNavIcon; className?: string }) {
  const iconClass = className ?? 'h-[18px] w-[18px]';

  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M4 13H10V20H4V13Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M14 4H20V11H14V4Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M14 15H20V20H14V15Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M4 4H10V9H4V4Z' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'products':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M3 8L12 3L21 8L12 13L3 8Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M3 8V16L12 21L21 16V8' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'templates':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='4' y='4' width='16' height='16' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M8 8H16M8 12H16M8 16H13' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
      );
    case 'accessories':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M8 7L12 3L16 7L12 11L8 7Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M7 12L3 16L8 21L12 17L7 12Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M17 12L12 17L16 21L21 16L17 12Z' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'banners':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='3' y='5' width='18' height='14' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M3 10H21' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'collections':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='4' y='6' width='16' height='12' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M9 6V18M15 6V18' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'orders':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M7 5H17V19H7V5Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M10 9H14M10 13H14' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
        </svg>
      );
    case 'businessInquiries':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <path d='M4 6H20V18H4V6Z' stroke='currentColor' strokeWidth='1.8' />
          <path d='M4 8L12 13L20 8' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'paymentSettings':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='1.8' />
          <path
            d='M19.4 15A1 1 0 0 0 19.6 16.1L19.7 16.2A1 1 0 0 1 19.7 17.6L17.6 19.7A1 1 0 0 1 16.2 19.7L16.1 19.6A1 1 0 0 0 15 19.4A1 1 0 0 0 14.4 20.3V20.5A1 1 0 0 1 13.4 21.5H10.6A1 1 0 0 1 9.6 20.5V20.3A1 1 0 0 0 9 19.4A1 1 0 0 0 7.9 19.6L7.8 19.7A1 1 0 0 1 6.4 19.7L4.3 17.6A1 1 0 0 1 4.3 16.2L4.4 16.1A1 1 0 0 0 4.6 15A1 1 0 0 0 3.7 14.4H3.5A1 1 0 0 1 2.5 13.4V10.6A1 1 0 0 1 3.5 9.6H3.7A1 1 0 0 0 4.6 9A1 1 0 0 0 4.4 7.9L4.3 7.8A1 1 0 0 1 4.3 6.4L6.4 4.3A1 1 0 0 1 7.8 4.3L7.9 4.4A1 1 0 0 0 9 4.6A1 1 0 0 0 9.6 3.7V3.5A1 1 0 0 1 10.6 2.5H13.4A1 1 0 0 1 14.4 3.5V3.7A1 1 0 0 0 15 4.6A1 1 0 0 0 16.1 4.4L16.2 4.3A1 1 0 0 1 17.6 4.3L19.7 6.4A1 1 0 0 1 19.7 7.8L19.6 7.9A1 1 0 0 0 19.4 9A1 1 0 0 0 20.3 9.6H20.5A1 1 0 0 1 21.5 10.6V13.4A1 1 0 0 1 20.5 14.4H20.3A1 1 0 0 0 19.4 15Z'
            stroke='currentColor'
            strokeWidth='1.4'
            strokeLinejoin='round'
          />
        </svg>
      );
    case 'frameSizes':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <rect x='3' y='3' width='18' height='18' rx='2' stroke='currentColor' strokeWidth='1.8' />
          <path d='M3 9H21' stroke='currentColor' strokeWidth='1.8' />
          <path d='M9 21V9' stroke='currentColor' strokeWidth='1.8' />
        </svg>
      );
    case 'frameColors':
      return (
        <svg viewBox='0 0 24 24' fill='none' className={iconClass} aria-hidden='true'>
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='1.8' />
          <path d='M12 2A10 10 0 0 0 2 12C2 12 5 13 8 12C11 11 12 8 12 8C12 8 13 11 16 12C19 13 22 12 22 12A10 10 0 0 0 12 2Z' fill='currentColor' />
        </svg>
      );
    default:
      return null;
  }
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
      <path
        d='M15 6L9 12L15 18'
        stroke='currentColor'
        strokeWidth='2.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const {
    isExpanded,
    isMobile,
    isMobileOpen,
    toggleSidebar,
    closeMobileSidebar,
  } = useAdminSidebar();

  const expanded = isExpanded || isMobileOpen;

  return (
    <aside
      className={cn(
        'admin-sidebar fixed left-0 top-0 z-[60] h-screen max-w-[calc(100vw-24px)] overflow-visible border-r border-[var(--admin-border)]',
        'bg-white text-slate-800 shadow-[12px_0_32px_-28px_rgba(15,23,42,0.16)] transition-all duration-300 ease-out',
        expanded ? 'w-[272px]' : 'w-[92px]',
        isMobile
          ? isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
          : 'translate-x-0',
      )}
    >
      <div className='flex h-full min-w-0 flex-col overflow-hidden'>
        <div
          className={cn(
            'flex h-[var(--admin-shell-header-height)] shrink-0 items-center border-b border-slate-200 transition-all duration-300 ease-out',
            expanded ? 'px-[18px]' : 'px-3',
          )}
        >
          <Link
            href={ADMIN_ROUTES.dashboard}
            onClick={closeMobileSidebar}
            aria-label={t('sidebar.dashboard')}
            className={cn(
              'mx-auto flex h-[51px] items-center justify-center gap-[11px] rounded-[18px] border border-slate-200 bg-white px-[13px] shadow-[0_8px_18px_-18px_rgba(15,23,42,0.14)] transition-all duration-200 hover:border-blue-200',
              expanded ? 'w-full justify-start' : 'w-[51px] px-0',
            )}
          >
            <span className='inline-flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-[12px] bg-blue-600 text-xs font-bold tracking-[0.06em] text-white'>
              LS
            </span>
            {expanded ? (
              <span className='min-w-0 text-left'>
                <span className='block truncate text-[15px] font-semibold text-slate-900'>Lego Shop</span>
                <span className='mt-0.5 block truncate text-[11px] text-slate-500'>
                  {t('header.adminControl')}
                </span>
              </span>
            ) : null}
          </Link>
        </div>

        <nav
          className='flex-1 overflow-x-hidden overflow-y-auto px-[11px] py-[11px] [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'
          aria-label={t('header.adminControl')}
        >
          <div className='min-w-0 space-y-[17px]'>
            {ADMIN_NAV_SECTIONS.map((section) => (
              <section key={section.id} className='min-w-0 space-y-[7px]'>
                {expanded ? (
                  <div className='px-2'>
                    <p className='text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-slate-500'>
                      {t(section.labelKey)}
                    </p>
                  </div>
                ) : (
                  <div className='mx-2 border-t border-slate-200' />
                )}

                <div className='min-w-0 space-y-[5px]'>
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        title={!expanded ? t(item.labelKey) : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          sidebarItemBaseClass,
                          sidebarFocusClass,
                          active
                            ? 'border-blue-100 bg-blue-50 text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100/70'
                            : cn('border-transparent text-slate-600', sidebarHoverClass),
                          expanded ? 'justify-start' : 'justify-center px-2',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute left-0 top-1/2 h-[31px] w-1 -translate-y-1/2 rounded-r-full transition-all duration-200',
                            active ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0',
                          )}
                        />

                        <span
                          className={cn(
                            'inline-flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[14px] transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:scale-[1.02]',
                            active
                              ? 'bg-white text-blue-600 shadow-[inset_0_0_0_1px_rgba(191,219,254,0.9)] group-hover:bg-blue-50'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:shadow-[inset_0_0_0_1px_rgba(191,219,254,0.9)]',
                          )}
                        >
                          <Icon name={item.icon} />
                        </span>

                        {expanded ? (
                          <span className='flex min-w-0 flex-1 flex-col text-left'>
                            <span
                              className={cn(
                                'truncate text-[14px] font-medium leading-[17px] transition-colors duration-200',
                                active ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-700',
                              )}
                            >
                              {t(item.labelKey)}
                            </span>
                            <span
                              className={cn(
                                'truncate text-[12px] font-normal leading-4 transition-colors duration-200',
                                active
                                  ? 'text-blue-500'
                                  : 'text-slate-500 group-hover:text-blue-500',
                              )}
                            >
                              {t(item.descriptionKey)}
                            </span>
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div
          className={cn(
            'border-t border-slate-200 transition-all duration-500',
            expanded ? 'px-[15px] py-[13px]' : 'px-[7px] py-[13px]',
          )}
        >
          {expanded ? (
            <div className='space-y-1'>
              <div className='flex items-center justify-center gap-[7px] rounded-[14px] border border-slate-200 bg-slate-50 px-[9px] py-[7px]'>
                <div className='h-2 w-2 rounded-full bg-amber-500' />
                <span className='text-[11px] font-medium text-slate-500'>
                  {t('header.systemStatus')}
                </span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-amber-500' />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={toggleSidebar}
        className={cn(
          'pointer-events-auto absolute right-0 top-[calc(var(--admin-shell-header-height)/2)] z-[80] hidden h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full lg:flex',
          'border border-slate-200 bg-white text-slate-500 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)]',
          'transition-all duration-300 ease-out hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100',
        )}
        type='button'
        aria-label={expanded ? t('header.collapseSidebar') : t('header.expandSidebar')}
      >
        <ChevronLeft
          className={cn(
            'h-[18px] w-[18px] transition-transform duration-300 ease-out',
            expanded ? 'rotate-0' : 'rotate-180',
          )}
        />
      </button>
    </aside>
  );
}
