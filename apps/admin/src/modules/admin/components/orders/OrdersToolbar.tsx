'use client';

import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import { cn } from '@/common/utils/cn';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import AdminToolbar, {
  AdminToolbarDateRangeField,
  AdminToolbarField,
  AdminToolbarIcon,
  adminToolbarButtonClass,
  adminToolbarInputClass,
} from '@/modules/admin/components/AdminToolbar';
import { useI18n } from '@/lib/i18n/useI18n';
import { formatNumber } from '@/lib/i18n/format';

type OrdersToolbarProps = {
  activeFilterCount: number;
  dateFrom: string;
  dateTo: string;
  description: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onOpenFilters: () => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
  showReset: boolean;
  title: string;
  total: number;
};

function FilterIconWithBadge({ count }: { count: number }) {
  return (
    <span className='relative inline-flex'>
      <AdminToolbarIcon name='filter' />
      {count > 0 ? (
        <span className='absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--admin-primary-strong)] px-1 text-[10px] font-bold leading-none text-white'>
          {count}
        </span>
      ) : null}
    </span>
  );
}

export default function OrdersToolbar({
  activeFilterCount,
  dateFrom,
  dateTo,
  description,
  onDateFromChange,
  onDateToChange,
  onOpenFilters,
  onReset,
  onSearchChange,
  searchValue,
  showReset,
  title,
  total,
}: OrdersToolbarProps) {
  const { t, locale } = useI18n();
  const formattedTotal = formatNumber(total, locale);

  return (
    <AdminToolbar
      icon={<AdminNavIcon name='orders' className='h-6 w-6' />}
      title={title}
      description={description}
      badge={
        <Badge tone='info' className='rounded-full px-4 py-2 text-sm font-bold'>
          {t(total === 1 ? 'orders.countOne' : 'orders.countOther', { count: formattedTotal })}
        </Badge>
      }
    >
      <AdminToolbarField
        hideLabel
        wide
        icon={<AdminToolbarIcon name='search' />}
        label={t('orders.search')}
        className='sm:w-[300px]'
      >
        <Input
          value={searchValue}
          aria-label={t('orders.search')}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('orders.searchPlaceholder')}
          className={adminToolbarInputClass}
        />
      </AdminToolbarField>

      <AdminToolbarDateRangeField
        fromLabel={t('orders.dateFrom')}
        fromValue={dateFrom}
        label={t('orders.dateRange')}
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        toLabel={t('orders.dateTo')}
        toValue={dateTo}
        className='sm:w-[250px]'
      />

      <Button
        type='button'
        variant='secondary'
        leftIcon={<FilterIconWithBadge count={activeFilterCount} />}
        onClick={onOpenFilters}
        className={cn(adminToolbarButtonClass, 'px-4')}
      >
        {t('orders.filters')}
      </Button>

      {showReset ? (
        <Button
          type='button'
          variant='secondary'
          leftIcon={<AdminToolbarIcon name='reset' />}
          onClick={onReset}
          className={adminToolbarButtonClass}
        >
          {t('orders.reset')}
        </Button>
      ) : null}
    </AdminToolbar>
  );
}
