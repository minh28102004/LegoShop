'use client';

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Badge, { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Checkbox from '@/common/components/ui/Checkbox';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import Input from '@/common/components/ui/Input';
import LoadingSpinner from '@/common/components/ui/LoadingSpinner';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@/common/components/ui/Modal';
import PageShell from '@/common/components/ui/PageShell';
import Select from '@/common/components/ui/Select';
import Tooltip from '@/common/components/ui/Tooltip';
import { resolveApiAssetUrl } from '@/lib/api';
import { type AdminNavIcon as AdminNavIconName } from '@/common/constants/routes';
import Table, {
  DEFAULT_TABLE_SORTS,
  SortableTableHead,
  TableActionButton,
  TableActions,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  areTableSortsEqual,
  serializeTableSorts,
  type TableSort,
} from '@/common/components/ui/Table';
import Textarea from '@/common/components/ui/Textarea';
import { cn } from '@/common/utils/cn';
import {
  createResource,
  deleteResource,
  listResource,
  type ResourceListParams,
  type ResourceDataMap,
  type ResourceKey,
  updateResource,
  uploadImage,
} from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminToolbar, {
  AdminToolbarDateRangeField,
  AdminToolbarField,
  AdminToolbarIcon,
  adminToolbarButtonClass,
  adminToolbarInputClass,
} from '@/modules/admin/components/AdminToolbar';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import EntityFilterDrawer from '@/modules/admin/components/entities/EntityFilterDrawer';
import {
  EMPTY_ENTITY_FILTER_DRAFT,
  type EntityFilterDraft,
} from '@/modules/admin/components/entities/entity-filter.types';
import type { PaginatedResourceResponse } from '@/modules/admin/types/admin.types';

type FieldType =
  | 'text'
  | 'number'
  | 'datetime'
  | 'textarea'
  | 'checkbox'
  | 'select'
  | 'json'
  | 'tags'
  | 'content-fields'
  | 'image'
  | 'images';
type ImageInputMode = 'file' | 'url';
type ContentFieldInputType = 'text' | 'date' | 'textarea' | 'image';

type ContentFieldFormValue = {
  key: string;
  label: string;
  type: ContentFieldInputType;
  required: boolean;
  placeholder: string;
  helpText: string;
};

export type EntityField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  helpText?: string;
};

type EntityManagerProps<K extends ResourceKey> = {
  title: string;
  resource: K;
  fields: EntityField[];
  tableFields?: EntityField[];
  pageTitle?: string;
  pageDescription?: string;
  createButtonLabel?: string;
};

type EntityTableColumn = {
  id: string;
  label: string;
  field: EntityField;
};

const fieldCardClass = 'min-w-0 space-y-2';
const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');
const CURRENCY_FORMAT = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});
const ENTITY_PAGE_SIZE = 20;
const PAGE_SIZE_LABEL = {
  vi: 'Mỗi trang',
  en: 'Per page',
} as const;
const ENTITY_ACTION_COLUMN_CLASS = 'w-[9%] min-w-[112px] max-w-[124px] px-2 text-center';
const ENTITY_DATE_FILTER_RESOURCES = new Set<ResourceKey>([
  'products',
  'templates',
  'frame-options',
  'template-categories',
  'accessories',
  'characters',
  'character-parts',
  'character-presets',
  'accessory-categories',
  'banners',
  'frame-backgrounds',
  'collections',
  'vouchers',
]);
const DATE_TIME_FORMATTERS = {
  vi: new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  en: new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
} as const;

type SortDirection = 'asc' | 'desc';
type EntityListMeta = PaginatedResourceResponse<unknown>['meta'];

function isCurrencyColumn(key: string) {
  const normalized = key.toLowerCase();
  return normalized.includes('price') || normalized.includes('amount') || normalized.includes('total');
}

function getFieldLayoutClass(field: EntityField, resource: ResourceKey) {
  const normalizedKey = field.key.toLowerCase();

  if (field.type === 'textarea') return 'lg:col-span-12';
  if (field.type === 'json' || field.type === 'tags' || field.type === 'content-fields') return 'lg:col-span-12';
  if (field.type === 'image' || field.type === 'images') return 'lg:col-span-12';
  if (field.type === 'checkbox') return 'lg:col-span-4 xl:col-span-3 max-w-[320px]';
  if (field.type === 'number') return 'lg:col-span-3';
  if (field.type === 'datetime') return 'lg:col-span-5';
  if (field.type === 'select') {
    if (normalizedKey === 'status') {
      return resource === 'products' || resource === 'banners' || resource === 'collections'
        ? 'lg:col-span-4'
        : 'lg:col-span-3';
    }
    if (normalizedKey === 'categoryid') return 'lg:col-span-4';
    return 'lg:col-span-4';
  }

  if (
    normalizedKey === 'name' ||
    normalizedKey.endsWith('name') ||
    normalizedKey === 'title'
  ) {
    if (resource === 'collections') return 'lg:col-span-8';
    if (resource === 'template-categories' || resource === 'accessory-categories') {
      return 'lg:col-span-6';
    }
    return 'lg:col-span-5';
  }

  if (
    normalizedKey === 'slug' ||
    normalizedKey.includes('url') ||
    normalizedKey.includes('link')
  ) {
    return 'lg:col-span-12';
  }

  return 'lg:col-span-5';
}

function getTableColumnClass(field: EntityField) {
  if (field.type === 'number') return 'text-right';
  if (field.key.toLowerCase().includes('status')) return 'text-center';
  if (field.type === 'image' || field.type === 'images') return 'text-center';
  return '';
}

function getEntityPrimaryColumnClass(resource: ResourceKey) {
  if (resource === 'frame-backgrounds') return 'w-[42%] min-w-[280px] max-w-[520px] text-left';
  if (resource === 'products') return 'w-[28%] min-w-[260px] max-w-[420px] text-left';
  if (resource === 'banners') return 'w-[26%] min-w-[220px] max-w-[360px] text-left';
  if (resource === 'template-categories' || resource === 'accessory-categories') {
    return 'w-[36%] min-w-[240px] max-w-[420px] text-left';
  }
  return 'w-[30%] min-w-[220px] max-w-[380px] text-left';
}

function getEntityTableColumnClass(column: EntityTableColumn, resource: ResourceKey) {
  const field = column.field;
  const normalizedKey = field.key.toLowerCase();

  if (normalizedKey === 'colorhex') return 'w-[96px] min-w-[96px] max-w-[96px] text-center';
  if (normalizedKey === 'framesize') return 'w-[12%] min-w-[140px] max-w-[160px] text-center';
  if (normalizedKey === 'createdat' || normalizedKey === 'updatedat') {
    return 'w-[14%] min-w-[150px] max-w-[180px] text-center';
  }
  if (normalizedKey === 'stock' || normalizedKey === 'sortorder') {
    return 'w-[10%] min-w-[104px] max-w-[128px] text-center';
  }
  if (field.type === 'number') return 'w-[12%] min-w-[128px] max-w-[150px] text-right';
  if (field.type === 'image' || field.type === 'images') return 'w-[14%] min-w-[118px] max-w-[170px] text-center';
  if (normalizedKey.includes('status')) return 'w-[14%] min-w-[148px] max-w-[180px] text-center';
  if (field.type === 'json' || field.type === 'tags') return 'min-w-[280px] max-w-[420px]';
  if (normalizedKey.includes('description')) return 'min-w-[240px] max-w-[360px]';
  if (normalizedKey === 'slug' || normalizedKey.includes('url') || normalizedKey.includes('link')) {
    return 'w-[18%] min-w-[180px] max-w-[260px]';
  }
  if (isPrimaryField(field)) return getEntityPrimaryColumnClass(resource);

  return getTableColumnClass(field);
}

function isPrimaryField(field: EntityField) {
  const normalizedKey = field.key.toLowerCase();
  return normalizedKey === 'name' || normalizedKey.endsWith('name') || normalizedKey === 'title';
}

function getOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getEntityTimestampLabel(locale: string, key: string) {
  if (key === 'createdAt') return locale === 'vi' ? 'Ngày tạo' : 'Created';
  if (key === 'updatedAt') return locale === 'vi' ? 'Ngày cập nhật' : 'Updated';
  return key;
}

function getSyntheticEntityTableField(key: string, locale: string): EntityField | undefined {
  if (key !== 'createdAt' && key !== 'updatedAt') return undefined;

  return {
    key,
    label: getEntityTimestampLabel(locale, key),
    type: 'text',
  };
}

function formatEntityDateTime(value: unknown, locale: string) {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value instanceof Date
        ? value
        : null;

  if (!date || Number.isNaN(date.getTime())) return '-';

  return DATE_TIME_FORMATTERS[locale === 'vi' ? 'vi' : 'en'].format(date);
}

function getEntityUiText(locale: string, key: string) {
  const vi: Record<string, string> = {
    searchPlaceholder: 'Tìm theo tên, slug, mô tả...',
    dateRange: 'Khoảng ngày',
    dateFrom: 'Từ ngày',
    dateTo: 'Đến ngày',
    allStatuses: 'Tất cả trạng thái',
    allCategories: 'Tất cả danh mục',
    priceMin: 'Giá từ',
    priceMax: 'Giá đến',
    priceRange: 'Khoảng giá',
    filters: 'Bộ lọc',
    filterTitle: 'Bộ lọc',
    applyFilters: 'Áp dụng',
    reset: 'Đặt lại',
    page: 'Trang',
  };
  const en: Record<string, string> = {
    searchPlaceholder: 'Search by name, slug, description...',
    dateRange: 'Date range',
    dateFrom: 'From date',
    dateTo: 'To date',
    allStatuses: 'All statuses',
    allCategories: 'All categories',
    priceMin: 'Price from',
    priceMax: 'Price to',
    priceRange: 'Price range',
    filters: 'Filters',
    filterTitle: 'Filters',
    applyFilters: 'Apply filters',
    reset: 'Reset',
    page: 'Page',
  };

  return locale === 'vi' ? vi[key] : en[key];
}

