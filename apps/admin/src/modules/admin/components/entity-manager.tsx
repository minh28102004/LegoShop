'use client';

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import Badge, { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Checkbox from '@/common/components/ui/Checkbox';
import Input from '@/common/components/ui/Input';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@/common/components/ui/Modal';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Select from '@/common/components/ui/Select';
import Tooltip from '@/common/components/ui/Tooltip';
import Table, {
  TableActionButton,
  TableActions,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/Table';
import Textarea from '@/common/components/ui/Textarea';
import { cn } from '@/common/utils/cn';
import {
  createResource,
  deleteResource,
  listResource,
  type ResourceDataMap,
  type ResourceKey,
  updateResource,
  uploadImage,
} from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';

type FieldType = 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'json' | 'image' | 'images';
type ImageInputMode = 'file' | 'url';

export type EntityField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
};

type EntityManagerProps<K extends ResourceKey> = {
  title: string;
  resource: K;
  fields: EntityField[];
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

function isCurrencyColumn(key: string) {
  const normalized = key.toLowerCase();
  return normalized.includes('price') || normalized.includes('amount') || normalized.includes('total');
}

function getFieldLayoutClass(field: EntityField, resource: ResourceKey) {
  const normalizedKey = field.key.toLowerCase();

  if (field.type === 'textarea') return 'lg:col-span-12';
  if (field.type === 'json') return 'lg:col-span-12';
  if (field.type === 'image' || field.type === 'images') return 'lg:col-span-12';
  if (field.type === 'checkbox') return 'lg:col-span-4 xl:col-span-3 max-w-[320px]';
  if (field.type === 'number') return 'lg:col-span-3';
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

function getEntityTableColumnClass(column: EntityTableColumn) {
  const field = column.field;
  const normalizedKey = field.key.toLowerCase();

  if (field.type === 'number') return 'w-[132px] text-right';
  if (field.type === 'image' || field.type === 'images') return 'w-[112px] text-center';
  if (normalizedKey.includes('status')) return 'w-[160px] text-center';
  if (field.type === 'json') return 'min-w-[280px] max-w-[420px]';
  if (normalizedKey.includes('description')) return 'min-w-[240px] max-w-[360px]';
  if (normalizedKey === 'slug' || normalizedKey.includes('url') || normalizedKey.includes('link')) {
    return 'min-w-[180px] max-w-[240px]';
  }
  if (isPrimaryField(field)) return 'min-w-[200px] max-w-[280px]';

  return getTableColumnClass(field);
}

function isPrimaryField(field: EntityField) {
  const normalizedKey = field.key.toLowerCase();
  return normalizedKey === 'name' || normalizedKey.endsWith('name') || normalizedKey === 'title';
}

function getEntityTableColumns(fields: EntityField[], resource: ResourceKey): EntityTableColumn[] {
  const columns: EntityTableColumn[] = [];
  const usedKeys = new Set<string>();

  const orderByResource: Partial<Record<ResourceKey, string[]>> = {
    products: ['name', 'basePrice', 'slug', 'description', 'images', 'status'],
    templates: ['name', 'categoryId', 'configJson', 'imageUrl', 'status'],
    accessories: ['name', 'categoryId', 'imageUrl', 'iconUrl', 'status'],
    banners: ['title', 'sortOrder', 'linkUrl', 'imageUrl', 'status'],
    collections: ['name', 'slug', 'description', 'imageUrl', 'status'],
    'template-categories': ['name', 'slug'],
    'accessory-categories': ['name', 'slug'],
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

  (orderByResource[resource] ?? []).forEach((key) => addField(fields.find((field) => field.key === key)));
  fields.forEach(addField);

  return columns.slice(0, 6);
}

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
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

function TableThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = src?.trim();

  return (
    <span className='grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400'>
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={alt}
          className='h-full w-full object-cover'
          onError={() => setFailed(true)}
        />
      ) : (
        <ImagePlaceholderIcon />
      )}
    </span>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className='admin-label flex items-center gap-1.5'>
      <span>{label}</span>
      {required ? <span className='text-red-500'>*</span> : null}
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
      values[field.key] = 0;
      return;
    }
    values[field.key] = '';
  });
  return values;
}

