'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CharactersPage() {
  const { t } = useI18n();
  const fields: EntityField[] = [
    { key: 'name', label: t('characterPartsPage.name'), type: 'text', required: true },
    {
      key: 'slug',
      label: t('entity.slug'),
      type: 'text',
      placeholder: 'short-black-hair',
      helpText: t('characterPartsPage.slugHelp'),
    },
    {
      key: 'type',
      label: t('characterPartsPage.group'),
      type: 'select',
      required: true,
      options: [
        { label: t('characterPartsPage.face'), value: 'FACE' },
        { label: t('characterPartsPage.hair'), value: 'HAIR' },
        { label: t('characterPartsPage.torso'), value: 'TORSO' },
        { label: t('characterPartsPage.legs'), value: 'LEGS' },
        { label: t('characterPartsPage.hat'), value: 'HAT' },
        { label: t('characterPartsPage.accessory'), value: 'ACCESSORY' },
      ],
    },
    {
      key: 'imageUrl',
      label: t('characterPartsPage.image'),
      type: 'image',
      required: true,
      helpText: t('characterPartsPage.imageHelp'),
    },
    { key: 'priceAdjustment', label: t('characterPartsPage.sellingPrice'), type: 'number', required: true },
    { key: 'compareAtPrice', label: t('characterPartsPage.comparePrice'), type: 'number' },
    {
      key: 'category',
      label: t('characterPartsPage.category'),
      type: 'text',
      placeholder: 'classic, graduation',
    },
    {
      key: 'availability',
      label: t('characterPartsPage.availability'),
      type: 'select',
      options: [
        { label: t('characterPartsPage.available'), value: 'available' },
        { label: t('characterPartsPage.outOfStock'), value: 'out_of_stock' },
        { label: t('characterPartsPage.unavailable'), value: 'unavailable' },
      ],
    },
    {
      key: 'compatibility',
      label: t('characterPartsPage.compatibility'),
      type: 'json',
      advanced: true,
      placeholder: '{\n  "bodyScale": ["standard"]\n}',
      helpText: t('characterPartsPage.compatibilityHelp'),
    },
    { key: 'sortOrder', label: t('characterPartsPage.sortOrder'), type: 'number' },
    {
      key: 'tags',
      label: t('characterPartsPage.tags'),
      type: 'tags',
      placeholder: 'black, short, classic',
    },
    {
      key: 'status',
      label: t('common.status'),
      type: 'select',
      options: [
        { label: t('status.active'), value: 'active' },
        { label: t('status.inactive'), value: 'inactive' },
      ],
    },
  ];
  const tableFields = ['name', 'imageUrl', 'type', 'priceAdjustment', 'availability', 'status'].flatMap(
    (key) => fields.filter((field) => field.key === key),
  );

  return (
    <EntityManager
      title={t('characterPartsPage.singular')}
      resource='character-parts'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('characterPartsPage.title')}
      pageDescription={t('characterPartsPage.description')}
      createButtonLabel={t('characterPartsPage.create')}
    />
  );
}
