'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';
import { listResource } from '@/modules/admin/services/adminApi';
import type { CharacterPart } from '@/modules/admin/types/admin.types';

export default function CharacterPresetsPage() {
  const { t } = useI18n();
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
          label: `${part.name} · ${part.priceAdjustment.toLocaleString('vi-VN')}đ`,
          value: part.id,
        }));

    return [
      {
        key: 'name',
        label: 'Tên preset',
        type: 'text',
        required: true,
        placeholder: 'VD: Nam tốt nghiệp',
      },
      {
        key: 'slug',
        label: 'Slug',
        type: 'text',
        placeholder: 'VD: nam-tot-nghiep',
      },
      {
        key: 'description',
        label: 'Mô tả ngắn',
        type: 'textarea',
        placeholder: 'Mô tả phong cách và các thành phần chính.',
      },
      {
        key: 'previewImageUrl',
        label: 'Ảnh xem trước',
        type: 'image',
      },
      {
        key: 'facePartId',
        label: 'Khuôn mặt',
        type: 'select',
        required: true,
        options: optionsFor('FACE'),
      },
      {
        key: 'hairPartId',
        label: 'Tóc',
        type: 'select',
        required: true,
        options: optionsFor('HAIR'),
      },
      {
        key: 'torsoPartId',
        label: 'Thân áo',
        type: 'select',
        required: true,
        options: optionsFor('TORSO'),
      },
      {
        key: 'legsPartId',
        label: 'Chân',
        type: 'select',
        required: true,
        options: optionsFor('LEGS'),
      },
      {
        key: 'hatPartId',
        label: 'Mũ (không bắt buộc)',
        type: 'select',
        options: optionsFor('HAT'),
      },
      {
        key: 'accessoryPartIds',
        label: 'Phụ kiện đi kèm',
        type: 'multi-select',
        options: optionsFor('ACCESSORY'),
        helpText: 'Có thể chọn nhiều phụ kiện. Giá preset được tính từ các linh kiện thực tế.',
      },
      { key: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number' },
      {
        key: 'isBuilderPreset',
        label: 'Hiển thị trong Character Builder',
        type: 'checkbox',
      },
      {
        key: 'isSellable',
        label: 'Cho phép bán như sản phẩm',
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
  }, [parts, t]);

  const tableFields = fields.filter((field) =>
    ['name', 'previewImageUrl', 'sortOrder', 'isBuilderPreset', 'isSellable', 'status'].includes(
      field.key,
    ),
  );

  return (
    <EntityManager
      title='preset nhân vật'
      resource='character-presets'
      fields={fields}
      tableFields={tableFields}
      pageTitle='Quản lý preset nhân vật'
      pageDescription='Ghép trực tiếp linh kiện thật thành preset để dùng trong Character Builder và liên kết với sản phẩm nhân vật.'
      createButtonLabel='Thêm preset nhân vật'
    />
  );
}
