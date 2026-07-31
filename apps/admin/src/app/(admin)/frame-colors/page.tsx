'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function FrameColorsPage() {
  const { t } = useI18n();
  const fields: EntityField[] = [
    { key: 'name', label: t('frameFields.frameColor'), type: 'text', required: true },
    { key: 'colorHex', label: t('frameFields.colorHex'), type: 'text' },
  ];

  return (
    <EntityManager
      title={t('frameFields.colorSingular')}
      resource='frame-colors'
      fields={fields}
      pageTitle={t('frameFields.colorsTitle')}
      pageDescription={t('frameFields.colorsDescription')}
      createButtonLabel={t('frameFields.createColor')}
    />
  );
}
