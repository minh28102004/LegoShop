'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function FrameBackgroundsPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'imageUrl', label: t('frameBackgroundsPage.image'), type: 'image', required: true },
    { key: 'title', label: t('frameBackgroundsPage.titleField'), type: 'text', required: true },
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
