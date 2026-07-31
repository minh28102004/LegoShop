'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, {
  type EntityField,
} from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';
import { listResource } from '@/modules/admin/services/adminApi';
import type {
  Accessory,
  Character,
  CharacterPreset,
  Collection,
  FrameBackground,
  FrameOption,
} from '@/modules/admin/types/admin.types';

export default function ProductsPage() {
  const { t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characterPresets, setCharacterPresets] = useState<CharacterPreset[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [frameOptions, setFrameOptions] = useState<FrameOption[]>([]);
  const [frameBackgrounds, setFrameBackgrounds] = useState<FrameBackground[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    Promise.all([
      listResource('collections').catch(() => [] as Collection[]),
      listResource('character-presets').catch(() => [] as CharacterPreset[]),
      listResource('characters').catch(() => [] as Character[]),
      listResource('frame-options').catch(() => [] as FrameOption[]),
      listResource('frame-backgrounds').catch(() => [] as FrameBackground[]),
      listResource('accessories').catch(() => [] as Accessory[]),
    ]).then(([
      nextCollections,
      nextPresets,
      nextCharacters,
      nextFrames,
      nextBackgrounds,
      nextAccessories,
    ]) => {
      setCollections(nextCollections);
      setCharacterPresets(nextPresets);
      setCharacters(nextCharacters);
      setFrameOptions(nextFrames);
      setFrameBackgrounds(nextBackgrounds);
      setAccessories(nextAccessories);
    });
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      {
        key: 'name',
        label: t('productsPage.name'),
        type: 'text',
        required: true,
      },
      {
        key: 'slug',
        label: t('productsPage.slug'),
        type: 'text',
      },
      {
        key: 'productType',
        label: t('productFields.productType'),
        type: 'select',
        required: true,
        options: [
          { label: t('productFields.types.frameTemplate'), value: 'frame_template' },
          { label: t('productFields.types.legoCharacter'), value: 'lego_character' },
          { label: t('productFields.types.loosePart'), value: 'loose_part' },
          { label: t('productFields.types.customFrame'), value: 'custom_frame' },
          { label: t('productFields.types.customCharacter'), value: 'custom_character' },
          { label: t('productFields.types.legacyFinished'), value: 'finished' },
          { label: t('productFields.types.legacyPremade'), value: 'premade_character' },
          { label: t('productFields.types.diyKit'), value: 'diy_kit' },
          { label: t('productFields.types.legacyRetail'), value: 'retail' },
        ],
      },
      {
        key: 'collectionId',
        label: t('productFields.collection'),
        type: 'select',
        options: collections.map((collection) => ({
          label: collection.name,
          value: collection.id,
        })),
      },
      {
        key: 'characterPresetId',
        label: t('productFields.characterPreset'),
        type: 'select',
        options: characterPresets
          .filter((preset) => preset.status === 'active')
          .map((preset) => ({
            label: preset.name,
            value: preset.id,
          })),
        helpText: t('productFields.presetHelp'),
      },
      {
        key: 'basePrice',
        label: t('productsPage.basePrice'),
        type: 'number',
        required: true,
      },
      {
        key: 'compareAtPrice',
        label: t('productFields.comparePrice'),
        type: 'number',
      },
      {
        key: 'category',
        label: t('productFields.category'),
        type: 'text',
        placeholder: 'VD: graduation, birthday',
      },
      {
        key: 'availability',
        label: t('productFields.availability'),
        type: 'select',
        options: [
          { label: t('productFields.available'), value: 'available' },
          { label: t('productFields.outOfStock'), value: 'out_of_stock' },
          { label: t('productFields.unavailable'), value: 'unavailable' },
        ],
      },
      {
        key: 'inventory',
        label: t('productFields.inventory'),
        type: 'number',
        helpText: t('productFields.inventoryHelp'),
      },
      {
        key: 'status',
        label: t('productsPage.status'),
        type: 'select',
        options: [
          { label: t('status.active'), value: 'active' },
          { label: t('status.inactive'), value: 'inactive' },
        ],
      },
      {
        key: 'shortDescription',
        label: t('productFields.shortDescription'),
        type: 'textarea',
        placeholder: t('productFields.shortDescriptionPlaceholder'),
      },
      {
        key: 'description',
        label: t('productsPage.descriptionLabel'),
        type: 'textarea',
        placeholder: t('productsPage.descriptionPlaceholder'),
      },
      {
        key: 'thumbnailUrl',
        label: t('productFields.thumbnail'),
        type: 'image',
      },
      {
        key: 'images',
        label: t('productsPage.images'),
        type: 'images',
        placeholder: t('productsPage.images'),
      },
      {
        key: 'componentConfig',
        label: t('productFields.componentConfig'),
        type: 'product-config',
        productConfigOptions: {
          frames: frameOptions.map((option) => ({
            id: option.id,
            name:
              option.label?.trim() ||
              option.name ||
              `${option.widthCm ?? '?'} × ${option.heightCm ?? '?'}`,
            imageUrl: option.imageUrl,
            price: option.price,
          })),
          backgrounds: frameBackgrounds.map((background) => ({
            id: background.id,
            name: background.title,
            imageUrl: background.thumbnailUrl || background.imageUrl,
          })),
          characters: characters.map((character) => ({
            id: character.id,
            name: character.name,
            imageUrl: character.imageUrl,
            price: character.price,
          })),
          accessories: accessories.map((accessory) => ({
            id: accessory.id,
            name: accessory.name,
            imageUrl: accessory.imageUrl || accessory.iconUrl,
            price: accessory.price,
          })),
        },
        placeholder:
          '{\n' +
          '  "frame": { "id": "frame-option-id", "type": "frame", "name": "30x30", "quantity": 1 },\n' +
          '  "background": { "id": "background-id", "type": "background", "name": "Happy Wedding 1", "quantity": 1 },\n' +
          '  "characters": [{ "id": "character-id", "type": "character", "name": "Nhân vật LEGO", "quantity": 2 }],\n' +
          '  "accessories": [{ "id": "accessory-id", "type": "accessory", "name": "Charm trái tim", "quantity": 1 }],\n' +
          '  "includedItems": [{ "id": "gift-box", "name": "Hộp quà", "quantity": 1, "icon": "gift" }]\n' +
          '}',
        helpText: t('productFields.componentConfigHelp'),
      },
      { key: 'published', label: t('productFields.published'), type: 'checkbox' },
      { key: 'featured', label: t('productsPage.featured'), type: 'checkbox' },
    ],
    [
      accessories,
      characterPresets,
      characters,
      collections,
      frameBackgrounds,
      frameOptions,
      t,
    ],
  );

  const tableFields = ['name', 'basePrice', 'thumbnailUrl', 'published'].flatMap(
    (key) => fields.filter((field) => field.key === key),
  );

  return (
    <EntityManager
      title={t('productsPage.singularTitle')}
      resource='products'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('productsPage.title')}
      pageDescription={t('productFields.pageDescription')}
      createButtonLabel={t('productsPage.createProduct')}
    />
  );
}
