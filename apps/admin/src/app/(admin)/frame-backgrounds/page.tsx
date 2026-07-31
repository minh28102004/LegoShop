'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';
import { listResource } from '@/modules/admin/services/adminApi';
import type { FrameOption } from '@/modules/admin/types/admin.types';

function getFrameOptionLabel(option: FrameOption) {
  if (option.label?.trim()) return option.label.trim();
  if (option.name?.trim()) return option.name.trim();
  if (typeof option.widthCm === 'number' && typeof option.heightCm === 'number') {
    return `${option.widthCm} × ${option.heightCm}`;
  }
  return option.id;
}

export default function FrameBackgroundsPage() {
  const { t } = useI18n();
  const [frameOptions, setFrameOptions] = useState<FrameOption[]>([]);

  useEffect(() => {
    listResource('frame-options')
      .then(setFrameOptions)
      .catch(() => setFrameOptions([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      { key: 'imageUrl', label: t('frameBackgroundsPage.image'), type: 'image', required: true },
      { key: 'title', label: t('frameBackgroundsPage.titleField'), type: 'text', required: true },
      { key: 'description', label: t('frameBackgroundFields.customerDescription'), type: 'textarea' },
      { key: 'instructions', label: t('frameBackgroundFields.instructions'), type: 'textarea' },
      {
        key: 'contentFields',
        label: t('frameBackgroundFields.contentFields'),
        type: 'content-fields',
      },
      {
        key: 'frameOptionIds',
        label: t('frameBackgroundFields.applicableFrames'),
        type: 'multi-select',
        options: frameOptions.map((option) => ({
          value: option.id,
          label: getFrameOptionLabel(option),
        })),
        helpText: t('frameBackgroundFields.applicableFramesHelp'),
      },
      { key: 'sortOrder', label: t('frameBackgroundsPage.sortOrder'), type: 'number' },
      {
        key: 'status',
        label: t('frameBackgroundsPage.status'),
        type: 'select',
        options: [
          { label: t('status.active'), value: 'active' },
          { label: t('status.inactive'), value: 'inactive' },
        ],
      },
    ],
    [frameOptions, t],
  );

  const tableFields = ['title', 'imageUrl', 'sortOrder', 'status'].flatMap((key) =>
    fields.filter((field) => field.key === key),
  );

  return (
    <EntityManager
      title={t('frameBackgroundsPage.singularTitle')}
      resource='frame-backgrounds'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('frameBackgroundsPage.title')}
      pageDescription={t('frameBackgroundsPage.description')}
      createButtonLabel={t('frameBackgroundsPage.createBackground')}
    />
  );
}
