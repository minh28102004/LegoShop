'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Dropdown from '@/common/components/ui/Dropdown';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminAvatar from '@/modules/admin/components/AdminAvatar';

type UserRole = 'ADMIN' | 'STAFF' | 'USER' | 'HOST';

type AdminUserDropdownProps = {
  profileName: string | null;
  profileEmail: string;
  profileRole?: string | null;
  avatarUrl?: string | null;
  onLogout: () => void;
};

function ChevronDownIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M5 7.5L10 12.5L15 7.5'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M8 5.5L12.5 10L8 14.5'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='currentColor' className='h-3 w-3' aria-hidden='true'>
      <path d='M10 1.67L11.82 6.06L16.21 7.88L11.82 9.7L10 14.09L8.18 9.7L3.79 7.88L8.18 6.06L10 1.67Z' />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M10 10.25C12.07 10.25 13.75 8.57 13.75 6.5C13.75 4.43 12.07 2.75 10 2.75C7.93 2.75 6.25 4.43 6.25 6.5C6.25 8.57 7.93 10.25 10 10.25Z'
        stroke='currentColor'
        strokeWidth='1.55'
      />
      <path
        d='M3.75 16.75C4.78 14.56 7.16 13.25 10 13.25C12.84 13.25 15.22 14.56 16.25 16.75'
        stroke='currentColor'
        strokeWidth='1.55'
        strokeLinecap='round'
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <circle cx='10' cy='10' r='2.1' stroke='currentColor' strokeWidth='1.55' />
      <path
        d='M16.17 11.08C16.24 10.74 16.28 10.38 16.28 10C16.28 9.62 16.24 9.26 16.17 8.92L17.65 7.77L16.23 5.32L14.45 5.92C13.92 5.47 13.29 5.12 12.59 4.91L12.25 3H9.42L9.08 4.91C8.38 5.12 7.75 5.47 7.22 5.92L5.44 5.32L4.02 7.77L5.5 8.92C5.43 9.26 5.39 9.62 5.39 10C5.39 10.38 5.43 10.74 5.5 11.08L4.02 12.23L5.44 14.68L7.22 14.08C7.75 14.53 8.38 14.88 9.08 15.09L9.42 17H12.25L12.59 15.09C13.29 14.88 13.92 14.53 14.45 14.08L16.23 14.68L17.65 12.23L16.17 11.08Z'
        stroke='currentColor'
        strokeWidth='1.15'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function KeyRoundIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M7.5 12.5C5.43 12.5 3.75 10.82 3.75 8.75C3.75 6.68 5.43 5 7.5 5C9.57 5 11.25 6.68 11.25 8.75C11.25 9.2 11.17 9.62 11.03 10.02L16.25 15.24V17.08H14.17V15H12.08V12.92H10.24L9.98 12.66C9.22 13.09 8.41 12.5 7.5 12.5Z'
        stroke='currentColor'
        strokeWidth='1.45'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M7.5 8.75H7.51'
        stroke='currentColor'
        strokeWidth='2.4'
        strokeLinecap='round'
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M7.5 4.17H5.83C4.91 4.17 4.17 4.91 4.17 5.83V14.17C4.17 15.09 4.91 15.83 5.83 15.83H7.5'
        stroke='currentColor'
        strokeWidth='1.55'
        strokeLinecap='round'
      />
      <path
        d='M10.83 13.33L14.17 10L10.83 6.67'
        stroke='currentColor'
        strokeWidth='1.55'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M14.17 10H7.5' stroke='currentColor' strokeWidth='1.55' strokeLinecap='round' />
    </svg>
  );
}

const roleBadge = (role: UserRole) => {
  switch (role) {
    case 'ADMIN':
      return { labelKey: 'roles.admin', tone: 'bg-red-600 text-white' };
    case 'STAFF':
      return { labelKey: 'roles.staff', tone: 'bg-[var(--admin-primary)] text-white' };
    case 'HOST':
      return { labelKey: 'roles.host', tone: 'bg-amber-500 text-slate-900' };
    default:
      return { labelKey: 'roles.user', tone: 'bg-slate-600 text-white' };
  }
};

const shortenName = (fullName: string) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts.pop();
  const initials = parts.map((part) => `${part[0].toUpperCase()}.`).join(' ');
  return `${last} ${initials}`.trim();
};

const toRole = (roleLike?: string | null): UserRole => {
  const role = (roleLike ?? '').trim().toUpperCase();
  if (role.includes('ADMIN')) return 'ADMIN';
  if (role.includes('STAFF')) return 'STAFF';
  if (role.includes('HOST')) return 'HOST';
  return 'USER';
};

