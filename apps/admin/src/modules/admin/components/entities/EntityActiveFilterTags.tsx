import Badge from '@/common/components/ui/Badge';
import { cn } from '@/common/utils/cn';

type EntityActiveFilterTagsLabels = {
  ascending: string;
  descending: string;
};

type EntityActiveFilterTagsProps = {
  categoryLabels: Array<{ label: string; value: string }>;
  labels: EntityActiveFilterTagsLabels;
  onRemoveCategory: (value: string) => void;
  onClearPrice: () => void;
  onClearSortDir: () => void;
  onRemoveStatus: (value: string) => void;
  priceMax: string;
  priceMin: string;
  sortDir: 'asc' | 'desc';
  statusLabels: Array<{ label: string; value: string }>;
};

const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

function CloseIcon() {
  return (
    <svg viewBox='0 0 20 20' fill='none' className='h-3.5 w-3.5' aria-hidden='true'>
      <path
        d='M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.8'
      />
    </svg>
  );
}

function formatPrice(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return `${NUMBER_FORMAT.format(parsed)} đ`;
}

export default function EntityActiveFilterTags({
  categoryLabels,
  labels,
  onRemoveCategory,
  onClearPrice,
  onClearSortDir,
  onRemoveStatus,
  priceMax,
  priceMin,
  sortDir,
  statusLabels,
}: EntityActiveFilterTagsProps) {
  const chips: Array<{
    id: string;
    label: string;
    onRemove: () => void;
  }> = [];

  statusLabels.forEach((status) => {
    chips.push({
      id: `status-${status.value}`,
      label: status.label,
      onRemove: () => onRemoveStatus(status.value),
    });
  });

  categoryLabels.forEach((category) => {
    chips.push({
      id: `category-${category.value}`,
      label: category.label,
      onRemove: () => onRemoveCategory(category.value),
    });
  });

  if (priceMin || priceMax) {
    const min = priceMin ? formatPrice(priceMin) : '';
    const max = priceMax ? formatPrice(priceMax) : '';
    const label = min && max ? `${min} - ${max}` : min ? `>= ${min}` : `<= ${max}`;

    chips.push({
      id: 'price',
      label,
      onRemove: onClearPrice,
    });
  }

  if (sortDir !== 'desc') {
    chips.push({
      id: 'sort-dir',
      label: sortDir === 'asc' ? labels.ascending : labels.descending,
      onRemove: onClearSortDir,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          tone='slate'
          className='gap-2 border-slate-200 bg-white px-3 py-1.5 text-[12px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
        >
          <span className='max-w-[220px] truncate'>{chip.label}</span>
          <button
            type='button'
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label}`}
            className={cn(
              'inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400',
              'transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700',
            )}
          >
            <CloseIcon />
          </button>
        </Badge>
      ))}
    </div>
  );
}
