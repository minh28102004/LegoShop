'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createResource,
  deleteResource,
  listResource,
  type ResourceDataMap,
  type ResourceKey,
  updateResource,
  uploadImage,
} from '@/lib/admin-api';

type FieldType = 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'json' | 'image' | 'images';

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
};

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
}: EntityManagerProps<K>) {
  const [items, setItems] = useState<ResourceDataMap[K][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() =>
    toInitialValues(fields),
  );

  const visibleColumns = useMemo(() => fields.slice(0, 6), [fields]);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await listResource(resource);
      setItems(data as ResourceDataMap[K][]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [resource]);

  function resetForm() {
    setFormValues(toInitialValues(fields));
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
    setEditingId((item as { id?: string }).id ?? null);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const yes = window.confirm('Delete this item?');
    if (!yes) return;

    setError(null);
    try {
      await deleteResource(resource, id);
      await loadItems();
      if (editingId === id) closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleSingleImageUpload(fieldKey: string, file: File | null) {
    if (!file) return;

    setError(null);
    try {
      const result = await uploadImage(file);
      setFormValues((prev) => ({ ...prev, [fieldKey]: result.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  }

  async function handleMultipleImageUpload(fieldKey: string, files: FileList | null) {
    if (!files?.length) return;

    setError(null);
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
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    }
  }

  function updateImageList(fieldKey: string, index: number, nextValue: string) {
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
    setFormValues((prev) => {
      const current = Array.isArray(prev[fieldKey]) ? [...(prev[fieldKey] as string[])] : [];
      current.splice(index, 1);
      return { ...prev, [fieldKey]: current };
    });
  }

  function renderTableCell(column: EntityField, value: unknown) {
    if (column.type === 'image') {
      const imageUrl = typeof value === 'string' ? value.trim() : '';
      if (!imageUrl) return '-';

      return (
        <div className='flex items-center gap-3'>
          <img
            src={imageUrl}
            alt={column.label}
            className='h-10 w-10 rounded-xl border border-stone-200 object-cover'
          />
          <span className='max-w-[220px] truncate text-stone-600'>{imageUrl}</span>
        </div>
      );
    }

    if (column.type === 'images') {
      const imageUrls = Array.isArray(value)
        ? value.filter(isNonEmptyString)
        : [];

      if (!imageUrls.length) return '-';

      return (
        <div className='flex items-center gap-2'>
          {imageUrls.slice(0, 3).map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={column.label}
              className='h-10 w-10 rounded-xl border border-stone-200 object-cover'
            />
          ))}
          {imageUrls.length > 3 ? (
            <span className='rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-500'>
              +{imageUrls.length - 3}
            </span>
          ) : null}
        </div>
      );
    }

    return displayCellValue(value);
  }

  return (
    <div className='space-y-6'>
      <section className='rounded-[28px] border border-stone-200/80 bg-white/85 p-5 shadow-[0_12px_40px_rgba(120,83,39,0.08)] backdrop-blur'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500'>
              Manage data
            </p>
            <h2 className='mt-2 text-2xl font-semibold tracking-tight'>{title}</h2>
            <p className='mt-1 text-sm text-stone-600'>
              Create, edit, and delete records in a modal flow.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600'>
              {loading ? 'Loading records...' : `${items.length} record${items.length === 1 ? '' : 's'}`}
            </div>
            <button
              type='button'
              onClick={openCreateModal}
              className='rounded-2xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/10 transition hover:-translate-y-0.5 hover:bg-stone-800'
            >
              New {title}
            </button>
          </div>
        </div>

        {error ? (
          <p className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </p>
        ) : null}
      </section>

      <section className='overflow-hidden rounded-[28px] border border-stone-200/80 bg-white/90 shadow-[0_12px_40px_rgba(120,83,39,0.08)]'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[900px] text-sm'>
            <thead className='bg-stone-50 text-left text-stone-500'>
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.key} className='px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]'>
                    {column.label}
                  </th>
                ))}
                <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-stone-100'>
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className='px-4 py-10 text-center text-stone-500'>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className='px-4 py-10 text-center text-stone-500'>
                    No records yet.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const row = item as unknown as Record<string, unknown> & { id?: string };

                  return (
                    <tr key={row.id ?? `${resource}-${index}`} className='transition hover:bg-stone-50/80'>
                      {visibleColumns.map((column) => (
                        <td key={column.key} className='px-4 py-3 align-top text-stone-700'>
                          {renderTableCell(column, row[column.key])}
                        </td>
                      ))}
                      <td className='px-4 py-3 align-top'>
                        <div className='flex flex-wrap gap-2'>
                          <button
                            type='button'
                            onClick={() => startEdit(item)}
                            className='rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100'
                          >
                            Edit
                          </button>
                          <button
                            type='button'
                            onClick={() => row.id && handleDelete(row.id)}
                            className='rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100'
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-sm'>
          <div
            className='w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(15,15,15,0.3)]'
            role='dialog'
            aria-modal='true'
            aria-labelledby='entity-manager-modal-title'
            onClick={closeModal}
          >
            <div
              className='flex items-center justify-between border-b border-stone-200 px-6 py-5'
              onClick={(event) => event.stopPropagation()}
            >
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500'>
                  {editingId ? 'Edit record' : 'Create record'}
                </p>
                <h3 id='entity-manager-modal-title' className='mt-2 text-2xl font-semibold tracking-tight'>
                  {editingId ? `Edit ${title}` : `Create ${title}`}
                </h3>
              </div>
              <button
                type='button'
                onClick={closeModal}
                className='rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100'
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='max-h-[calc(100vh-140px)] overflow-y-auto p-6'
              onClick={(event) => event.stopPropagation()}
            >
              <div className='grid gap-4 md:grid-cols-2'>
                {fields.map((field) => {
                  const value = formValues[field.key];

                  return (
                    <div key={field.key} className='block text-sm'>
                      <span className='mb-1.5 block font-medium text-stone-700'>
                        {field.label}
                        {field.required ? ' *' : ''}
                      </span>

                      {field.type === 'textarea' ? (
                        <textarea
                          value={String(value ?? '')}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                          }
                          className='min-h-[110px] w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500'
                        />
                      ) : null}

                      {field.type === 'json' ? (
                        <textarea
                          value={String(value ?? '')}
                          required={field.required}
                          placeholder={field.placeholder ?? '{ }'}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                          }
                          className='min-h-[140px] w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-mono text-xs outline-none transition focus:border-stone-500'
                        />
                      ) : null}

                      {field.type === 'select' ? (
                        <select
                          value={String(value ?? '')}
                          required={field.required}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                          }
                          className='w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500'
                        >
                          <option value=''>Select...</option>
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : null}

                      {field.type === 'checkbox' ? (
                        <div className='flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3'>
                          <input
                            type='checkbox'
                            checked={Boolean(value)}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, [field.key]: event.target.checked }))
                            }
                            className='h-5 w-5 rounded border-stone-300'
                          />
                          <span className='text-sm text-stone-600'>Toggle {field.label}</span>
                        </div>
                      ) : null}

                      {(field.type === 'text' || field.type === 'number') ? (
                        <input
                          type={field.type}
                          value={String(value ?? '')}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                          }
                          className='w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500'
                        />
                      ) : null}

                      {field.type === 'image' ? (
                        <div className='space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4'>
                          {typeof value === 'string' && value ? (
                            <img
                              src={value}
                              alt={field.label}
                              className='h-44 w-full rounded-2xl border border-stone-200 object-cover'
                            />
                          ) : (
                            <div className='grid h-44 w-full place-items-center rounded-2xl border border-dashed border-stone-300 bg-white text-sm text-stone-500'>
                              No image selected
                            </div>
                          )}
                          <input
                            type='url'
                            value={String(value ?? '')}
                            placeholder={field.placeholder ?? 'Paste image URL or upload a file'}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                            }
                            className='w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500'
                          />
                          <input
                            type='file'
                            accept='image/*'
                            onChange={(event) =>
                              handleSingleImageUpload(field.key, event.target.files?.[0] ?? null)
                            }
                            className='block w-full text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-800'
                          />
                        </div>
                      ) : null}

                      {field.type === 'images' ? (
                        <div className='space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4'>
                          {Array.isArray(value) && value.length ? (
                            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                              {value.map((imageUrl, index) => (
                                <div key={`${field.key}-${index}`} className='space-y-2 rounded-2xl bg-white p-2 shadow-sm'>
                                  <img
                                    src={String(imageUrl)}
                                    alt={`${field.label} ${index + 1}`}
                                    className='h-28 w-full rounded-xl border border-stone-200 object-cover'
                                  />
                                  <button
                                    type='button'
                                    onClick={() => removeImageListItem(field.key, index)}
                                    className='w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100'
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className='grid h-36 place-items-center rounded-2xl border border-dashed border-stone-300 bg-white text-sm text-stone-500'>
                              No images yet
                            </div>
                          )}

                          <div className='space-y-3'>
                            {Array.isArray(value) && value.length
                              ? value.map((imageUrl, index) => (
                                  <div key={`${field.key}-input-${index}`} className='flex gap-3'>
                                    <input
                                      type='url'
                                      value={String(imageUrl ?? '')}
                                      onChange={(event) =>
                                        updateImageList(field.key, index, event.target.value)
                                      }
                                      placeholder='Paste image URL'
                                      className='flex-1 rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500'
                                    />
                                    <button
                                      type='button'
                                      onClick={() => removeImageListItem(field.key, index)}
                                      className='rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100'
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              : null}

                            <div className='flex flex-wrap gap-3'>
                              <button
                                type='button'
                                onClick={() => addImageListItem(field.key)}
                                className='rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100'
                              >
                                Add URL
                              </button>
                              <input
                                type='file'
                                accept='image/*'
                                multiple
                                onChange={(event) => handleMultipleImageUpload(field.key, event.target.files)}
                                className='block flex-1 text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-800'
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {error ? (
                <p className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {error}
                </p>
              ) : null}

              <div className='mt-6 flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-5'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={saving}
                  className='rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/10 transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:translate-y-0 disabled:opacity-60'
                >
                  {saving ? 'Saving...' : editingId ? 'Update record' : 'Create record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}