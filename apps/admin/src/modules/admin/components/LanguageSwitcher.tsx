'use client';

import Select from '@/common/components/ui/Select';
import { cn } from '@/common/utils/cn';
import { type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/useI18n';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label
      className={cn(
        'flex items-center gap-2 text-xs font-medium text-slate-500',
        compact && 'gap-0',
        className,
      )}
    >
      <span className={compact ? 'hidden xl:inline' : ''}>{t('common.language')}</span>
      <div className={cn('w-40 min-w-[160px]', compact && 'w-[138px] min-w-[138px]')}>
        <Select
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
          aria-label={t('common.language')}
          className={cn(
            'rounded-[12px] border-slate-200 bg-white text-sm font-medium shadow-none',
            compact && 'h-10 min-h-10 px-3 text-[13px]',
          )}
        >
          <option value='en'>{LOCALE_LABELS.en}</option>
          <option value='vi'>{LOCALE_LABELS.vi}</option>
        </Select>
      </div>
    </label>
  );
}
