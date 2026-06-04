'use client';

import { useState } from 'react';
import Dropdown from '@/common/components/ui/Dropdown';
import { useI18n } from '@/lib/i18n/useI18n';

function BellIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='currentColor' className='h-5 w-5' aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z'
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
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
}

function NotificationGlyph({ tone }: { tone: 'amber' | 'blue' | 'emerald' }) {
  const toneMap = {
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
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

  return (
    <Dropdown
      align='right'
      onOpenChange={(open) => {
        if (open) setNotifying(false);
      }}
      trigger={
        <button
          type='button'
          className='relative flex h-10 w-10 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100'
          aria-label={t('common.notifications')}
        >
          {notifying ? (
            <span className='absolute right-1.5 top-1.5 z-10 h-2 w-2 rounded-full bg-amber-500' />
          ) : null}
          <BellIcon />
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
              className='rounded-[10px] p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100'
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
                    className='flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors hover:border-slate-100 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100'
                  >
                    <NotificationGlyph tone={item.tone} />
                    <span className='block min-w-0'>
                      <span className='mb-1 block text-sm font-medium leading-6 text-slate-800'>
                        {item.label}
                      </span>
                      <span className='flex items-center gap-2 text-xs text-slate-500'>
                        <span>{t('common.notifications')}</span>
                        <span className='h-1 w-1 rounded-full bg-slate-300' />
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
