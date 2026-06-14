'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function BannersPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'title', label: t('bannersPage.titleField'), type: 'text' },
    { key: 'sortOrder', label: t('bannersPage.sortOrder'), type: 'number' },
    {
      key: 'status',
      label: t('bannersPage.status'),
      type: 'select',
      options: [
        { label: t('status.active'), value: 'active' },
        { label: t('status.inactive'), value: 'inactive' },
      ],
    },
    { key: 'linkUrl', label: t('bannersPage.linkUrl'), type: 'text' },
    { key: 'imageUrl', label: t('bannersPage.image'), type: 'image', required: true },
  ];

  return (
    <EntityManager
      title={t('bannersPage.singularTitle')}
      resource='banners'
      fields={fields}
      pageTitle={t('bannersPage.title')}
      pageDescription={t('bannersPage.description')}
      createButtonLabel={t('bannersPage.createBanner')}
    />
  );
}

