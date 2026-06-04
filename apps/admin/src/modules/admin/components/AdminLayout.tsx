'use client';

import { type CSSProperties, PropsWithChildren, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import LoadingState from '@/common/components/ui/LoadingState';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { cn } from '@/common/utils/cn';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminHeader from '@/modules/admin/components/AdminHeader';
import AdminSidebar from '@/modules/admin/components/AdminSidebar';
import { useAdminAuth } from '@/modules/admin/hooks/useAdminAuth';
import {
  AdminSidebarProvider,
  useAdminSidebar,
} from '@/modules/admin/hooks/useAdminSidebar';

function AdminShell({
  children,
  profileName,
  profileEmail,
  profileRole,
  onLogout,
}: PropsWithChildren<{
  profileName: string | null;
  profileEmail: string;
  profileRole: string | null;
  onLogout: () => void;
}>) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isExpanded, isMobileOpen, closeMobileSidebar } = useAdminSidebar();

  const pageTitle = useMemo(() => {
    const titleMap: Array<{ href: string; label: string }> = [
      { href: ADMIN_ROUTES.dashboard, label: t('sidebar.dashboard') },
      { href: ADMIN_ROUTES.products, label: t('sidebar.products') },
      { href: ADMIN_ROUTES.templates, label: t('sidebar.templates') },
      { href: ADMIN_ROUTES.templateCategories, label: t('sidebar.templateCategories') },
      { href: ADMIN_ROUTES.accessories, label: t('sidebar.accessories') },
      { href: ADMIN_ROUTES.accessoryCategories, label: t('sidebar.accessoryCategories') },
      { href: ADMIN_ROUTES.banners, label: t('sidebar.banners') },
      { href: ADMIN_ROUTES.collections, label: t('sidebar.collections') },
      { href: ADMIN_ROUTES.orders, label: t('sidebar.orders') },
      { href: ADMIN_ROUTES.businessInquiries, label: t('sidebar.businessInquiries') },
      { href: ADMIN_ROUTES.paymentSettings, label: t('sidebar.paymentSettings') },
    ];

    const found = titleMap.find((item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    return found?.label ?? t('header.adminControl');
  }, [pathname, t]);

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded
      ? 'lg:ml-[272px]'
      : 'lg:ml-[92px]';

  const shellCssVariables = {
    '--admin-shell-header-height': '72px',
    '--admin-shell-content-offset': isMobileOpen ? '0px' : isExpanded ? '272px' : '92px',
  } as CSSProperties;

  return (
    <div
      style={shellCssVariables}
      className='min-h-screen overflow-x-clip bg-transparent text-slate-900'
    >
      <AdminSidebar />

      {isMobileOpen ? (
        <button
          type='button'
          aria-label={t('header.closeMenu')}
          className='fixed inset-0 z-40 bg-slate-950/35 transition-opacity lg:hidden'
          onClick={closeMobileSidebar}
        />
      ) : null}

      <div
        className={cn(
          'min-w-0 flex-1 transition-[margin] duration-300 ease-out',
          mainContentMargin,
        )}
      >
        <div className='h-[var(--admin-shell-header-height)] [&>*]:h-full'>
          <AdminHeader
            title={pageTitle}
            profileName={profileName}
            profileEmail={profileEmail}
            profileRole={profileRole}
            onLogout={onLogout}
          />
        </div>

        <main className='min-w-0 bg-transparent'>
          <div className='mx-auto w-full max-w-[1560px] px-4 pb-12 pt-7 sm:px-6 lg:px-7 xl:px-8 2xl:px-10'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const { profile, loading, logout } = useAdminAuth();

  if (loading) {
    return (
      <div className='grid min-h-screen place-items-center bg-transparent px-4'>
        <div className='w-full max-w-md'>
          <LoadingState text={t('header.checkingSession')} />
        </div>
      </div>
    );
  }

  return (
    <AdminSidebarProvider>
      <AdminShell
        profileName={profile?.name ?? null}
        profileEmail={profile?.email ?? '-'}
        profileRole={profile?.role ?? null}
        onLogout={logout}
      >
        {children}
      </AdminShell>
    </AdminSidebarProvider>
  );
}
