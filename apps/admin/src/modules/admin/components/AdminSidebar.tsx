'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ADMIN_NAV_SECTIONS,
  ADMIN_ROUTES,
} from '@/common/constants/routes';
import Tooltip from '@/common/components/ui/Tooltip';
import { cn } from '@/common/utils/cn';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import { useAdminSidebar } from '@/modules/admin/hooks/useAdminSidebar';

const sidebarItemBaseClass =
  'group relative flex min-h-[44px] w-full min-w-0 max-w-full items-center gap-[10px] overflow-hidden rounded-[13px] border border-transparent px-[10px] outline-none transition-all duration-200 ease-out hover:translate-x-0.5 active:translate-x-0';

const sidebarFocusClass =
  'focus-visible:border-[var(--admin-primary)] focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]';

const sidebarHoverClass =
  'hover:border-[var(--admin-primary-tint)] hover:text-[var(--admin-primary-strong)]';

function normalizePath(path: string) {
  const clean = path.split('?')[0].replace(/\/+$/, '');
  return clean || '/';
}

function isActivePath(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  return current === target || current.startsWith(`${target}/`);
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

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
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
        'admin-sidebar fixed left-0 top-0 z-[60] h-screen max-w-[calc(100vw-24px)] overflow-visible',
        'bg-white text-slate-800 shadow-[14px_0_34px_-30px_rgba(15,23,42,0.34)] transition-all duration-300 ease-out',
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
            'flex h-[var(--admin-shell-header-height)] shrink-0 items-center shadow-[0_12px_22px_-24px_rgba(15,23,42,0.32)] transition-all duration-300 ease-out',
            expanded ? 'px-[18px]' : 'px-3',
          )}
        >
          <Link
            href={ADMIN_ROUTES.dashboard}
            onClick={closeMobileSidebar}
            aria-label={t('sidebar.dashboard')}
            className={cn(
              'mx-auto flex h-[54px] min-w-0 items-center justify-center gap-[13px] rounded-[16px] bg-transparent px-[6px] transition-colors duration-200 hover:bg-[var(--admin-primary-soft)]',
              expanded ? 'w-full justify-start' : 'w-[51px] px-0',
            )}
          >
            <span className='inline-flex h-[47px] w-[47px] shrink-0 items-center justify-center overflow-hidden rounded-[14px]'>
              <Image
                src='/figure-lab-logo.png'
                alt='Figure Lab'
                width={47}
                height={47}
                className='h-full w-full object-cover'
                priority
              />
            </span>
            {expanded ? (
              <span className='min-w-0 overflow-visible py-1 text-left'>
                <span className='block whitespace-nowrap text-[20px] font-semibold leading-[1.35] text-slate-900'>Figure Lab</span>
              </span>
            ) : null}
          </Link>

          {isMobileOpen ? (
            <button
              type='button'
              aria-label={t('header.closeMenu')}
              onClick={closeMobileSidebar}
              className={cn(
                'ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-transparent text-slate-500 lg:hidden',
                'transition-all duration-200 hover:rotate-90 hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]',
              )}
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        <nav
          className='flex-1 overflow-x-hidden overflow-y-auto px-[11px] py-[11px] [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'
          aria-label={t('header.adminControl')}
        >
          <div className='min-w-0 space-y-[14px]'>
            {ADMIN_NAV_SECTIONS.map((section) => (
              <section key={section.id} className='min-w-0 space-y-[6px]'>
                {expanded ? (
                  <div className='px-2'>
                    <p className='text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-slate-500'>
                      {t(section.labelKey)}
                    </p>
                  </div>
                ) : (
                  <div className='mx-2 h-px bg-linear-to-r from-transparent via-slate-200/80 to-transparent' />
                )}

                <div className='min-w-0 space-y-[4px]'>
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const label = t(item.labelKey);

                    const navItem = (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          sidebarItemBaseClass,
                          sidebarFocusClass,
                          active
                            ? 'border-[#4f9ed6] !bg-[#4fa6dc] text-white shadow-[0_14px_26px_-22px_rgba(47,145,208,0.7)] ring-1 ring-[#4f9ed6]/70 hover:!bg-[#4fa6dc]'
                            : cn('border-transparent text-slate-600', sidebarHoverClass),
                          expanded ? 'justify-start' : 'justify-center px-2',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute -left-px inset-y-0 w-1 transition-all duration-200',
                            active ? 'bg-[var(--admin-accent)] opacity-100' : 'bg-transparent opacity-0',
                          )}
                        />

                        <span
                          className={cn(
                            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:scale-[1.02]',
                            active
                              ? 'border border-[var(--admin-accent)] bg-[#ffe16a] text-[#18385a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-[var(--admin-primary-tint)] group-hover:text-[var(--admin-primary-strong)] group-hover:shadow-[inset_0_0_0_1px_rgba(215,239,255,0.95)]',
                          )}
                        >
                          <AdminNavIcon name={item.icon} />
                        </span>

                        {expanded ? (
                          <span className='flex min-w-0 flex-1 items-center text-left'>
                            <span
                              className={cn(
                                'truncate text-[14px] font-medium leading-5 transition-colors duration-200',
                                active ? 'text-white' : 'text-slate-800 group-hover:text-[var(--admin-primary-strong)]',
                              )}
                            >
                              {t(item.labelKey)}
                            </span>
                          </span>
                        ) : null}
                      </Link>
                    );

                    if (expanded) return navItem;

                    return (
                      <Tooltip
                        key={item.id}
                        content={label}
                        placement='right'
                        className='w-full'
                      >
                        {navItem}
                      </Tooltip>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div
          className={cn(
            'shadow-[0_-12px_22px_-24px_rgba(15,23,42,0.32)] transition-all duration-500',
            expanded ? 'px-[15px] py-[13px]' : 'px-[7px] py-[13px]',
          )}
        >
          {expanded ? (
            <div className='space-y-1'>
              <div className='flex items-center justify-center gap-[7px] rounded-[14px] bg-slate-50 px-[9px] py-[7px] shadow-[inset_0_0_0_1px_rgba(226,232,240,0.72)]'>
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
          'transition-all duration-300 ease-out hover:border-[var(--admin-primary-tint)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]',
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