function getEntityTableColumns(fields: EntityField[], resource: ResourceKey, locale: string): EntityTableColumn[] {
  const columns: EntityTableColumn[] = [];
  const usedKeys = new Set<string>();

  const orderByResource: Partial<Record<ResourceKey, string[]>> = {
    products: ['name', 'images', 'basePrice', 'status', 'createdAt', 'updatedAt'],
    templates: ['name', 'imageUrl', 'categoryId', 'status', 'createdAt', 'updatedAt'],
    'frame-options': ['frameSize', 'imageUrl', 'price', 'stock', 'createdAt', 'updatedAt'],
    accessories: ['name', 'imageUrl', 'categoryId', 'status', 'createdAt', 'updatedAt'],
    characters: ['name', 'imageUrl', 'price', 'sortOrder', 'status', 'updatedAt'],
    'character-parts': ['name', 'type', 'imageUrl', 'sortOrder', 'status', 'updatedAt'],
    'character-presets': ['name', 'description', 'sortOrder', 'status', 'updatedAt'],
    banners: ['title', 'imageUrl', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
    'frame-backgrounds': ['title', 'description', 'imageUrl', 'sortOrder', 'status', 'updatedAt'],
    collections: ['name', 'imageUrl', 'slug', 'status', 'createdAt', 'updatedAt'],
    'template-categories': ['name', 'slug', 'createdAt', 'updatedAt'],
    'accessory-categories': ['name', 'slug', 'createdAt', 'updatedAt'],
    'frame-sizes': ['label', 'price', 'createdAt', 'updatedAt'],
    'frame-colors': ['name', 'colorHex', 'createdAt', 'updatedAt'],
    vouchers: ['code', 'discountType', 'discountValue', 'minOrderAmount', 'usedCount', 'status', 'expiresAt'],
  };

  const addField = (field?: EntityField) => {
    if (!field || usedKeys.has(field.key) || field.type === 'checkbox') return;
    columns.push({
      id: field.key,
      label: field.label,
      field,
    });
    usedKeys.add(field.key);
  };

  (orderByResource[resource] ?? []).forEach((key) =>
    addField(fields.find((field) => field.key === key) ?? getSyntheticEntityTableField(key, locale)),
  );
  fields.forEach(addField);

  return columns.slice(0, 6);
}

const ENTITY_SORT_FIELDS = {
  products: ['name', 'basePrice', 'status', 'featured', 'createdAt', 'updatedAt'],
  templates: ['name', 'status', 'categoryId', 'createdAt', 'updatedAt'],
  'frame-options': ['type', 'name', 'price', 'stock', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
  'template-categories': ['name', 'slug', 'createdAt', 'updatedAt'],
  accessories: ['name', 'status', 'categoryId', 'createdAt', 'updatedAt'],
  characters: ['name', 'price', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
  'character-parts': ['name', 'type', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
  'character-presets': ['name', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
  'accessory-categories': ['name', 'slug', 'createdAt', 'updatedAt'],
  banners: ['title', 'sortOrder', 'status', 'createdAt', 'updatedAt'],
    'frame-backgrounds': ['title', 'sortOrder', 'status', 'updatedAt'],
  collections: ['name', 'slug', 'status', 'createdAt', 'updatedAt'],
  'frame-sizes': ['name', 'createdAt', 'updatedAt'],
  'frame-colors': ['name', 'createdAt', 'updatedAt'],
  vouchers: ['code', 'discountType', 'discountValue', 'minOrderAmount', 'status', 'expiresAt', 'createdAt', 'updatedAt'],
} satisfies Record<ResourceKey, string[]>;

function isEntityColumnSortable(column: EntityTableColumn, resource: ResourceKey) {
  return ENTITY_SORT_FIELDS[resource].includes(column.field.key);
}

function getEntityDefaultSortDirection(column: EntityTableColumn): SortDirection {
  if (column.field.type === 'number' || column.field.type === 'checkbox') return 'desc';
  return 'asc';
}

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M6 6L18 18M18 6L6 18'
        stroke='currentColor'
        strokeWidth='1.9'
        strokeLinecap='round'
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5L17.5 5.5C16.6716 4.67157 15.3284 4.67157 14.5 5.5L4 16V20Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
      <path
        d='M13.5 6.5L17.5 10.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path d='M12 5.5V18.5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
      <path d='M5.5 12H18.5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
    </svg>
  );
}

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

function TrashIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M5 7H19'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
      <path
        d='M10 11V17'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
      <path
        d='M14 11V17'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
      <path
        d='M7 7L8 19H16L17 7'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
      <path
        d='M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-5 w-5' aria-hidden='true'>
      <path
        d='M12 15.5V5.5M12 5.5L8.5 9M12 5.5L15.5 9'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5 14.5V17.5C5 18.6 5.9 19.5 7 19.5H17C18.1 19.5 19 18.6 19 17.5V14.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
      <path
        d='M10.5 13.5L13.5 10.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
      <path
        d='M9.5 8.5L10.8 7.2C12.3 5.7 14.8 5.7 16.3 7.2C17.8 8.7 17.8 11.2 16.3 12.7L15 14'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
      <path
        d='M14.5 15.5L13.2 16.8C11.7 18.3 9.2 18.3 7.7 16.8C6.2 15.3 6.2 12.8 7.7 11.3L9 10'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
      />
    </svg>
  );
}

function ImagePlaceholderIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
      <path
        d='M4.5 7C4.5 5.62 5.62 4.5 7 4.5H17C18.38 4.5 19.5 5.62 19.5 7V17C19.5 18.38 18.38 19.5 17 19.5H7C5.62 19.5 4.5 18.38 4.5 17V7Z'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M7.5 16L10.2 13.3C10.64 12.86 11.36 12.86 11.8 13.3L13 14.5L14.7 12.8C15.14 12.36 15.86 12.36 16.3 12.8L18 14.5'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle cx='9' cy='8.75' r='1.25' fill='currentColor' />
    </svg>
  );
}

function getRelatedDisplayValue(row: Record<string, unknown>, key: string) {
  if (key.toLowerCase() === 'categoryid') {
    const category = row.category;
    if (category && typeof category === 'object' && 'name' in category) {
      const name = (category as { name?: unknown }).name;
      if (typeof name === 'string' && name.trim()) return name;
    }
  }

  return row[key];
}

function TableThumbnail({
  src,
  alt,
  onOpen,
  zoomLabel,
}: {
  src?: string;
  alt: string;
  onOpen?: (src: string) => void;
  zoomLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageUrl = resolveApiAssetUrl(src);
  const canOpen = Boolean(imageUrl && !failed && onOpen);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const content = imageUrl && !failed ? (
    <img
      src={imageUrl}
      alt={alt}
      loading='lazy'
      className='h-full w-full object-cover transition-opacity duration-150 group-hover:opacity-55'
      onError={() => setFailed(true)}
    />
  ) : (
    <ImagePlaceholderIcon />
  );

  if (canOpen) {
    return (
      <button
        type='button'
        className='group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all duration-150 hover:border-[var(--admin-primary)] hover:shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]'
        aria-label={`${zoomLabel ?? 'Zoom image'}: ${alt}`}
        onClick={() => onOpen?.(imageUrl)}
      >
        {content}
        <span className='absolute inset-0 grid place-items-center bg-slate-950/38 px-1 text-center text-[9px] font-medium leading-tight text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100'>
          {zoomLabel ?? 'Zoom image'}
        </span>
      </button>
    );
  }

  return (
    <span className='grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400'>
      {content}
    </span>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className='admin-label'>
      <span>{label}</span>
      {required ? <span className='text-red-500'> *</span> : null}
    </span>
  );
}

function lowerFirst(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return `${trimmed.charAt(0).toLocaleLowerCase()}${trimmed.slice(1)}`;
}

function buildFieldPlaceholder(action: string, label: string) {
  return `${action} ${lowerFirst(label)}`;
}

function hasImageValue(value: unknown) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isNonEmptyString);
  return false;
}

function getInitialImageInputModes(
  fields: EntityField[],
  values: Record<string, unknown>,
) {
  return fields.reduce<Record<string, ImageInputMode>>((modes, field) => {
    if (field.type === 'image' || field.type === 'images') {
      modes[field.key] = hasImageValue(values[field.key]) ? 'url' : 'file';
    }
    return modes;
  }, {});
}

function toInitialValues(fields: EntityField[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  fields.forEach((field) => {
    if (field.type === 'content-fields') {
      values[field.key] = [];
      return;
    }
    if (field.type === 'images') {
      values[field.key] = [];
      return;
    }
    if (field.type === 'image') {
      values[field.key] = '';
      return;
    }
    if (field.type === 'checkbox') {
      values[field.key] = false;
      return;
    }
    if (field.type === 'number') {
      values[field.key] = field.required ? 0 : '';
      return;
    }
    values[field.key] = '';
  });
  return values;
}

function toDatetimeLocalValue(value: unknown) {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value instanceof Date
        ? value
        : null;

  if (!date || Number.isNaN(date.getTime())) return '';

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

const CONTENT_FIELD_TYPE_OPTIONS: Array<{ value: ContentFieldInputType; label: string }> = [
  { value: 'text', label: 'Văn bản ngắn' },
  { value: 'textarea', label: 'Lời nhắn dài' },
  { value: 'date', label: 'Ngày tháng' },
  { value: 'image', label: 'Ảnh tải lên' },
];

function createContentFieldFormValue(index: number): ContentFieldFormValue {
  return {
    key: `field_${index + 1}`,
    label: '',
    type: 'text',
    required: index === 0,
    placeholder: '',
    helpText: '',
  };
}

function isContentFieldInputType(value: unknown): value is ContentFieldInputType {
  return value === 'text' || value === 'date' || value === 'textarea' || value === 'image';
}

function readStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseTagsInput(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter((tag, index, tags) => tag.length > 0 && tags.indexOf(tag) === index);
  }

  if (typeof value !== 'string') return [];

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, tags) => tag.length > 0 && tags.indexOf(tag) === index);
}

function formatTagsInputValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      .join(', ');
  }

  return typeof value === 'string' ? value : '';
}

function buildContentFieldKey(label: string, index: number) {
  const normalized = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || `field_${index + 1}`;
}

function readContentFieldArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      return readContentFieldArray(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.fields)) return record.fields;
    if (Array.isArray(record.contentFields)) return record.contentFields;
    if (Array.isArray(record.inputs)) return record.inputs;
  }
  return [];
}

function normalizeContentFieldFormValues(value: unknown): ContentFieldFormValue[] {
  return readContentFieldArray(value).flatMap((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];

    const record = item as Record<string, unknown>;
    const type = isContentFieldInputType(record.type) ? record.type : 'text';

    return [
      {
        key: readStringValue(record.key).trim() || buildContentFieldKey(readStringValue(record.label), index),
        label: readStringValue(record.label) || readStringValue(record.name),
        type,
        required: typeof record.required === 'boolean' ? record.required : index === 0,
        placeholder: readStringValue(record.placeholder),
        helpText: readStringValue(record.helpText) || readStringValue(record.description),
      },
    ];
  });
}

function serializeContentFieldFormValues(value: unknown) {
  const fields = normalizeContentFieldFormValues(value)
    .map((field, index) => {
      const label = field.label.trim();
      const key = field.key.trim() || buildContentFieldKey(label, index);

      if (!label && !field.placeholder.trim() && !field.helpText.trim()) return null;

      return {
        key,
        label: label || `Thông tin ${index + 1}`,
        type: field.type,
        required: field.required,
        ...(field.placeholder.trim() ? { placeholder: field.placeholder.trim() } : {}),
        ...(field.helpText.trim() ? { helpText: field.helpText.trim() } : {}),
      };
    })
    .filter(Boolean);

  return fields.length > 0 ? fields : undefined;
}

function serializeFormValue(field: EntityField, rawValue: unknown): unknown {
  if (field.type === 'checkbox') return Boolean(rawValue);
  if (field.type === 'number') {
    if (rawValue === '') return field.key === 'stock' ? null : undefined;
    const asNumber = Number(rawValue);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }
  if (field.type === 'datetime') {
    if (typeof rawValue !== 'string' || !rawValue.trim()) return undefined;
    const date = new Date(rawValue);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }
  if (field.type === 'image') {
    return typeof rawValue === 'string' ? rawValue.trim() : '';
  }
  if (field.type === 'images') {
    if (!Array.isArray(rawValue)) return [];
    return rawValue
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0);
  }
  if (field.type === 'json') {
    if (typeof rawValue !== 'string' || !rawValue.trim()) return undefined;
    return JSON.parse(rawValue);
  }
  if (field.type === 'tags') {
    return parseTagsInput(rawValue);
  }
  if (field.type === 'content-fields') {
    return serializeContentFieldFormValues(rawValue);
  }
  if (field.type === 'text' || field.type === 'textarea' || field.type === 'select') {
    if (typeof rawValue !== 'string') return '';
    return rawValue;
  }
  return rawValue;
}

function displayCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getEntityEmptyMessage(resource: ResourceKey, locale: string) {
  const messages = {
    vi: {
      products: 'Không có sản phẩm nào.',
      templates: 'Không có mẫu thiết kế nào.',
      'template-categories': 'Không có danh mục mẫu nào.',
      accessories: 'Không có phụ kiện nào.',
      characters: 'Không có nhân vật nào.',
      'character-parts': 'Chưa có bộ phận nhân vật nào.',
      'character-presets': 'Chưa có mẫu nhân vật nào.',
      'accessory-categories': 'Không có danh mục phụ kiện nào.',
      banners: 'Không có banner nào.',
      'frame-backgrounds': 'Chưa có nền ảnh khung nào.',
      collections: 'Không có bộ sưu tập nào.',
      'frame-options': 'Chưa có khung tranh nào.',
      'frame-sizes': 'Không có kích thước khung nào.',
      'frame-colors': 'Không có màu khung nào.',
      vouchers: 'Chưa có voucher nào.',
    },
    en: {
      products: 'No products found.',
      templates: 'No templates found.',
      'template-categories': 'No template categories found.',
      accessories: 'No accessories found.',
      characters: 'No characters found.',
      'character-parts': 'No character parts found.',
      'character-presets': 'No character presets found.',
      'accessory-categories': 'No accessory categories found.',
      banners: 'No banners found.',
      'frame-backgrounds': 'No frame image backgrounds found.',
      collections: 'No collections found.',
      'frame-options': 'No picture frames found.',
      'frame-sizes': 'No frame sizes found.',
      'frame-colors': 'No frame colors found.',
      vouchers: 'No vouchers found.',
    },
  } satisfies Record<string, Record<ResourceKey, string>>;

  return locale === 'vi' ? messages.vi[resource] : messages.en[resource];
}

function getEntityNoun(resource: ResourceKey, locale: string, count?: number) {
  const nouns = {
    vi: {
      products: 'sản phẩm',
      templates: 'mẫu thiết kế',
      'template-categories': 'danh mục mẫu',
      accessories: 'phụ kiện',
      characters: 'nhân vật',
      'character-parts': 'bộ phận nhân vật',
      'character-presets': 'mẫu nhân vật',
      'accessory-categories': 'danh mục phụ kiện',
      banners: 'banner',
      'frame-backgrounds': 'nền ảnh khung',
      collections: 'bộ sưu tập',
      'frame-options': 'khung tranh',
      'frame-sizes': 'kích thước khung',
      'frame-colors': 'màu khung',
      vouchers: 'voucher',
    },
    en: {
      products: count === 1 ? 'product' : 'products',
      templates: count === 1 ? 'template' : 'templates',
      'template-categories': count === 1 ? 'template category' : 'template categories',
      accessories: count === 1 ? 'accessory' : 'accessories',
      characters: count === 1 ? 'character' : 'characters',
      'character-parts': count === 1 ? 'character part' : 'character parts',
      'character-presets': count === 1 ? 'character preset' : 'character presets',
      'accessory-categories': count === 1 ? 'accessory category' : 'accessory categories',
      banners: count === 1 ? 'banner' : 'banners',
      'frame-backgrounds': count === 1 ? 'frame image background' : 'frame image backgrounds',
      collections: count === 1 ? 'collection' : 'collections',
      'frame-options': count === 1 ? 'picture frame' : 'picture frames',
      'frame-sizes': count === 1 ? 'frame size' : 'frame sizes',
      'frame-colors': count === 1 ? 'frame color' : 'frame colors',
      vouchers: count === 1 ? 'voucher' : 'vouchers',
    },
  } satisfies Record<string, Record<ResourceKey, string>>;

  return locale === 'vi' ? nouns.vi[resource] : nouns.en[resource];
}

function getEntityCountLabel(resource: ResourceKey, count: number, locale: string) {
  return `${NUMBER_FORMAT.format(count)} ${getEntityNoun(resource, locale, count)}`;
}

function getEntityPaginationRangeLabel(
  locale: string,
  from: number,
  to: number,
  total: number,
  itemLabel: string,
) {
  const formattedRange = `${NUMBER_FORMAT.format(from)}–${NUMBER_FORMAT.format(to)}`;
  const formattedTotal = `${NUMBER_FORMAT.format(total)}${itemLabel ? ` ${itemLabel}` : ''}`;

  return locale === 'vi'
    ? `Hiển thị ${formattedRange} trên ${formattedTotal}`
    : `Showing ${formattedRange} of ${formattedTotal}`;
}

function getEntityLoadingLabel(resource: ResourceKey, locale: string) {
  const noun = getEntityNoun(resource, locale);
  return locale === 'vi' ? `Đang tải ${noun}...` : `Loading ${noun}...`;
}

function getEntitySubmitLabel(resource: ResourceKey, locale: string, isEditing: boolean) {
  const noun = getEntityNoun(resource, locale, 1);
  if (locale === 'vi') return `${isEditing ? 'Cập nhật' : 'Tạo'} ${noun}`;
  return `${isEditing ? 'Update' : 'Create'} ${noun}`;
}

function getEntityActionToastLabel(
  resource: ResourceKey,
  locale: string,
  action: 'creating' | 'updating' | 'created' | 'updated' | 'deleting' | 'deleted',
) {
  const noun = getEntityNoun(resource, locale, 1);

  if (locale === 'vi') {
    const labels = {
      creating: `Đang tạo ${noun}...`,
      updating: `Đang cập nhật ${noun}...`,
      created: `Đã tạo ${noun}.`,
      updated: `Đã cập nhật ${noun}.`,
      deleting: `Đang xóa ${noun}...`,
      deleted: `Đã xóa ${noun}.`,
    } satisfies Record<typeof action, string>;

    return labels[action];
  }

  const labels = {
    creating: `Creating ${noun}...`,
    updating: `Updating ${noun}...`,
    created: `${noun.charAt(0).toUpperCase()}${noun.slice(1)} created.`,
    updated: `${noun.charAt(0).toUpperCase()}${noun.slice(1)} updated.`,
    deleting: `Deleting ${noun}...`,
    deleted: `${noun.charAt(0).toUpperCase()}${noun.slice(1)} deleted.`,
  } satisfies Record<typeof action, string>;

  return labels[action];
}

function getEntityDeleteDialogTitle(resource: ResourceKey, locale: string) {
  const noun = getEntityNoun(resource, locale, 1);
  return locale === 'vi' ? `Xóa ${noun}?` : `Delete ${noun}?`;
}

