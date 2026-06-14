'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CollectionsPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'name', label: t('collectionsPage.name'), type: 'text', required: true },
    {
      key: 'status',
      label: t('collectionsPage.status'),
      type: 'select',
      options: [
        { label: t('status.active'), value: 'active' },
        { label: t('status.inactive'), value: 'inactive' },
      ],
    },
    { key: 'slug', label: t('collectionsPage.slug'), type: 'text' },
    { key: 'description', label: t('collectionsPage.descriptionField'), type: 'textarea' },
    { key: 'imageUrl', label: t('collectionsPage.image'), type: 'image' },
  ];

  return (
    <EntityManager
      title={t('collectionsPage.singularTitle')}
      resource='collections'
      fields={fields}
      pageTitle={t('collectionsPage.title')}
      pageDescription={t('collectionsPage.description')}
      createButtonLabel={t('collectionsPage.createCollection')}
    />
  );
}

