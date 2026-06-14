'use client';

import Image from 'next/image';
import { useState } from 'react';
import Dropdown from '@/common/components/ui/Dropdown';
import { cn } from '@/common/utils/cn';
import { type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/useI18n';

const LOCALE_OPTIONS: Array<{
  value: Locale;
  label: string;
  flagSrc: string;
  flagAlt: string;
}> = [
  {
    value: 'vi',
    label: 'Tiếng Việt',
    flagSrc: '/flags/vi.svg',
    flagAlt: 'Cờ Việt Nam',
  },
  {
    value: 'en',
    label: 'English',
    flagSrc: '/flags/en.svg',
    flagAlt: 'English flag',
  },
];

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

function ChevronDownIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-[18px] w-[18px]' aria-hidden='true'>
      <path
        d='M5 7.5L10 12.5L15 7.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = LOCALE_OPTIONS.find((option) => option.value === locale) ?? LOCALE_OPTIONS[0];

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs font-medium text-slate-500',
        compact && 'gap-0 xl:gap-2',
        className,
      )}
    >
      <span className={compact ? 'hidden xl:inline' : ''}>{t('common.language')}</span>

      <Dropdown
        align='right'
        portal
        matchTriggerWidth
        offset={6}
        panelRole='listbox'
        onOpenChange={setOpen}
        className={cn('w-[136px] min-w-[136px]', compact && 'w-[128px] min-w-[128px]')}
        panelClassName='p-1.5'
        trigger={
          <button
            type='button'
            className='admin-control admin-control-md inline-flex h-10 min-h-10 items-center gap-2 rounded-[12px] px-3 text-left text-[13px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
            aria-label={t('common.language')}
          >
            <Image
              src={selected.flagSrc}
              alt={selected.flagAlt}
              width={20}
              height={20}
              className='h-5 w-5 shrink-0 rounded-full object-cover'
            />
            <span className='min-w-0 flex-1 truncate'>{selected.label}</span>
            <span className={cn('shrink-0 text-slate-400 transition-transform duration-150', open && 'rotate-180 text-[var(--admin-primary-strong)]')}>
              <ChevronDownIcon />
            </span>
          </button>
        }
      >
        {({ close }) => (
          <div className='space-y-1'>
            {LOCALE_OPTIONS.map((option) => {
              const active = option.value === locale;

              return (
                <button
                  key={option.value}
                  type='button'
                  role='option'
                  aria-selected={active}
                  className={cn(
                    'flex min-h-10 w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-semibold transition-colors duration-150',
                    active
                      ? 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)]'
                      : 'text-slate-700 hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]',
                  )}
                  onClick={() => {
                    setLocale(option.value);
                    close();
                  }}
                >
                  <Image
                    src={option.flagSrc}
                    alt={option.flagAlt}
                    width={20}
                    height={20}
                    className='h-5 w-5 shrink-0 rounded-full object-cover'
                  />
                  <span className='min-w-0 flex-1 truncate'>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </Dropdown>
    </div>
  );
}
