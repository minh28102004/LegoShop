'use client';

import Link from 'next/link';
import Button from '@/common/components/ui/Button';
import AdminNotificationDropdown from '@/modules/admin/components/AdminNotificationDropdown';
import AdminUserDropdown from '@/modules/admin/components/AdminUserDropdown';
import LanguageSwitcher from '@/modules/admin/components/LanguageSwitcher';
import { useAdminSidebar } from '@/modules/admin/hooks/useAdminSidebar';
import { useI18n } from '@/lib/i18n/useI18n';

type AdminHeaderProps = {
  title: string;
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

export default function AdminHeader({
  title,
  profileName,
  profileEmail,
  profileRole,
  onLogout,
}: AdminHeaderProps) {
  const { t } = useI18n();
  const { toggleMobileSidebar } = useAdminSidebar();

  return (
    <header className='sticky top-0 z-30 border-b border-slate-200 bg-white'>
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

          <div className='min-w-0 space-y-0.5'>
            <p className='truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500'>
              Lego Shop
            </p>
            <h1 className='truncate text-[18px] font-semibold leading-6 text-slate-900 sm:text-[20px]'>
              {title}
            </h1>
          </div>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <Link
            href='/'
            className='hidden h-10 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 xl:inline-flex'
          >
            {t('header.viewWebsite')}
            <ExternalIcon />
          </Link>

          <div className='hidden md:block'>
            <LanguageSwitcher compact />
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