function getEntityDeleteDialogDescription(
  resource: ResourceKey,
  locale: string,
  label?: string,
) {
  const noun = getEntityNoun(resource, locale, 1);

  if (locale === 'vi') {
    return label
      ? `Bạn sắp xóa "${label}". Hành động này không thể hoàn tác.`
      : `Mục ${noun} này sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác.`;
  }

  return label
    ? `You are about to delete "${label}". This action cannot be undone.`
    : `This ${noun} will be removed from the system. This action cannot be undone.`;
}

function getEntityIconName(resource: ResourceKey): AdminNavIconName {
  const icons = {
    products: 'products',
    templates: 'templates',
    'template-categories': 'templates',
    accessories: 'accessories',
    characters: 'characters',
    'character-parts': 'characters',
    'character-presets': 'characters',
    'accessory-categories': 'accessories',
    banners: 'banners',
    'frame-backgrounds': 'frameBackgrounds',
    collections: 'collections',
    'frame-options': 'frameOptions',
    'frame-sizes': 'products',
    'frame-colors': 'products',
    vouchers: 'vouchers',
  } satisfies Record<ResourceKey, AdminNavIconName>;

  return icons[resource];
}

const DEFAULT_COLOR_MAP: Record<string, string> = {
  'tráng': '#ffffff',
  'trắng': '#ffffff',
  'white': '#ffffff',
  'den': '#1a1a1a',
  'đen': '#1a1a1a',
  'black': '#1a1a1a',
  'go': '#d7a15c',
  'gỗ': '#d7a15c',
  'wood': '#d7a15c',
  'xám': '#808080',
  'gray': '#808080',
  'grey': '#808080',
  'nâu': '#8b4513',
  'brown': '#8b4513',
  'đỏ': '#ff0000',
  'red': '#ff0000',
  'vàng': '#facc15',
  'yellow': '#facc15',
  'xanh lá': '#22c55e',
  'green': '#22c55e',
  'xanh dương': '#3b82f6',
  'blue': '#3b82f6',
};

function getValidHexForInput(val: unknown): string {
  const str = String(val ?? '').trim();
  if (/^#[0-9A-F]{6}$/i.test(str)) {
    return str;
  }
  if (/^[0-9A-F]{6}$/i.test(str)) {
    return `#${str}`;
  }
  return '#ffffff';
}

