'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function FrameSizesPage() {
  const { t } = useI18n();
  const fields: EntityField[] = [
    { key: 'label', label: t('frameFields.sizeName'), type: 'text', required: true },
    { key: 'price', label: t('frameFields.price'), type: 'number', required: true },
    { key: 'popular', label: t('frameFields.popular'), type: 'checkbox' },
  ];

  return (
    <EntityManager
      title={t('frameFields.sizeSingular')}
      resource='frame-sizes'
      fields={fields}
      pageTitle={t('frameFields.sizesTitle')}
      pageDescription={t('frameFields.sizesDescription')}
      createButtonLabel={t('frameFields.createSize')}
    />
  );
}