function serializeFormValue(type: FieldType, rawValue: unknown): unknown {
  if (type === 'checkbox') return Boolean(rawValue);
  if (type === 'number') {
    const asNumber = Number(rawValue);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }
  if (type === 'image') {
    return typeof rawValue === 'string' ? rawValue.trim() : '';
  }
  if (type === 'images') {
    if (!Array.isArray(rawValue)) return [];
    return rawValue
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0);
  }
  if (type === 'json') {
    if (typeof rawValue !== 'string' || !rawValue.trim()) return undefined;
    return JSON.parse(rawValue);
  }
  if (type === 'text' || type === 'textarea' || type === 'select') {
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

export default function EntityManager<K extends ResourceKey>({
  title,
  resource,
  fields,
  pageTitle,
  pageDescription,
  createButtonLabel,
}: EntityManagerProps<K>) {
  const { t } = useI18n();
  const [items, setItems] = useState<ResourceDataMap[K][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() =>
    toInitialValues(fields),
  );
  const [imageInputModes, setImageInputModes] = useState<Record<string, ImageInputMode>>(() =>
    getInitialImageInputModes(fields, toInitialValues(fields)),
  );
  const [imageFileNames, setImageFileNames] = useState<Record<string, string>>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const visibleColumns = useMemo(() => getEntityTableColumns(fields, resource), [fields, resource]);
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

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listResource(resource);
      setItems(data as ResourceDataMap[K][]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('entity.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [resource, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
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
      } else if (field.type === 'checkbox') {
        nextValues[field.key] = Boolean(value);
      } else if (field.type === 'images') {
        nextValues[field.key] = Array.isArray(value) ? [...value] : [];
      } else if (field.type === 'image') {
        nextValues[field.key] = typeof value === 'string' ? value : '';
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = formValues[field.key];
        const value = serializeFormValue(field.type, raw);
        if (value === '' || value === undefined || value === null) continue;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : t('entity.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const yes = window.confirm(t('entity.deleteConfirm'));
    if (!yes) return;

    setError(null);
    try {
      await deleteResource(resource, id);
      await loadItems();
      if (editingId === id) closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('entity.deleteFailed'));
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
        <div className='relative grid h-10 w-full grid-cols-2 gap-1 overflow-hidden rounded-[14px] border border-slate-200 bg-slate-100 p-1 sm:w-[210px]'>
          <span
            aria-hidden='true'
            className={cn(
              'absolute left-1 top-1 h-8 w-[calc(50%-0.375rem)] rounded-[11px] bg-blue-600 shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
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
                  active ? 'text-white' : 'text-slate-600 hover:bg-white hover:text-blue-700',
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

    return (
      <div className='overflow-hidden rounded-[16px] border border-slate-200 bg-white p-2'>
        {imageLoadErrors[errorKey] ? (
          <div className='grid min-h-[180px] place-items-center rounded-[12px] bg-red-50 px-4 text-center'>
            <p className='text-sm font-semibold text-red-700'>{t('entity.imageUrlLoadError')}</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={label}
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
          className='cursor-pointer rounded-[18px] border border-dashed border-blue-200 bg-slate-50 px-4 py-5 transition-colors duration-200 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100'
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
                    className='space-y-2 rounded-[16px] border border-slate-200 bg-white p-2.5'
                  >
                    {renderImagePreview(
                      imageUrl,
                      `${field.label} ${index + 1}`,
                      multiple ? `${field.key}-${index}` : field.key,
                    )}
                    {multiple ? (
                      <Button
                        variant='danger'
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
                  className='inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold leading-none text-blue-700 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-100'
                >
                  <UploadIcon />
                  {multiple ? t('entity.chooseOtherFiles') : t('entity.changeImage')}
                </label>
              </div>
            </div>
          ) : (
            <div className='grid min-h-[220px] place-items-center text-center'>
              <div className='flex max-w-md flex-col items-center gap-3'>
                <span className='grid h-12 w-12 place-items-center rounded-[16px] border border-blue-100 bg-blue-50 text-blue-600'>
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
                  className='inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold leading-none text-blue-700 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-100'
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
            <div className='grid min-h-[190px] place-items-center rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 text-center'>
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
                variant='secondary'
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
          <div className='grid min-h-[190px] place-items-center rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 text-center'>
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
      </div>
    );
  }

  function renderTableCell(column: EntityTableColumn, row: Record<string, unknown>) {
    const field = column.field;
    const value = getRelatedDisplayValue(row, field.key);

    if (typeof value === 'string' && field.key.toLowerCase().includes('status')) {
      const statusValue = value.trim();
      if (!statusValue) return <span className='text-slate-400'>-</span>;

      return <StatusBadge value={statusValue} t={t} />;
    }

    if (field.type === 'image') {
      const imageUrl = typeof value === 'string' ? value.trim() : '';

      return (
        <div className='flex items-center justify-center'>
          <TableThumbnail src={imageUrl} alt={field.label} />
        </div>
      );
    }

    if (field.type === 'images') {
      const imageUrls = Array.isArray(value)
        ? value.filter(isNonEmptyString)
        : [];

      return (
        <div className='flex items-center justify-center gap-2'>
          <TableThumbnail src={imageUrls[0]} alt={field.label} />
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
        <span className='font-semibold tabular-nums text-slate-900'>
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
    <PageShell className='space-y-6'>
      <Card className='p-5 sm:p-6'>
        <SectionHeader
          eyebrow={t('entity.manageData')}
          title={pageTitle ?? title}
          description={pageDescription ?? t('entity.description')}
          actions={
            <>
              <Badge tone='info' className='rounded-full px-4 py-2 text-sm font-medium'>
                {loading
                  ? t('entity.loadingRecords')
                  : `${items.length} ${items.length === 1 ? t('entity.record') : t('entity.records')}`}
              </Badge>
              <Button
                onClick={openCreateModal}
                size='md'
                variant='primary'
                leftIcon={<PlusIcon />}
                className='h-10 rounded-xl px-4'
              >
                {createButtonLabel ?? `${t('common.create')} ${title}`}
              </Button>
            </>
          }
        />

        {error ? (
          <p className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </p>
        ) : null}
      </Card>

      <Table className='min-w-[1080px]'>
        <TableHeader>
          <tr>
            {visibleColumns.map((column) => (
              <TableHead key={column.id} className={getEntityTableColumnClass(column)}>
                {column.label}
              </TableHead>
            ))}
            <TableHead className='text-right'>{t('common.actions')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableEmptyState colSpan={visibleColumns.length + 1}>
              {t('common.loading')}
            </TableEmptyState>
          ) : items.length === 0 ? (
            <TableEmptyState colSpan={visibleColumns.length + 1}>
              {t('entity.noRecordsYet')}
            </TableEmptyState>
          ) : (
            items.map((item, index) => {
              const row = item as unknown as Record<string, unknown> & { id?: string };

              return (
                <TableRow key={row.id ?? `${resource}-${index}`} hoverable>
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn('text-slate-700', getEntityTableColumnClass(column))}
                    >
                      {renderTableCell(column, row)}
                    </TableCell>
                  ))}
                  <TableCell className='whitespace-nowrap text-right'>
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
                          onClick={() => row.id && handleDelete(row.id)}
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

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        ariaLabelledby='entity-manager-modal-title'
        panelClassName='max-w-4xl'
      >
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <ModalHeader className='items-center px-5 py-4 sm:px-6 sm:py-4'>
            <div className='min-w-0 pr-2'>
              <h3
                id='entity-manager-modal-title'
                className='text-2xl font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[26px]'
              >
                {editingId ? `${t('common.edit')} ${title}` : `${t('common.create')} ${title}`}
              </h3>
            </div>

            <button
              type='button'
              onClick={closeModal}
              aria-label={t('common.close')}
              className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-slate-500 transition-colors duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100'
            >
              <CloseIcon />
            </button>
          </ModalHeader>

          <ModalBody className='!py-5 sm:!py-5'>
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
                        containerClassName='rounded-[16px] border-slate-200 bg-slate-50 px-4 py-3 shadow-none'
                      />
                    ) : null}

                    {(field.type === 'text' || field.type === 'number') ? (
                      <Input
                        type={field.type}
                        value={String(value ?? '')}
                        required={field.required}
                        aria-label={field.label}
                        placeholder={getInputPlaceholder(field)}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                        size='md'
                      />
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

          <ModalFooter>
            <Button
              variant='secondary'
              type='button'
              onClick={closeModal}
              className='h-10 w-full rounded-[12px] px-4 sm:w-auto'
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={saving}
              className='h-10 w-full rounded-[12px] px-5 disabled:translate-y-0 sm:w-auto'
            >
              {saving
                ? t('entity.saving')
                : editingId
                  ? t('entity.updateRecord')
                  : t('entity.createRecordAction')}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </PageShell>
  );
}