export default function EntityManager<K extends ResourceKey>({
  title,
  resource,
  fields,
  tableFields,
  pageTitle,
  pageDescription,
  createButtonLabel,
}: EntityManagerProps<K>) {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<ResourceDataMap[K][]>([]);
  const [meta, setMeta] = useState<EntityListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ENTITY_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [priceMinFilter, setPriceMinFilter] = useState('');
  const [priceMaxFilter, setPriceMaxFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sorts, setSorts] = useState<TableSort[]>([...DEFAULT_TABLE_SORTS]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<EntityFilterDraft>(EMPTY_ENTITY_FILTER_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label?: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null);
  const requestSeq = useRef(0);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() =>
    toInitialValues(fields),
  );
  const [imageInputModes, setImageInputModes] = useState<Record<string, ImageInputMode>>(() =>
    getInitialImageInputModes(fields, toInitialValues(fields)),
  );
  const [imageFileNames, setImageFileNames] = useState<Record<string, string>>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const visibleColumns = useMemo(
    () => getEntityTableColumns(tableFields ?? fields, resource, locale),
    [fields, locale, resource, tableFields],
  );
  const statusField = useMemo(
    () => fields.find((field) => field.key === 'status' && field.type === 'select'),
    [fields],
  );
  const categoryField = useMemo(
    () => fields.find((field) => field.key === 'categoryId' && field.type === 'select'),
    [fields],
  );
  const hasPriceFilter = useMemo(
    () => fields.some((field) => field.key === 'basePrice' && field.type === 'number'),
    [fields],
  );
  const statusOptions = useMemo(() => statusField?.options ?? [], [statusField]);
  const categoryOptions = useMemo(() => categoryField?.options ?? [], [categoryField]);
  const hasDateFilter = ENTITY_DATE_FILTER_RESOURCES.has(resource);
  const hasEntityFilters = statusOptions.length > 0 || categoryOptions.length > 0 || hasPriceFilter;
  const drawerFilterCount = useMemo(
    () =>
      statusFilter.length +
      categoryFilter.length +
      Number(Boolean(priceMinFilter || priceMaxFilter)),
    [categoryFilter, priceMaxFilter, priceMinFilter, statusFilter],
  );
  const activeFilterCount = drawerFilterCount + Number(Boolean(dateFromFilter || dateToFilter));
  const showResetFilters =
    Boolean(search.trim()) ||
    activeFilterCount > 0 ||
    !areTableSortsEqual(sorts, DEFAULT_TABLE_SORTS);
  const getInputPlaceholder = useCallback(
    (field: EntityField) =>
      field.placeholder ?? buildFieldPlaceholder(t('entity.enterFieldPrefix'), field.label),
    [t],
  );
  const getSelectPlaceholder = useCallback(
    (field: EntityField) =>
      field.placeholder ?? buildFieldPlaceholder(t('entity.selectFieldPrefix'), field.label),
    [t],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const loadItems = useCallback(async () => {
    const requestId = requestSeq.current + 1;
    requestSeq.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const serializedSorts = serializeTableSorts(sorts);
      const params: ResourceListParams = {
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        sort_by: serializedSorts.sortBy,
        sort_dir: serializedSorts.sortDir,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        category_id: categoryFilter.length > 0 ? categoryFilter : undefined,
        price_min: hasPriceFilter ? getOptionalNumber(priceMinFilter) : undefined,
        price_max: hasPriceFilter ? getOptionalNumber(priceMaxFilter) : undefined,
        date_from: hasDateFilter ? dateFromFilter || undefined : undefined,
        date_to: hasDateFilter ? dateToFilter || undefined : undefined,
        date_field: hasDateFilter && (dateFromFilter || dateToFilter) ? 'createdAt' : undefined,
      };
      const response = await listResource(resource, params);
      if (requestSeq.current !== requestId) return;
      if (Array.isArray(response)) {
        setItems(response as ResourceDataMap[K][]);
        setMeta(null);
      } else if (response && typeof response === 'object' && 'data' in response) {
        const paginatedResponse = response as PaginatedResourceResponse<ResourceDataMap[K]>;
        setItems(paginatedResponse.data);
        setMeta(paginatedResponse.meta ?? null);
      } else {
        setItems([]);
        setMeta(null);
      }
    } catch (err) {
      if (requestSeq.current !== requestId) return;
      setError(err instanceof Error ? err.message : t('entity.loadFailed'));
    } finally {
      if (requestSeq.current === requestId) {
        setLoading(false);
      }
    }
  }, [
    categoryFilter,
    dateFromFilter,
    dateToFilter,
    debouncedSearch,
    hasDateFilter,
    hasPriceFilter,
    page,
    pageSize,
    priceMaxFilter,
    priceMinFilter,
    resource,
    sorts,
    statusFilter,
    t,
  ]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  function resetForm() {
    const initialValues = toInitialValues(fields);
    setFormValues(initialValues);
    setImageInputModes(getInitialImageInputModes(fields, initialValues));
    setImageFileNames({});
    setImageLoadErrors({});
    setEditingId(null);
  }

  function openCreateModal() {
    resetForm();
    setError(null);
    setIsModalOpen(true);
  }

  function startEdit(item: ResourceDataMap[K]) {
    const nextValues = toInitialValues(fields);
    fields.forEach((field) => {
      const value = (item as unknown as Record<string, unknown>)[field.key];
      if (field.type === 'json') {
        nextValues[field.key] = value ? JSON.stringify(value, null, 2) : '';
      } else if (field.type === 'tags') {
        nextValues[field.key] = formatTagsInputValue(value);
      } else if (field.type === 'content-fields') {
        nextValues[field.key] = normalizeContentFieldFormValues(value);
      } else if (field.type === 'checkbox') {
        nextValues[field.key] = Boolean(value);
      } else if (field.type === 'images') {
        nextValues[field.key] = Array.isArray(value) ? [...value] : [];
      } else if (field.type === 'image') {
        nextValues[field.key] = typeof value === 'string' ? value : '';
      } else if (field.type === 'datetime') {
        nextValues[field.key] = toDatetimeLocalValue(value);
      } else {
        nextValues[field.key] = value ?? nextValues[field.key];
      }
    });
    setFormValues(nextValues);
    setImageInputModes(getInitialImageInputModes(fields, nextValues));
    setImageFileNames({});
    setImageLoadErrors({});
    setEditingId((item as { id?: string }).id ?? null);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  function openImagePreview(src: string, alt: string) {
    setImagePreview({ src, alt });
  }

  function closeImagePreview() {
    setImagePreview(null);
  }

  function applyEntityFilters(nextFilters: EntityFilterDraft) {
    setStatusFilter(nextFilters.status);
    setCategoryFilter(nextFilters.category);
    setPriceMinFilter(nextFilters.priceMin);
    setPriceMaxFilter(nextFilters.priceMax);
    setPage(1);
    setFilterDrawerOpen(false);
  }

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter([]);
    setCategoryFilter([]);
    setPriceMinFilter('');
    setPriceMaxFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setSorts([...DEFAULT_TABLE_SORTS]);
    setDraftFilters(EMPTY_ENTITY_FILTER_DRAFT);
    setPage(1);
  }

  function updateDateFrom(value: string) {
    setDateFromFilter(value);
    setPage(1);
  }

  function updateDateTo(value: string) {
    setDateToFilter(value);
    setPage(1);
  }

  function handleTableSort(nextSorts: TableSort[]) {
    setSorts(nextSorts);
    setPage(1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isEditing = Boolean(editingId);
    const toastId = toast.loading(
      getEntityActionToastLabel(resource, locale, isEditing ? 'updating' : 'creating'),
    );

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = formValues[field.key];
        const value = serializeFormValue(field, raw);
        if (value === '' || value === undefined || (value === null && field.key !== 'stock')) continue;
        payload[field.key] = value;
      }

      const finalPayload =
        resource === 'products'
          ? {
              ...payload,
              images: Array.isArray(payload.images) ? payload.images : [],
            }
          : payload;

      if (editingId) {
        await updateResource(resource, editingId, finalPayload as Partial<ResourceDataMap[K]>);
      } else {
        await createResource(resource, finalPayload as Partial<ResourceDataMap[K]>);
      }

      await loadItems();
      closeModal();
      toast.success(
        getEntityActionToastLabel(resource, locale, isEditing ? 'updated' : 'created'),
        { id: toastId },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : t('entity.saveFailed');
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  function getDeleteTargetLabel(row: Record<string, unknown>) {
    const labelKeys = ['name', 'title', 'code', 'slug'];
    const foundKey = labelKeys.find((key) => isNonEmptyString(row[key]));
    return foundKey ? String(row[foundKey]).trim() : undefined;
  }

  function requestDelete(row: Record<string, unknown> & { id?: string }) {
    if (!row.id) return;
    const label = getDeleteTargetLabel(row);

    setDeleteTarget(label ? { id: row.id, label } : { id: row.id });
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setError(null);
    setDeleting(true);
    const toastId = toast.loading(getEntityActionToastLabel(resource, locale, 'deleting'));
    const deletingId = deleteTarget.id;

    try {
      await deleteResource(resource, deletingId);
      await loadItems();
      if (editingId === deletingId) closeModal();
      setDeleteTarget(null);
      toast.success(getEntityActionToastLabel(resource, locale, 'deleted'), { id: toastId });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('entity.deleteFailed');
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setDeleting(false);
    }
  }

  async function handleSingleImageUpload(fieldKey: string, file: File | null) {
    if (!file) return;

    setError(null);
    setImageFileNames((prev) => ({ ...prev, [fieldKey]: file.name }));
    setImageLoadErrors((prev) => ({ ...prev, [fieldKey]: false }));
    try {
      const result = await uploadImage(file);
      setFormValues((prev) => ({ ...prev, [fieldKey]: result.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('entity.uploadImageFailed'));
    }
  }

  async function handleMultipleImageUpload(fieldKey: string, files: FileList | null) {
    if (!files?.length) return;

    setError(null);
    setImageFileNames((prev) => ({
      ...prev,
      [fieldKey]: Array.from(files).map((file) => file.name).join(', '),
    }));
    setImageLoadErrors((prev) => ({ ...prev, [fieldKey]: false }));
    try {
      const results = await Promise.all(Array.from(files).map((file) => uploadImage(file)));
      setFormValues((prev) => {
        const current = Array.isArray(prev[fieldKey]) ? (prev[fieldKey] as string[]) : [];
        return {
          ...prev,
          [fieldKey]: [...current, ...results.map((item) => item.url)],
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('entity.uploadImagesFailed'));
    }
  }

  function updateImageList(fieldKey: string, index: number, nextValue: string) {
    setImageLoadErrors((prev) => ({ ...prev, [`${fieldKey}-${index}`]: false }));
    setFormValues((prev) => {
      const current = Array.isArray(prev[fieldKey]) ? [...(prev[fieldKey] as string[])] : [];
      current[index] = nextValue;
      return { ...prev, [fieldKey]: current };
    });
  }

  function addImageListItem(fieldKey: string) {
    setFormValues((prev) => {
      const current = Array.isArray(prev[fieldKey]) ? [...(prev[fieldKey] as string[])] : [];
      return { ...prev, [fieldKey]: [...current, ''] };
    });
  }

  function removeImageListItem(fieldKey: string, index: number) {
    setImageLoadErrors((prev) => ({ ...prev, [`${fieldKey}-${index}`]: false }));
    setFormValues((prev) => {
      const current = Array.isArray(prev[fieldKey]) ? [...(prev[fieldKey] as string[])] : [];
      current.splice(index, 1);
      return { ...prev, [fieldKey]: current };
    });
  }

  function setImageInputMode(fieldKey: string, mode: ImageInputMode) {
    setImageInputModes((prev) => ({ ...prev, [fieldKey]: mode }));
  }

  function renderImageFieldHeader(field: EntityField, mode: ImageInputMode) {
    const options: Array<{ value: ImageInputMode; label: string; icon: ReactNode }> = [
      { value: 'file', label: t('entity.imageModeFile'), icon: <UploadIcon /> },
      { value: 'url', label: t('entity.imageModeUrl'), icon: <LinkIcon /> },
    ];

    return (
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <FieldLabel label={field.label} required={field.required} />
        <div className='relative grid h-10 w-full grid-cols-2 gap-1 overflow-hidden rounded-[14px] border border-slate-100 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:w-[210px]'>
          <span
            aria-hidden='true'
            className={cn(
              'absolute left-1 top-1 h-8 w-[calc(50%-0.375rem)] rounded-[11px] bg-[var(--admin-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              mode === 'url' && 'translate-x-[calc(100%+0.25rem)]',
            )}
          />
          {options.map((option) => {
            const active = mode === option.value;

            return (
              <button
                key={option.value}
                type='button'
                onClick={() => setImageInputMode(field.key, option.value)}
                className={cn(
                  'relative z-10 inline-flex items-center justify-center gap-1.5 rounded-[11px] px-3 text-[13px] font-semibold transition-colors duration-200',
                  active ? '!text-white' : '!text-slate-600 hover:bg-[var(--admin-primary-soft)] hover:!text-[var(--admin-primary-strong)]',
                )}
              >
                {option.icon}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderImagePreview(imageUrl: string, label: string, errorKey: string) {
    if (!imageUrl.trim()) return null;
    const previewUrl = resolveApiAssetUrl(imageUrl);

    return (
      <div className='overflow-hidden rounded-[16px] border border-slate-200 bg-white p-2'>
        {imageLoadErrors[errorKey] ? (
          <div className='grid min-h-[180px] place-items-center rounded-[12px] bg-red-50 px-4 text-center'>
            <p className='text-sm font-semibold text-red-700'>{t('entity.imageUrlLoadError')}</p>
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={label}
            loading='lazy'
            className='max-h-[240px] w-full rounded-[12px] object-cover'
            onError={() => setImageLoadErrors((prev) => ({ ...prev, [errorKey]: true }))}
            onLoad={() => setImageLoadErrors((prev) => ({ ...prev, [errorKey]: false }))}
          />
        )}
      </div>
    );
  }

  function renderFileDropzone(field: EntityField, value: unknown) {
    const imageUrls = Array.isArray(value)
      ? value.filter(isNonEmptyString)
      : typeof value === 'string' && value.trim()
        ? [value.trim()]
        : [];
    const multiple = field.type === 'images';
    const inputId = `${resource}-${field.key}-file-input`;
    const fieldFileName = imageFileNames[field.key];

    return (
      <>
        <input
          id={inputId}
          type='file'
          accept='image/*'
          multiple={multiple}
          hidden
          aria-label={field.label}
          onChange={(event) => {
            if (multiple) {
              void handleMultipleImageUpload(field.key, event.target.files);
            } else {
              void handleSingleImageUpload(field.key, event.target.files?.[0] ?? null);
            }
            event.target.value = '';
          }}
          className='hidden'
        />

        <div
          role='button'
          tabIndex={0}
          aria-label={field.label}
          className='group cursor-pointer rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-5 transition-colors duration-200 hover:border-[var(--admin-primary)] focus-visible:border-[var(--admin-primary)] focus-visible:outline-none focus-visible:shadow-[var(--admin-focus-ring)]'
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest('a, button, input, label')) return;
            document.getElementById(inputId)?.click();
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            document.getElementById(inputId)?.click();
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (multiple) {
              void handleMultipleImageUpload(field.key, event.dataTransfer.files);
            } else {
              void handleSingleImageUpload(field.key, event.dataTransfer.files?.[0] ?? null);
            }
          }}
        >
          {imageUrls.length ? (
            <div className='space-y-4'>
              <div className={cn('grid grid-cols-1 gap-3', multiple && 'sm:grid-cols-2')}>
                {imageUrls.map((imageUrl, index) => (
                  <div
                    key={`${field.key}-file-preview-${imageUrl}-${index}`}
                    className='space-y-2 rounded-[16px] border border-slate-300 bg-white p-2.5'
                  >
                    {renderImagePreview(
                      imageUrl,
                      `${field.label} ${index + 1}`,
                      multiple ? `${field.key}-${index}` : field.key,
                    )}
                    {multiple ? (
                      <Button
                        variant='remove'
                        type='button'
                        className='h-9 w-full rounded-[10px] px-3 py-1.5 text-xs'
                        onClick={() => removeImageListItem(field.key, index)}
                      >
                        {t('entity.remove')}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {fieldFileName ? (
                <p className='truncate text-center text-[13px] font-medium text-slate-500'>
                  {fieldFileName}
                </p>
              ) : null}
              <div className='flex justify-center'>
                <label
                  htmlFor={inputId}
                  onClick={(event) => event.stopPropagation()}
                  className='inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold leading-none text-slate-700 transition-colors duration-200 hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]'
                >
                  <UploadIcon />
                  {multiple ? t('entity.chooseOtherFiles') : t('entity.changeImage')}
                </label>
              </div>
            </div>
          ) : (
            <div className='grid min-h-[220px] place-items-center text-center'>
              <div className='flex max-w-md flex-col items-center gap-3'>
                <span className='grid h-12 w-12 place-items-center rounded-[16px] border border-slate-200 bg-slate-50 text-slate-500 transition-colors duration-200 group-hover:border-[var(--admin-primary-tint)] group-hover:bg-[var(--admin-primary-soft)] group-hover:text-[var(--admin-primary-strong)] group-focus-visible:border-[var(--admin-primary-tint)] group-focus-visible:bg-[var(--admin-primary-soft)] group-focus-visible:text-[var(--admin-primary-strong)]'>
                  <UploadIcon />
                </span>
                <div>
                  <p className='text-sm font-semibold text-slate-800'>
                    {multiple ? t('entity.noImagesYet') : t('entity.noImageSelected')}
                  </p>
                  <p className='mt-2 text-[13px] leading-6 text-slate-500'>
                    {multiple ? t('entity.dropImagesDescription') : t('entity.dropImageDescription')}
                  </p>
                </div>
                <label
                  htmlFor={inputId}
                  onClick={(event) => event.stopPropagation()}
                  className='inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold leading-none text-slate-700 transition-colors duration-200 hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-soft)] hover:text-[var(--admin-primary-strong)]'
                >
                  <UploadIcon />
                  {t('entity.chooseFile')}
                </label>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderUrlImageInput(field: EntityField, value: unknown) {
    if (field.type === 'image') {
      const imageUrl = typeof value === 'string' ? value : '';

      return (
        <div className='space-y-3'>
          <Input
            type='url'
            value={imageUrl}
            aria-label={`${field.label} URL`}
            placeholder={t('entity.pasteImageUrl')}
            onChange={(event) => {
              setImageLoadErrors((prev) => ({ ...prev, [field.key]: false }));
              setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }));
            }}
            size='md'
          />
          {imageUrl.trim() ? (
            renderImagePreview(imageUrl, field.label, field.key)
          ) : (
            <div className='grid min-h-[190px] place-items-center rounded-[18px] border border-dashed border-slate-300 bg-white px-4 text-center'>
              <div className='flex max-w-xs flex-col items-center gap-3'>
                <span className='grid h-11 w-11 place-items-center rounded-[14px] border border-slate-200 bg-white text-slate-500'>
                  <LinkIcon />
                </span>
                <p className='text-sm font-medium text-slate-500'>{t('entity.pasteImageUrlPreview')}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    const imageUrls = Array.isArray(value) ? value : [];
    const urlInputs = imageUrls.length ? imageUrls : [''];
    const previewEntries = imageUrls
      .map((imageUrl, index) => ({
        imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
        index,
      }))
      .filter((entry) => entry.imageUrl.length > 0);

    return (
      <div className='space-y-3'>
        {urlInputs.map((imageUrl, index) => (
          <div key={`${field.key}-url-${index}`} className='flex flex-col gap-3 sm:flex-row'>
            <Input
              type='url'
              value={String(imageUrl ?? '')}
              aria-label={`${field.label} URL ${index + 1}`}
              onChange={(event) => updateImageList(field.key, index, event.target.value)}
              placeholder={t('entity.pasteImageUrl')}
              size='md'
              className='flex-1'
            />
            {imageUrls.length ? (
              <Button
                variant='remove'
                type='button'
                className='h-10 rounded-[12px] px-4'
                onClick={() => removeImageListItem(field.key, index)}
              >
                {t('entity.remove')}
              </Button>
            ) : null}
          </div>
        ))}

        <Button
          variant='secondary'
          type='button'
          className='h-10 rounded-[12px] px-4'
          onClick={() => addImageListItem(field.key)}
        >
          {t('entity.addUrl')}
        </Button>

        {previewEntries.length ? (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {previewEntries.map(({ imageUrl, index }) => (
              <div key={`${field.key}-url-preview-${imageUrl}-${index}`}>
                {renderImagePreview(imageUrl, `${field.label} ${index + 1}`, `${field.key}-${index}`)}
              </div>
            ))}
          </div>
        ) : (
          <div className='grid min-h-[190px] place-items-center rounded-[18px] border border-dashed border-slate-300 bg-white px-4 text-center'>
            <div className='flex max-w-xs flex-col items-center gap-3'>
              <span className='grid h-11 w-11 place-items-center rounded-[14px] border border-slate-200 bg-white text-slate-500'>
                <LinkIcon />
              </span>
              <p className='text-sm font-medium text-slate-500'>{t('entity.pasteImageUrlPreview')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderImageField(field: EntityField, value: unknown) {
    const mode = imageInputModes[field.key] ?? 'file';

    return (
      <div className='space-y-3'>
        {renderImageFieldHeader(field, mode)}
        {mode === 'file' ? renderFileDropzone(field, value) : renderUrlImageInput(field, value)}
        {field.helpText && (
          <p className='rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-relaxed text-amber-700'>
            ⚠️ {field.helpText}
          </p>
        )}
      </div>
    );
  }

  function updateContentFieldValue(
    fieldKey: string,
    index: number,
    patch: Partial<ContentFieldFormValue>,
  ) {
    setFormValues((prev) => {
      const current = normalizeContentFieldFormValues(prev[fieldKey]);
      const next = current.length ? [...current] : [createContentFieldFormValue(0)];
      const existing = next[index] ?? createContentFieldFormValue(index);
      next[index] = { ...existing, ...patch };
      return { ...prev, [fieldKey]: next };
    });
  }

  function addContentFieldValue(fieldKey: string) {
    setFormValues((prev) => {
      const current = normalizeContentFieldFormValues(prev[fieldKey]);
      return {
        ...prev,
        [fieldKey]: [...current, createContentFieldFormValue(current.length)],
      };
    });
  }

  function removeContentFieldValue(fieldKey: string, index: number) {
    setFormValues((prev) => {
      const current = normalizeContentFieldFormValues(prev[fieldKey]);
      return {
        ...prev,
        [fieldKey]: current.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function renderContentFieldsEditor(field: EntityField, value: unknown) {
    const contentFields = normalizeContentFieldFormValues(value);

    return (
      <div className='rounded-[18px] border border-slate-200 bg-white p-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              {locale === 'vi' ? 'Trường khách cần điền' : 'Customer input fields'}
            </p>
            <p className='mt-1 text-[13px] leading-5 text-slate-500'>
              {locale === 'vi'
                ? 'Các trường này sẽ hiện ở bước Nội dung của Studio, theo đúng ảnh nền đang chọn.'
                : 'These fields appear in the Studio content step for this background.'}
            </p>
          </div>
          <Button
            type='button'
            variant='secondary'
            leftIcon={<PlusIcon />}
            className='h-10 rounded-[12px] px-4'
            onClick={() => addContentFieldValue(field.key)}
          >
            {locale === 'vi' ? 'Thêm trường' : 'Add field'}
          </Button>
        </div>

        {contentFields.length === 0 ? (
          <div className='mt-4 rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500'>
            {locale === 'vi'
              ? 'Chưa có trường nội dung nào. Bấm “Thêm trường” để tạo ô khách cần nhập.'
              : 'No content fields yet. Add one to collect customer input.'}
          </div>
        ) : (
          <div className='mt-4 space-y-3'>
            {contentFields.map((contentField, index) => (
              <div
                key={`${field.key}-${index}`}
                className='rounded-[16px] border border-slate-200 bg-slate-50 p-3'
              >
                <div className='grid grid-cols-1 gap-3 lg:grid-cols-12'>
                  <label className='space-y-1 lg:col-span-3'>
                    <span className='text-[12px] font-semibold text-slate-600'>
                      {locale === 'vi' ? 'Nhãn hiển thị' : 'Label'}
                    </span>
                    <Input
                      value={contentField.label}
                      size='md'
                      placeholder={locale === 'vi' ? 'VD: Tên người nhận' : 'Recipient name'}
                      onKeyDown={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        const label = event.target.value;
                        updateContentFieldValue(field.key, index, {
                          label,
                          key: contentField.key || buildContentFieldKey(label, index),
                        });
                      }}
                    />
                  </label>

                  <label className='space-y-1 lg:col-span-2'>
                    <span className='text-[12px] font-semibold text-slate-600'>Key</span>
                    <Input
                      value={contentField.key}
                      size='md'
                      placeholder='title'
                      onChange={(event) =>
                        updateContentFieldValue(field.key, index, { key: event.target.value })
                      }
                    />
                  </label>

                  <label className='space-y-1 lg:col-span-2'>
                    <span className='text-[12px] font-semibold text-slate-600'>
                      {locale === 'vi' ? 'Loại ô nhập' : 'Input type'}
                    </span>
                    <Select
                      value={contentField.type}
                      onChange={(event) =>
                        updateContentFieldValue(field.key, index, {
                          type: event.target.value as ContentFieldInputType,
                        })
                      }
                    >
                      {CONTENT_FIELD_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className='space-y-1 lg:col-span-3'>
                    <span className='text-[12px] font-semibold text-slate-600'>
                      Placeholder
                    </span>
                    <Input
                      value={contentField.placeholder}
                      size='md'
                      placeholder={locale === 'vi' ? 'VD: Nguyễn Văn A' : 'Example value'}
                      onKeyDown={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        updateContentFieldValue(field.key, index, { placeholder: event.target.value })
                      }
                    />
                  </label>

                  <div className='flex items-end gap-2 lg:col-span-2'>
                    <label className='flex h-10 flex-1 items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700'>
                      <input
                        type='checkbox'
                        checked={contentField.required}
                        onChange={(event) =>
                          updateContentFieldValue(field.key, index, { required: event.target.checked })
                        }
                      />
                      {locale === 'vi' ? 'Bắt buộc' : 'Required'}
                    </label>
                    <Button
                      type='button'
                      variant='remove'
                      className='h-10 rounded-[12px] px-3'
                      onClick={() => removeContentFieldValue(field.key, index)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>

                  <label className='space-y-1 lg:col-span-12'>
                    <span className='text-[12px] font-semibold text-slate-600'>
                      {locale === 'vi' ? 'Ghi chú nhỏ dưới ô nhập' : 'Help text'}
                    </span>
                    <Input
                      value={contentField.helpText}
                      size='md'
                      placeholder={locale === 'vi' ? 'VD: Dòng này in ở góc dưới ảnh' : 'Short hint shown under the field'}
                      onKeyDown={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        updateContentFieldValue(field.key, index, { helpText: event.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderTableCell(column: EntityTableColumn, row: Record<string, unknown>) {
    const field = column.field;
    const value = getRelatedDisplayValue(row, field.key);

    if (resource === 'frame-options' && field.key === 'frameSize') {
      const width = row.widthCm;
      const height = row.heightCm;
      const label = typeof row.label === 'string' && row.label.trim() ? row.label.trim() : '';
      const name = typeof row.name === 'string' && row.name.trim() ? row.name.trim() : '';

      if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
        return (
          <span className='block text-center font-semibold tabular-nums text-slate-900'>
            {NUMBER_FORMAT.format(width)} x {NUMBER_FORMAT.format(height)}
          </span>
        );
      }

      return (
        <span className='block text-center font-semibold text-slate-900'>
          {label || name || '-'}
        </span>
      );
    }

    if (field.key === 'colorHex') {
      const hex = typeof value === 'string' ? value.trim() : '';
      if (!hex) return <span className='text-slate-400'>-</span>;
      if (resource === 'frame-options') {
        return (
          <div className='flex items-center justify-center'>
            <span
              className='h-8 w-8 shrink-0 rounded-full border border-slate-300 shadow-sm ring-2 ring-white'
              style={{ backgroundColor: hex }}
              title={hex}
            />
          </div>
        );
      }
      return (
        <div className='flex items-center gap-2'>
          <span
            className='h-4.5 w-4.5 shrink-0 rounded-full border border-slate-300 shadow-sm'
            style={{ backgroundColor: hex }}
          />
          <span className='font-mono text-[13px] text-slate-700'>{hex}</span>
        </div>
      );
    }

    if (typeof value === 'string' && field.key.toLowerCase().includes('status')) {
      const statusValue = value.trim();
      if (!statusValue) return <span className='text-slate-400'>-</span>;

      return <StatusBadge value={statusValue} t={t} />;
    }

    if (field.type === 'image') {
      const imageUrl = typeof value === 'string' ? value.trim() : '';

      return (
        <div className='flex items-center justify-center'>
          <TableThumbnail
            src={imageUrl}
            alt={field.label}
            zoomLabel={locale === 'vi' ? 'Phóng to ảnh' : 'Zoom image'}
            onOpen={(src) => openImagePreview(src, field.label)}
          />
        </div>
      );
    }

    if (field.type === 'images') {
      const imageUrls = Array.isArray(value)
        ? value.filter(isNonEmptyString)
        : [];

      return (
        <div className='flex items-center justify-center gap-2'>
          <TableThumbnail
            src={imageUrls[0]}
            alt={field.label}
            zoomLabel={locale === 'vi' ? 'Phóng to ảnh' : 'Zoom image'}
            onOpen={(src) => openImagePreview(src, field.label)}
          />
          {imageUrls.length > 1 ? (
            <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500'>
              +{imageUrls.length - 1}
            </span>
          ) : null}
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <span
          className={cn(
            'block font-semibold tabular-nums text-slate-900',
            isCurrencyColumn(field.key) ? 'text-right' : 'text-center',
          )}
        >
          {isCurrencyColumn(field.key) ? CURRENCY_FORMAT.format(value) : NUMBER_FORMAT.format(value)}
        </span>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Badge tone={value ? 'success' : 'neutral'} className='px-2.5 py-1 text-[12px]'>
          {value ? t('status.active') : t('status.inactive')}
        </Badge>
      );
    }

    const textValue = displayCellValue(value);
    const safeTextValue = textValue.trim() ? textValue : '-';
    const normalizedKey = field.key.toLowerCase();

    if (
      field.type === 'datetime' ||
      normalizedKey === 'createdat' ||
      normalizedKey === 'updatedat'
    ) {
      const formattedDate = formatEntityDateTime(value, locale);

      return (
        <span title={safeTextValue} className='block text-center text-[13px] font-semibold tabular-nums text-slate-700'>
          {formattedDate}
        </span>
      );
    }

    if (field.type === 'tags') {
      const tags = parseTagsInput(value);
      if (tags.length === 0) {
        return <span className='text-slate-400'>-</span>;
      }

      return (
        <div className='flex max-w-[320px] flex-wrap gap-1.5'>
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className='rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600'
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 ? (
            <span className='rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500'>
              +{tags.length - 4}
            </span>
          ) : null}
        </div>
      );
    }

    if (field.type === 'json') {
      return (
        <code
          title={safeTextValue}
          className='block max-w-[300px] truncate rounded-lg bg-slate-100 px-2 py-1 font-mono text-[12px] font-medium text-slate-600'
        >
          {safeTextValue}
        </code>
      );
    }

    if (normalizedKey === 'name' || normalizedKey.endsWith('name') || normalizedKey === 'title') {
      return (
        <span title={safeTextValue} className='block max-w-[260px] truncate font-semibold text-slate-900'>
          {safeTextValue}
        </span>
      );
    }

    if (normalizedKey === 'slug' || normalizedKey.includes('url')) {
      return (
        <span title={safeTextValue} className='block max-w-[260px] truncate text-[13px] font-medium text-slate-500'>
          {safeTextValue}
        </span>
      );
    }

    if (normalizedKey.includes('description')) {
      return (
        <span title={safeTextValue} className='block max-w-[320px] truncate text-[13px] leading-6 text-slate-500'>
          {safeTextValue}
        </span>
      );
    }

    return (
      <span title={safeTextValue} className='block max-w-[280px] truncate text-slate-700'>
        {safeTextValue}
      </span>
    );
  }

  return (
    <PageShell scrollable={false}>
      <AdminToolbar
          icon={<AdminNavIcon name={getEntityIconName(resource)} className='h-6 w-6' />}
          title={pageTitle ?? title}
          description={pageDescription ?? t('entity.description')}
          badge={
            <Badge
              tone='info'
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold !text-slate-950',
                loading && 'min-w-[112px] justify-center',
              )}
            >
              {loading ? (
                <LoadingSpinner
                  size='sm'
                  label={getEntityLoadingLabel(resource, locale)}
                  className='border-current/25 border-t-current'
                />
              ) : (
                getEntityCountLabel(resource, meta?.total ?? items.length, locale)
              )}
            </Badge>
          }
        >
        <AdminToolbarField
          wide
          icon={<AdminToolbarIcon name='search' />}
          label={t('common.search')}
          className='sm:w-[300px]'
        >
          <Input
            value={search}
            aria-label={t('common.search')}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={getEntityUiText(locale, 'searchPlaceholder')}
            className={adminToolbarInputClass}
          />
        </AdminToolbarField>

        {hasDateFilter ? (
          <AdminToolbarDateRangeField
            fromLabel={getEntityUiText(locale, 'dateFrom')}
            fromValue={dateFromFilter}
            label={getEntityUiText(locale, 'dateRange')}
            onFromChange={updateDateFrom}
            onToChange={updateDateTo}
            toLabel={getEntityUiText(locale, 'dateTo')}
            toValue={dateToFilter}
            className='sm:w-[250px]'
          />
        ) : null}

        {hasEntityFilters ? (
          <Button
            type='button'
            variant='secondary'
            leftIcon={<FilterIconWithBadge count={drawerFilterCount} />}
            onClick={() => setFilterDrawerOpen(true)}
            className={cn(adminToolbarButtonClass, 'px-4')}
          >
            {getEntityUiText(locale, 'filters')}
          </Button>
        ) : null}

        {showResetFilters ? (
          <Button
            variant='secondary'
            type='button'
            onClick={resetFilters}
            leftIcon={<AdminToolbarIcon name='reset' />}
            className={adminToolbarButtonClass}
          >
            {getEntityUiText(locale, 'reset')}
          </Button>
        ) : null}

        <Button
          onClick={openCreateModal}
          size='md'
          variant='primary'
          leftIcon={<PlusIcon />}
          className={cn(adminToolbarButtonClass, 'px-4')}
        >
          {createButtonLabel ?? `${t('common.create')} ${title}`}
        </Button>

        {error ? (
          <p className='basis-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </p>
        ) : null}
      </AdminToolbar>

      {hasEntityFilters ? (
      <EntityFilterDrawer
        open={filterDrawerOpen}
        draftFilters={draftFilters}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        hasPriceFilter={hasPriceFilter}
        onClose={() => setFilterDrawerOpen(false)}
        onDraftChange={setDraftFilters}
        onApply={applyEntityFilters}
        labels={{
          allCategories: getEntityUiText(locale, 'allCategories'),
          allStatuses: getEntityUiText(locale, 'allStatuses'),
          apply: getEntityUiText(locale, 'applyFilters'),
          category: categoryField?.label ?? getEntityUiText(locale, 'allCategories'),
          filterTitle: getEntityUiText(locale, 'filterTitle'),
          priceMax: getEntityUiText(locale, 'priceMax'),
          priceMin: getEntityUiText(locale, 'priceMin'),
          priceRange: getEntityUiText(locale, 'priceRange'),
          reset: getEntityUiText(locale, 'reset'),
          selectedCount: (count) => `${count} ${locale === 'vi' ? 'mục đã chọn' : 'selected'}`,
          status: t('common.status'),
        }}
      />
      ) : null}

      <Table containerClassName='min-h-0' minWidth='1080px'>
        <TableHeader>
          <tr>
            {visibleColumns.map((column) => {
              const sortable = isEntityColumnSortable(column, resource);
              const className = getEntityTableColumnClass(column, resource);

              return sortable ? (
                <SortableTableHead
                  key={column.id}
                  sortKey={column.field.key}
                  defaultSorts={DEFAULT_TABLE_SORTS}
                  sorts={sorts}
                  defaultDirection={getEntityDefaultSortDirection(column)}
                  onSortChange={handleTableSort}
                  className={className}
                >
                  {column.label}
                </SortableTableHead>
              ) : (
                <TableHead key={column.id} className={className}>
                  {column.label}
                </TableHead>
              );
            })}
            <TableHead className={ENTITY_ACTION_COLUMN_CLASS}>{t('common.actions')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading && items.length === 0 ? (
            <TableEmptyState colSpan={visibleColumns.length + 1} variant='loading'>
              {t('common.loading')}
            </TableEmptyState>
          ) : items.length === 0 ? (
            <TableEmptyState colSpan={visibleColumns.length + 1}>
              {getEntityEmptyMessage(resource, locale)}
            </TableEmptyState>
          ) : (
            items.map((item, index) => {
              const row = item as unknown as Record<string, unknown> & { id?: string };

              return (
                <TableRow key={row.id ?? `${resource}-${index}`} hoverable>
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn('text-slate-700', getEntityTableColumnClass(column, resource))}
                    >
                      {renderTableCell(column, row)}
                    </TableCell>
                  ))}
                  <TableCell className={cn('whitespace-nowrap', ENTITY_ACTION_COLUMN_CLASS)}>
                    <TableActions>
                      <Tooltip content={t('common.edit')}>
                        <TableActionButton
                          tone='edit'
                          onClick={() => startEdit(item)}
                          aria-label={t('common.edit')}
                        >
                          <EditIcon />
                        </TableActionButton>
                      </Tooltip>
                      <Tooltip content={t('common.delete')}>
                        <TableActionButton
                          tone='delete'
                          onClick={() => requestDelete(row)}
                          aria-label={t('common.delete')}
                        >
                          <TrashIcon />
                        </TableActionButton>
                      </Tooltip>
                    </TableActions>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={meta?.page ?? page}
        totalPages={meta?.totalPages ?? meta?.total_pages ?? 1}
        total={meta?.total ?? items.length}
        itemLabel={getEntityNoun(resource, locale)}
        pageLabel={getEntityUiText(locale, 'page')}
        pageSize={meta?.limit ?? pageSize}
        pageSizeLabel={locale === 'vi' ? PAGE_SIZE_LABEL.vi : PAGE_SIZE_LABEL.en}
        totalLabel={t('common.total')}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        previousDisabled={page <= 1}
        nextDisabled={page >= (meta?.totalPages ?? meta?.total_pages ?? 1)}
        rangeLabel={(from, to, total, itemLabel) =>
          getEntityPaginationRangeLabel(locale, from, to, total, itemLabel)
        }
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => prev + 1)}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        ariaLabelledby='entity-manager-modal-title'
        panelClassName='max-w-4xl !border-0'
      >
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <ModalHeader className='items-center !border-b-[#4f9ed6] !bg-[#4fa6dc] px-5 py-5 sm:px-6 sm:py-5'>
            <div className='flex min-h-10 min-w-0 items-center gap-4 pr-2'>
              <span className='inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#ffe16a] text-[#18385a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]'>
                <AdminNavIcon name={getEntityIconName(resource)} className='h-6 w-6' />
              </span>
              <h3
                id='entity-manager-modal-title'
                className='text-2xl font-semibold leading-none tracking-[-0.02em] text-white sm:text-[26px]'
              >
                {editingId ? `${t('common.edit')} ${title}` : `${t('common.create')} ${title}`}
              </h3>
            </div>

            <motion.button
              type='button'
              onClick={closeModal}
              aria-label={t('common.close')}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className='inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-md bg-transparent p-2 text-white transition-colors duration-200 hover:bg-white/90 hover:text-[#2479b2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe16a]/45'
            >
              <CloseIcon />
            </motion.button>
          </ModalHeader>

          <ModalBody className='!bg-slate-50 !py-5 sm:!py-5'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-12'>
              {fields.map((field) => {
                const value = formValues[field.key];

                return (
                  <div key={field.key} className={cn(fieldCardClass, getFieldLayoutClass(field, resource))}>
                    {field.type !== 'checkbox' && field.type !== 'image' && field.type !== 'images' ? (
                      <FieldLabel label={field.label} required={field.required} />
                    ) : null}

                    {field.type === 'textarea' ? (
                      <Textarea
                        value={String(value ?? '')}
                        required={field.required}
                        aria-label={field.label}
                        placeholder={getInputPlaceholder(field)}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                        className='!min-h-[104px]'
                      />
                    ) : null}

                    {field.type === 'json' ? (
                      <Textarea
                        value={String(value ?? '')}
                        required={field.required}
                        aria-label={field.label}
                        placeholder={field.placeholder ?? '{ }'}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                        className='min-h-[180px] font-mono text-xs leading-6'
                      />
                    ) : null}

                    {field.type === 'tags' ? (
                      <div className='space-y-2'>
                        <Input
                          value={String(value ?? '')}
                          required={field.required}
                          aria-label={field.label}
                          placeholder={field.placeholder ?? 'VD: black, short, toc nam'}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                          }
                          size='md'
                        />
                        <p className='text-xs font-medium text-slate-500'>
                          Nhập nhiều tag bằng dấu phẩy.
                        </p>
                      </div>
                    ) : null}

                    {field.type === 'content-fields' ? renderContentFieldsEditor(field, value) : null}

                    {field.type === 'select' ? (
                      <Select
                        value={String(value ?? '')}
                        required={field.required}
                        aria-label={field.label}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                      >
                        <option value=''>{getSelectPlaceholder(field)}</option>
                        {(field.options ?? []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {field.key.toLowerCase().includes('status')
                              ? getStatusBadgeLabel(option.value, t)
                              : option.label}
                          </option>
                        ))}
                      </Select>
                    ) : null}

                    {field.type === 'checkbox' ? (
                      <Checkbox
                        checked={Boolean(value)}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: event.target.checked }))
                        }
                        label={field.label}
                        description={field.key === 'featured' ? undefined : `${t('entity.toggle')} ${field.label}`}
                        containerClassName='rounded-[16px] border-slate-200 bg-white px-4 py-3 shadow-none'
                      />
                    ) : null}

                    {field.type === 'datetime' ? (
                      <Input
                        type='datetime-local'
                        value={String(value ?? '')}
                        required={field.required}
                        aria-label={field.label}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                        size='md'
                      />
                    ) : null}

                    {(field.type === 'text' || field.type === 'number') ? (
                      <div className={cn(field.key === 'colorHex' && 'flex items-center gap-2')}>
                        <Input
                          type={field.type}
                          value={String(value ?? '')}
                          required={field.required}
                          aria-label={field.label}
                          placeholder={getInputPlaceholder(field)}
                          onChange={(event) => {
                            const val = event.target.value;
                            setFormValues((prev) => {
                              const updated = { ...prev, [field.key]: val };
                              if (resource === 'frame-colors' && field.key === 'name') {
                                const normalized = val.trim().toLowerCase();
                                const matchedHex = DEFAULT_COLOR_MAP[normalized];
                                if (matchedHex && (!prev.colorHex || prev.colorHex === '')) {
                                  updated.colorHex = matchedHex;
                                }
                              }
                              return updated;
                            });
                          }}
                          size='md'
                          className='flex-1'
                        />
                        {field.key === 'colorHex' && (
                          <div className='relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 shadow-sm'>
                            <input
                              type='color'
                              value={getValidHexForInput(value)}
                              onChange={(event) => {
                                const val = event.target.value;
                                setFormValues((prev) => ({ ...prev, [field.key]: val }));
                              }}
                              className='absolute h-[150%] w-[150%] cursor-pointer border-none p-0 bg-transparent'
                            />
                          </div>
                        )}
                      </div>
                    ) : null}

                    {(field.type === 'image' || field.type === 'images') ? renderImageField(field, value) : null}
                  </div>
                );
              })}
            </div>

            {error ? (
              <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </p>
            ) : null}
          </ModalBody>

          <ModalFooter className='!bg-white'>
            <Button
              variant='cancel'
              type='button'
              onClick={closeModal}
              className='h-10 w-full rounded-[12px] px-4 sm:w-auto'
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={saving}
              loading={saving}
              className='h-10 w-full rounded-[12px] px-5 disabled:translate-y-0 sm:w-auto'
            >
              {saving
                ? t('entity.saving')
                : getEntitySubmitLabel(resource, locale, Boolean(editingId))}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal
        open={Boolean(imagePreview)}
        onClose={closeImagePreview}
        ariaLabelledby='entity-image-preview-title'
        containerClassName='bg-slate-950/70'
        panelClassName='max-w-6xl !border-0 !bg-slate-950 text-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.85)]'
      >
        <div className='flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950 px-4 py-3 sm:px-5'>
          <h3
            id='entity-image-preview-title'
            className='truncate text-base font-semibold text-white'
          >
            {imagePreview?.alt}
          </h3>
          <motion.button
            type='button'
            onClick={closeImagePreview}
            aria-label={t('common.close')}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className='inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-md bg-transparent p-2 text-white transition-colors duration-200 hover:bg-white/90 hover:text-[#2479b2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe16a]/45'
          >
            <CloseIcon />
          </motion.button>
        </div>
        <div className='grid min-h-[220px] place-items-center bg-slate-950 p-3 sm:p-5'>
          {imagePreview ? (
            <img
              src={imagePreview.src}
              alt={imagePreview.alt}
              className='max-h-[78vh] w-full rounded-[16px] object-contain'
            />
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={getEntityDeleteDialogTitle(resource, locale)}
        description={getEntityDeleteDialogDescription(resource, locale, deleteTarget?.label)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        tone='danger'
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </PageShell>
  );
}
