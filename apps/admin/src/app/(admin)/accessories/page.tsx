'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/components/admin/entity-manager';
import { listResource } from '@/lib/admin-api';
import type { AccessoryCategory } from '@/types/admin';

export default function AccessoriesPage() {
  const [categories, setCategories] = useState<AccessoryCategory[]>([]);

  useEffect(() => {
    listResource('accessory-categories')
      .then((data) => setCategories(data as AccessoryCategory[]))
      .catch(() => setCategories([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'imageUrl', label: 'Image', type: 'image' },
      { key: 'iconUrl', label: 'Icon', type: 'image' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'active', value: 'active' },
          { label: 'inactive', value: 'inactive' },
        ],
      },
      {
        key: 'categoryId',
        label: 'Category',
        type: 'select',
        options: categories.map((item) => ({ label: item.name, value: item.id })),
      },
    ],
    [categories],
  );

  return <EntityManager title='Accessory' resource='accessories' fields={fields} />;
}
