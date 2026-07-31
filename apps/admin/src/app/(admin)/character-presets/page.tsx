'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';
import { listResource } from '@/modules/admin/services/adminApi';
import type { CharacterPart } from '@/modules/admin/types/admin.types';
import { formatVnd } from '@/lib/i18n/format';

export default function CharacterPresetsPage() {
  const { t, locale } = useI18n();
  const [parts, setParts] = useState<CharacterPart[]>([]);

  useEffect(() => {
    listResource('character-parts')
      .then(setParts)
      .catch(() => setParts([]));
  }, []);

  const fields = useMemo<EntityField[]>(() => {
    const optionsFor = (type: CharacterPart['type']) =>
      parts
        .filter((part) => part.type === type && part.status === 'active' && part.isActive !== false)
        .map((part) => ({
          label: `${part.name} · ${formatVnd(part.priceAdjustment, locale)}`,
          value: part.id,
        }));

    return [
      {
        key: 'name',
        label: t('characterPresetsPage.name'),
        type: 'text',
        required: true,
        placeholder: t('characterPresetsPage.namePlaceholder'),
      },
      {
        key: 'slug',
        label: t('entity.slug'),
        type: 'text',
        placeholder: t('characterPresetsPage.slugPlaceholder'),
      },
      {
        key: 'description',
        label: t('characterPresetsPage.descriptionField'),
        type: 'textarea',
        placeholder: t('characterPresetsPage.descriptionPlaceholder'),
      },
      {
        key: 'previewImageUrl',
        label: t('characterPresetsPage.previewImage'),
        type: 'image',
      },
      {
        key: 'facePartId',
        label: t('characterPresetsPage.face'),
        type: 'select',
        required: true,
        options: optionsFor('FACE'),
      },
      {
        key: 'hairPartId',
        label: t('characterPresetsPage.hair'),
        type: 'select',
        required: true,
        options: optionsFor('HAIR'),
      },
      {
        key: 'torsoPartId',
        label: t('characterPresetsPage.torso'),
        type: 'select',
        required: true,
        options: optionsFor('TORSO'),
      },
      {
        key: 'legsPartId',
        label: t('characterPresetsPage.legs'),
        type: 'select',
        required: true,
        options: optionsFor('LEGS'),
      },
      {
        key: 'hatPartId',
        label: t('characterPresetsPage.optionalHat'),
        type: 'select',
        options: optionsFor('HAT'),
      },
      {
        key: 'accessoryPartIds',
        label: t('characterPresetsPage.accessories'),
        type: 'multi-select',
        options: optionsFor('ACCESSORY'),
        helpText: t('characterPresetsPage.accessoriesHelp'),
      },
      { key: 'sortOrder', label: t('characterPresetsPage.sortOrder'), type: 'number' },
      {
        key: 'isBuilderPreset',
        label: t('characterPresetsPage.builderVisible'),
        type: 'checkbox',
      },
      {
        key: 'isSellable',
        label: t('characterPresetsPage.sellable'),
        type: 'checkbox',
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
  }, [locale, parts, t]);

  const tableFields = ['name', 'previewImageUrl', 'sortOrder', 'isBuilderPreset', 'isSellable', 'status'].flatMap(
    (key) => fields.filter((field) => field.key === key),
  );

  return (
    <EntityManager
      title={t('characterPresetsPage.singular')}
      resource='character-presets'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('characterPresetsPage.title')}
      pageDescription={t('characterPresetsPage.description')}
      createButtonLabel={t('characterPresetsPage.create')}
    />
  );
}
