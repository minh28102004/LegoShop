'use client';

import Link from 'next/link';
import { Button } from '@lego-shop/ui';
import AdminNotificationDropdown from '@/modules/admin/components/AdminNotificationDropdown';
import AdminUserDropdown from '@/modules/admin/components/AdminUserDropdown';
import LanguageSwitcher from '@/modules/admin/components/LanguageSwitcher';
import { useAdminSidebar } from '@/modules/admin/hooks/useAdminSidebar';
import { useI18n } from '@/lib/i18n/useI18n';

const PUBLIC_WEBSITE_URL = 'https://figurelab.vn';

type AdminHeaderProps = {
  breadcrumbs: Array<{
    href?: string;
    label: string;
  }>;
  profileName: string | null;
  profileEmail: string;
  profileRole: string | null;
  onLogout: () => void;
};

function MenuIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M4 7H20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
      <path d='M4 12H20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
      <path d='M4 17H20' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M14 5H19V10M10 14L19 5M19 14V18C19 18.55 18.55 19 18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H10'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function BreadcrumbSeparator() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-3.5 w-3.5 text-slate-400' aria-hidden='true'>
      <path d='M7.5 4.5L12.5 10L7.5 15.5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

export default function AdminHeader({
  breadcrumbs,
  profileName,
  profileEmail,
  profileRole,
  onLogout,
}: AdminHeaderProps) {
  const { t } = useI18n();
  const { toggleMobileSidebar } = useAdminSidebar();

  return (
    <header className='sticky top-0 z-30 bg-white shadow-[0_12px_28px_-26px_rgba(15,23,42,0.42)]'>
      <div className='mx-auto flex h-full max-w-[1560px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-7 xl:px-8 2xl:px-10'>
        <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
          <Button
            variant='secondary'
            className='h-10 rounded-[12px] px-2.5 lg:hidden'
            onClick={toggleMobileSidebar}
            aria-label={t('common.menu')}
          >
            <MenuIcon />
          </Button>

          <nav className='min-w-0' aria-label='Breadcrumb'>
            <ol className='flex min-w-0 items-center gap-1 text-sm font-semibold text-slate-500'>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <li key={`${item.label}-${index}`} className='flex min-w-0 items-center gap-1'>
                    {index > 0 ? <BreadcrumbSeparator /> : null}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className='min-w-0 truncate rounded-lg px-1 py-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800'
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className='min-w-0 truncate px-1 py-0.5 text-sm font-semibold leading-5 text-slate-600'>
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <a
            href={PUBLIC_WEBSITE_URL}
            target='_blank'
            rel='noreferrer'
            className='group hidden h-10 items-center gap-2 rounded-[14px] border border-sky-100 bg-white px-3.5 text-[13px] font-semibold text-slate-700 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.24),0_2px_6px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--admin-primary-tint)] hover:bg-white hover:text-[var(--admin-primary-strong)] hover:shadow-[0_18px_38px_-24px_rgba(47,145,208,0.3),0_6px_12px_rgba(47,145,208,0.08)] active:translate-y-0 active:shadow-[0_12px_24px_-22px_rgba(47,145,208,0.24)] xl:inline-flex'
          >
            {t('header.viewWebsite')}
            <span className='transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'>
              <ExternalIcon />
            </span>
          </a>

          <div className='hidden md:block'>
            <LanguageSwitcher />
          </div>

          <AdminNotificationDropdown />

          <AdminUserDropdown
            profileName={profileName}
            profileEmail={profileEmail}
            profileRole={profileRole}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
