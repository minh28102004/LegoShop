'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function FrameOptionsPage() {
  const { t } = useI18n();
  const fields: EntityField[] = [
    { key: 'imageUrl', label: t('frameFields.image'), type: 'image' },
    { key: 'widthCm', label: t('frameFields.width'), type: 'number', required: true },
    { key: 'heightCm', label: t('frameFields.height'), type: 'number', required: true },
    { key: 'price', label: t('frameFields.price'), type: 'number', required: true },
    { key: 'stock', label: t('frameFields.stockOptional'), type: 'number' },
    { key: 'colorHex', label: t('frameFields.color'), type: 'text', placeholder: '#ffffff' },
    {
      key: 'colorVariantsText',
      label: t('frameFields.colorList'),
      type: 'textarea',
      placeholder: 'Black #111111\nWhite #ffffff',
    },
  ];
  const tableFields: EntityField[] = [
    { key: 'imageUrl', label: t('frameFields.image'), type: 'image' },
    { key: 'frameSize', label: t('frameFields.frameSize'), type: 'text' },
    { key: 'price', label: t('frameFields.price'), type: 'number' },
    { key: 'stock', label: t('frameFields.stock'), type: 'number' },
    { key: 'colorHex', label: t('frameFields.color'), type: 'text' },
  ];

  return (
    <EntityManager
      title={t('frameFields.frameSingular')}
      resource='frame-options'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('frameFields.framesTitle')}
      pageDescription={t('frameFields.framesDescription')}
      createButtonLabel={t('frameFields.createFrame')}
    />
  );
}
