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
  return (
    <AdminToolbar
      icon={<AdminNavIcon name='orders' className='h-6 w-6' />}
      title={title}
      description={description}
      badge={
        <Badge tone='info' className='rounded-full px-4 py-2 text-sm font-bold'>
          {total} đơn hàng
        </Badge>
      }
    >
      <AdminToolbarField
        hideLabel
        wide
        icon={<AdminToolbarIcon name='search' />}
        label='Tìm kiếm'
        className='sm:w-[300px]'
      >
        <Input
          value={searchValue}
          aria-label='Tìm kiếm đơn hàng'
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder='Tìm mã đơn, khách hàng, SĐT, email...'
          className={adminToolbarInputClass}
        />
      </AdminToolbarField>

      <AdminToolbarDateRangeField
        fromLabel='Từ ngày'
        fromValue={dateFrom}
        label='Khoảng ngày'
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        toLabel='Đến ngày'
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
        Bộ lọc
      </Button>

      {showReset ? (
        <Button
          type='button'
          variant='secondary'
          leftIcon={<AdminToolbarIcon name='reset' />}
          onClick={onReset}
          className={adminToolbarButtonClass}
        >
          Đặt lại
        </Button>
      ) : null}
    </AdminToolbar>
  );
}
