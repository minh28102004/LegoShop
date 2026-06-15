'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { listResource } from '@/modules/admin/services/adminApi';
import type { AccessoryCategory } from '@/modules/admin/types/admin.types';
import { useI18n } from '@/lib/i18n/useI18n';

export default function AccessoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<AccessoryCategory[]>([]);

  useEffect(() => {
    listResource('accessory-categories')
      .then((data) => setCategories(data as AccessoryCategory[]))
      .catch(() => setCategories([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      { key: 'name', label: t('accessoriesPage.name'), type: 'text', required: true },
      { key: 'price', label: t('accessoriesPage.price'), type: 'number', required: true },
      {
        key: 'status',
        label: t('accessoriesPage.status'),
        type: 'select',
        options: [
          { label: t('status.active'), value: 'active' },
          { label: t('status.inactive'), value: 'inactive' },
        ],
      },
      {
        key: 'categoryId',
        label: t('accessoriesPage.category'),
        type: 'select',
        options: categories.map((item) => ({ label: item.name, value: item.id })),
      },
      { key: 'imageUrl', label: t('accessoriesPage.image'), type: 'image' },
      { key: 'iconUrl', label: t('accessoriesPage.icon'), type: 'image' },
    ],
    [categories, t],
  );

  return (
    <EntityManager
      title={t('accessoriesPage.singularTitle')}
      resource='accessories'
      fields={fields}
      pageTitle={t('accessoriesPage.title')}
      pageDescription={t('accessoriesPage.description')}
      createButtonLabel={t('accessoriesPage.createAccessory')}
    />
  );
}