export default function AdminUserDropdown({
  profileName,
  profileEmail,
  profileRole,
  avatarUrl,
  onLogout,
}: AdminUserDropdownProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName = profileName?.trim() || profileEmail || 'Admin';
  const email = profileEmail?.trim() || '-';
  const role = toRole(profileRole);
  const { labelKey: roleTextKey, tone } = roleBadge(role);
  const roleText = t(roleTextKey);
  const profileLabel = t('account.profileTitle');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  function handleLogout(close: () => void) {
    if (isLoggingOut) return;
    close();
    setIsLoggingOut(true);
    onLogout();
  }

  const menuItems = [
    {
      id: 'profile',
      icon: UserIcon,
      label: profileLabel,
      href: ADMIN_ROUTES.profile,
      colorClass: 'text-slate-700',
      hoverClass: 'hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
      iconClass:
        'bg-slate-100 text-slate-600 group-hover:bg-[var(--admin-primary-tint)] group-hover:text-[var(--admin-primary-strong)]',
    },
    {
      id: 'change-password',
      icon: KeyRoundIcon,
      label: t('account.changePasswordTitle'),
      href: ADMIN_ROUTES.changePassword,
      colorClass: 'text-slate-700',
      hoverClass: 'hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
      iconClass:
        'bg-slate-100 text-slate-600 group-hover:bg-[var(--admin-primary-tint)] group-hover:text-[var(--admin-primary-strong)]',
    },
    {
      id: 'settings',
      icon: SettingsIcon,
      label: t('common.settings'),
      colorClass: 'text-slate-700',
      hoverClass: 'hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
      iconClass:
        'bg-slate-100 text-slate-600 group-hover:bg-[var(--admin-primary-tint)] group-hover:text-[var(--admin-primary-strong)]',
    },
  ];

  return (
    <Dropdown
      key={pathname}
      onOpenChange={(next) => setOpen(next)}
      trigger={
        <button
          type='button'
          className={`group relative z-[89] flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-3 py-1.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)] ${
            isLoggingOut
              ? 'cursor-wait opacity-90'
              : open
                ? 'shadow-md ring-1 ring-[var(--admin-primary-tint)]'
                : 'hover:shadow-md'
          }`}
          aria-busy={isLoggingOut}
          aria-label={t('common.account')}
          disabled={isLoggingOut}
        >
          <span
            aria-hidden
            className='pointer-events-none absolute inset-0 rounded-full ring-1 ring-[var(--admin-primary-tint)] transition group-hover:ring-[var(--admin-primary)]'
          />

          <div className='relative flex items-center gap-2'>
            <div className='relative'>
              <AdminAvatar
                src={avatarUrl}
                name={fullName}
                email={email}
                size={32}
                status='online'
                ringClassName='ring-2 ring-white'
              />

              {!isLoggingOut ? (
                <motion.span
                  initial={false}
                  animate={open ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className='absolute -right-1 -top-1 text-amber-500'
                >
                  <SparkleIcon />
                </motion.span>
              ) : null}
            </div>

            <span
              className={`hidden max-w-[150px] truncate text-[14px] font-medium md:block ${
                isLoggingOut ? 'text-[var(--admin-primary-strong)]' : 'text-slate-700 group-hover:text-slate-900'
              }`}
              title={fullName || email}
            >
              {isLoggingOut ? t('common.loggingOut') : fullName ? shortenName(fullName) : email}
            </span>

            {!isLoggingOut ? (
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='text-slate-500 transition-colors group-hover:text-slate-700'
              >
                <ChevronDownIcon />
              </motion.span>
            ) : null}
          </div>
        </button>
      }
      panelClassName='w-[248px] max-w-[calc(100vw-24px)] border-0 bg-transparent shadow-none'
    >
      {({ close, open: dropdownOpen }) => (
        <AnimatePresence initial={false}>
          {dropdownOpen ? (
            <motion.div
              key='admin-account-menu'
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
              className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className='border-b border-slate-100 bg-linear-to-br from-sky-50 via-purple-50 to-pink-50 px-6 py-3'>
                <p className='mb-0.5 truncate text-base font-semibold leading-6 text-slate-900'>
                  {fullName || t('common.account')}
                </p>
                <p className='mb-2 truncate text-xs leading-5 text-slate-600'>{email}</p>
                <motion.span
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${tone}`}
                  title={roleText}
                >
                  <span className='h-1.5 w-1.5 rounded-full bg-white' />
                  {roleText}
                </motion.span>
              </div>

              <nav className='px-2 py-1.5'>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 * index,
                      type: 'spring',
                      stiffness: 300,
                    }}
                  >
                    <motion.div
                      initial='rest'
                      whileHover='hover'
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => close()}
                          className={`group flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)] ${item.colorClass} ${item.hoverClass}`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${item.iconClass}`}
                          >
                            <item.icon />
                          </div>
                          <span className='min-w-0 flex-1 truncate'>{item.label}</span>
                          <motion.span
                            className='ml-auto text-slate-400'
                            variants={{
                              rest: { x: -5, opacity: 0 },
                              hover: { x: 0, opacity: 1 },
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                          >
                            <ChevronRightIcon />
                          </motion.span>
                        </Link>
                      ) : (
                        <button
                          type='button'
                          onClick={() => close()}
                          className={`group flex w-full items-center gap-3 rounded-md px-4 py-2 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)] ${item.colorClass} ${item.hoverClass}`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${item.iconClass}`}
                          >
                            <item.icon />
                          </div>
                          <span className='min-w-0 flex-1 truncate'>{item.label}</span>
                          <motion.span
                            className='ml-auto text-slate-400'
                            variants={{
                              rest: { x: -5, opacity: 0 },
                              hover: { x: 0, opacity: 1 },
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                          >
                            <ChevronRightIcon />
                          </motion.span>
                        </button>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </nav>

              <div className='mx-4 border-t border-slate-100' />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='px-2 py-1.5'
              >
                <motion.button
                  type='button'
                  onClick={() => handleLogout(close)}
                  initial='rest'
                  whileHover='hover'
                  className='group flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100'
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 transition-colors duration-200 group-hover:bg-red-100'>
                    <LogoutIcon />
                  </div>
                  <span className='font-medium'>{t('common.logout')}</span>
                  <motion.span
                    className='ml-auto text-red-400'
                    variants={{
                      rest: { x: 0, opacity: 0.7 },
                      hover: { x: 6, opacity: 1 },
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  >
                    <ChevronRightIcon />
                  </motion.span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </Dropdown>
  );
}
