'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/components/admin/entity-manager';
import { listResource } from '@/lib/admin-api';
import type { TemplateCategory } from '@/types/admin';

export default function TemplatesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);

  useEffect(() => {
    listResource('template-categories')
      .then((data) => setCategories(data as TemplateCategory[]))
      .catch(() => setCategories([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'imageUrl', label: 'Image', type: 'image' },
      {
        key: 'configJson',
        label: 'Config JSON',
        type: 'json',
        placeholder: '{ "elements": [] }',
      },
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

  return <EntityManager title='Template' resource='templates' fields={fields} />;
}
