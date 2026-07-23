'use client';

import { useState } from 'react';
import { BellRing, Dot } from 'lucide-react';
import Dropdown from '@/common/components/ui/Dropdown';
import { useI18n } from '@/lib/i18n/useI18n';

function BellIcon() {
  return (
    <BellRing className='h-[18px] w-[18px]' strokeWidth={1.9} aria-hidden='true' />
  );
}

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
}

function NotificationGlyph({ tone }: { tone: 'amber' | 'blue' | 'emerald' }) {
  const toneMap = {
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)]',
    emerald: 'bg-emerald-100 text-emerald-600',
  } as const;

  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${toneMap[tone]}`}
    >
      <BellIcon />
    </span>
  );
}

type NotificationTone = 'amber' | 'blue' | 'emerald';

export default function AdminNotificationDropdown() {
  const { t } = useI18n();
  const [notifying, setNotifying] = useState(true);

  const items: Array<{ id: string; label: string; tone: NotificationTone }> = [
    { id: 'new-order', label: t('notifications.newOrder'), tone: 'amber' },
    { id: 'business-inquiry', label: t('notifications.businessInquiry'), tone: 'blue' },
    {
      id: 'payment-settings-updated',
      label: t('notifications.paymentSettingsUpdated'),
      tone: 'emerald',
    },
  ];
  const unreadCount = items.length;

  return (
    <Dropdown
      align='right'
      onOpenChange={(open) => {
        if (open) setNotifying(false);
      }}
      trigger={
        <button
          type='button'
          className='group relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-slate-500 shadow-[0_14px_28px_-22px_rgba(15,23,42,0.26),0_2px_8px_rgba(15,23,42,0.05)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-[var(--admin-primary-strong)] hover:shadow-[0_18px_34px_-22px_rgba(47,145,208,0.28),0_6px_12px_rgba(47,145,208,0.08)] active:scale-[0.98] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]'
          aria-label={t('common.notifications')}
        >
          {notifying && unreadCount > 0 ? (
            <span className='absolute -right-1 -top-1 z-10 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-[0_8px_16px_-12px_rgba(239,68,68,0.8)] ring-2 ring-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
          <span className='transition-transform duration-200 ease-out group-hover:rotate-[-14deg]'>
            <BellIcon />
          </span>
        </button>
      }
      panelClassName='w-[320px] max-w-[calc(100vw-24px)] rounded-[20px]'
    >
      {({ close }) => (
        <div className='flex h-[380px] flex-col bg-white p-3'>
          <div className='mb-3 flex items-center justify-between border-b border-slate-100 px-1 pb-3'>
            <h5 className='text-base font-semibold text-slate-900'>{t('common.notifications')}</h5>
            <button
              type='button'
              onClick={close}
              className='rounded-[10px] p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100'
              aria-label={t('common.close')}
              >
                <CloseIcon />
              </button>
            </div>

          <ul className='admin-scrollbar flex h-auto flex-col overflow-y-auto pr-1'>
            {items.length === 0 ? (
              <li className='grid flex-1 place-items-center px-4 py-10 text-center text-sm text-slate-500'>
                {t('common.noNotifications')}
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type='button'
                    onClick={close}
                    className='flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors hover:border-[var(--admin-primary-tint)] hover:bg-[var(--admin-primary-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]'
                  >
                    <NotificationGlyph tone={item.tone} />
                    <span className='block min-w-0'>
                      <span className='mb-1 block text-sm font-medium leading-6 text-slate-800'>
                        {item.label}
                      </span>
                      <span className='flex items-center gap-2 text-xs text-slate-500'>
                        <span>{t('common.notifications')}</span>
                        <Dot className='h-3.5 w-3.5 text-slate-300' />
                        <span>{t('notifications.justNow')}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </Dropdown>
  );
}
