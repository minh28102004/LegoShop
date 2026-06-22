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
      label: 'Cau hinh truong noi dung (JSON)',
      type: 'json',
      placeholder:
        '[{"key":"title","label":"Ten / loi tua ngan","type":"text","required":true,"placeholder":"VD: Tu & Lan"},{"key":"date","label":"Ngay ky niem","type":"date","required":false},{"key":"message","label":"Loi nhan","type":"textarea","required":false}]',
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
