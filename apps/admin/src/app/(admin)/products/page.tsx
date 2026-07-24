'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, {
  type EntityField,
} from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';
import { listResource } from '@/modules/admin/services/adminApi';
import type {
  CharacterPreset,
  Collection,
} from '@/modules/admin/types/admin.types';

export default function ProductsPage() {
  const { t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characterPresets, setCharacterPresets] = useState<CharacterPreset[]>([]);

  useEffect(() => {
    Promise.all([
      listResource('collections').catch(() => [] as Collection[]),
      listResource('character-presets').catch(() => [] as CharacterPreset[]),
    ]).then(([nextCollections, nextPresets]) => {
      setCollections(nextCollections);
      setCharacterPresets(nextPresets);
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
        label: 'Loại sản phẩm',
        type: 'select',
        required: true,
        options: [
          { label: 'Mẫu khung quà', value: 'frame_template' },
          { label: 'Nhân vật LEGO hoàn chỉnh', value: 'lego_character' },
          { label: 'Linh kiện bán lẻ', value: 'loose_part' },
          { label: 'Khung tùy chỉnh', value: 'custom_frame' },
          { label: 'Nhân vật tùy chỉnh', value: 'custom_character' },
          { label: 'Sản phẩm hoàn thiện (cũ)', value: 'finished' },
          { label: 'Nhân vật ráp sẵn (cũ)', value: 'premade_character' },
          { label: 'Bộ linh kiện DIY', value: 'diy_kit' },
          { label: 'Sản phẩm bán lẻ (cũ)', value: 'retail' },
        ],
      },
      {
        key: 'collectionId',
        label: 'Bộ sưu tập',
        type: 'select',
        options: collections.map((collection) => ({
          label: collection.name,
          value: collection.id,
        })),
      },
      {
        key: 'characterPresetId',
        label: 'Preset nhân vật',
        type: 'select',
        options: characterPresets
          .filter((preset) => preset.status === 'active')
          .map((preset) => ({
            label: preset.name,
            value: preset.id,
          })),
        helpText: 'Bắt buộc với sản phẩm “Nhân vật LEGO hoàn chỉnh”.',
      },
      {
        key: 'basePrice',
        label: t('productsPage.basePrice'),
        type: 'number',
        required: true,
      },
      {
        key: 'compareAtPrice',
        label: 'Giá gốc trước giảm (VND)',
        type: 'number',
      },
      {
        key: 'category',
        label: 'Danh mục',
        type: 'text',
        placeholder: 'VD: graduation, birthday',
      },
      {
        key: 'availability',
        label: 'Tình trạng bán',
        type: 'select',
        options: [
          { label: 'Có sẵn', value: 'available' },
          { label: 'Tạm hết', value: 'out_of_stock' },
          { label: 'Ngừng bán', value: 'unavailable' },
        ],
      },
      {
        key: 'inventory',
        label: 'Tồn kho',
        type: 'number',
        helpText: 'Để trống nếu không giới hạn tồn kho.',
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
        label: 'Mô tả ngắn',
        type: 'textarea',
        placeholder: 'Nội dung ngắn hiển thị trên card sản phẩm.',
      },
      {
        key: 'description',
        label: t('productsPage.descriptionLabel'),
        type: 'textarea',
        placeholder: t('productsPage.descriptionPlaceholder'),
      },
      {
        key: 'thumbnailUrl',
        label: 'Ảnh đại diện',
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
        label: 'Cấu hình thành phần sản phẩm khung',
        type: 'json',
        placeholder:
          '{\n' +
          '  "frame": { "id": "frame-option-id", "type": "frame", "name": "30x30", "quantity": 1 },\n' +
          '  "background": { "id": "background-id", "type": "background", "name": "Happy Wedding 1", "quantity": 1 },\n' +
          '  "characters": [{ "id": "character-id", "type": "character", "name": "Nhân vật LEGO", "quantity": 2 }],\n' +
          '  "accessories": [{ "id": "accessory-id", "type": "accessory", "name": "Charm trái tim", "quantity": 1 }],\n' +
          '  "includedItems": [{ "id": "gift-box", "name": "Hộp quà", "quantity": 1, "icon": "gift" }]\n' +
          '}',
        helpText:
          'Dùng cho sản phẩm khung. Sản phẩm nhân vật lấy composition trực tiếp từ preset đã chọn.',
      },
      { key: 'published', label: 'Công khai trên Web', type: 'checkbox' },
      { key: 'featured', label: t('productsPage.featured'), type: 'checkbox' },
    ],
    [characterPresets, collections, t],
  );

  const tableFields = fields.filter((field) =>
    [
      'name',
      'productType',
      'basePrice',
      'compareAtPrice',
      'thumbnailUrl',
      'availability',
      'published',
      'status',
    ].includes(field.key),
  );

  return (
    <EntityManager
      title={t('productsPage.singularTitle')}
      resource='products'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('productsPage.title')}
      pageDescription='Quản lý mẫu khung, sản phẩm nhân vật, linh kiện bán lẻ và liên kết composition thật từ preset.'
      createButtonLabel={t('productsPage.createProduct')}
    />
  );
}
