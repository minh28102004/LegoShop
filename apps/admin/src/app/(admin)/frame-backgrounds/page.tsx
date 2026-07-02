'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function FrameBackgroundsPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'imageUrl', label: t('frameBackgroundsPage.image'), type: 'image', required: true },
    { key: 'title', label: t('frameBackgroundsPage.titleField'), type: 'text', required: true },
    { key: 'description', label: 'Mo ta hien cho khach', type: 'textarea' },
    { key: 'instructions', label: 'Huong dan khach dien noi dung', type: 'textarea' },
    {
      key: 'contentFields',
      label: 'Cấu hình nội dung khách cần điền',
      type: 'content-fields',
    },
    {
      key: 'frameOptionIds',
      label: 'FrameOption IDs áp dụng (JSON array, trống = mọi khung)',
      type: 'json',
      placeholder: '["frame-option-id-1", "frame-option-id-2"]',
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
  ];

  return (
    <EntityManager
      title={t('frameBackgroundsPage.singularTitle')}
      resource='frame-backgrounds'
      fields={fields}
      pageTitle={t('frameBackgroundsPage.title')}
      pageDescription={t('frameBackgroundsPage.description')}
      createButtonLabel={t('frameBackgroundsPage.createBackground')}
    />
  );
}
