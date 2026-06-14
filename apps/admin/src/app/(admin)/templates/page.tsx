'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { listResource } from '@/modules/admin/services/adminApi';
import type { TemplateCategory } from '@/modules/admin/types/admin.types';
import { useI18n } from '@/lib/i18n/useI18n';

export default function TemplatesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<TemplateCategory[]>([]);

  useEffect(() => {
    listResource('template-categories')
      .then((data) => setCategories(data as TemplateCategory[]))
      .catch(() => setCategories([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      { key: 'name', label: t('templatesPage.name'), type: 'text', required: true },
      {
        key: 'status',
        label: t('templatesPage.status'),
        type: 'select',
        options: [
          { label: t('status.active'), value: 'active' },
          { label: t('status.inactive'), value: 'inactive' },
        ],
      },
      {
        key: 'categoryId',
        label: t('templatesPage.category'),
        type: 'select',
        options: categories.map((item) => ({ label: item.name, value: item.id })),
      },
      { key: 'imageUrl', label: t('templatesPage.image'), type: 'image' },
      {
        key: 'configJson',
        label: t('templatesPage.configJson') + ' (Tuỳ chọn - Bỏ trống nếu không cần)',
        type: 'json',
        placeholder: 'Không bắt buộc. Để trống nếu chỉ muốn tải ảnh nền...',
      },
    ],
    [categories, t],
  );

  return (
    <EntityManager
      title={t('templatesPage.singularTitle')}
      resource='templates'
      fields={fields}
      pageTitle={t('templatesPage.title')}
      pageDescription={t('templatesPage.description')}
      createButtonLabel={t('templatesPage.createTemplate')}
    />
  );
}

