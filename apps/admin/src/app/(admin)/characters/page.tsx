'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CharactersPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'name', label: 'Tên part', type: 'text', required: true },
    {
      key: 'type',
      label: 'Loại part',
      type: 'select',
      required: true,
      options: [
        { label: 'FACE / Khuôn mặt', value: 'FACE' },
        { label: 'HAIR / Tóc', value: 'HAIR' },
        { label: 'TORSO / Áo', value: 'TORSO' },
        { label: 'LEGS / Quần', value: 'LEGS' },
        { label: 'HAT / Mũ', value: 'HAT' },
        { label: 'ACCESSORY / Phụ kiện nhân vật', value: 'ACCESSORY' },
      ],
    },
    { key: 'imageUrl', label: 'Ảnh PNG/WebP', type: 'image', required: true,
      helpText: 'Ảnh nên là PNG/WebP nền trong suốt, cùng kích thước canvas (ví dụ 512×512). Vị trí đầu/thân/chân phải đồng bộ giữa các part để nhân vật ghép không bị lệch.' },
    { key: 'priceAdjustment', label: 'Giá cộng thêm (VND)', type: 'number' },
    { key: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number' },
    {
      key: 'tags',
      label: 'Tags tìm kiếm',
      type: 'tags',
      placeholder: 'VD: black, short, toc nam',
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

  return (
    <EntityManager
      title='bộ phận nhân vật'
      resource='character-parts'
      fields={fields}
      pageTitle='Quản lý bộ phận nhân vật'
      pageDescription='Tạo và sắp xếp các part FACE, HAIR, TORSO, LEGS, ACCESSORY để khách ghép nhân vật LEGO trong Studio.'
      createButtonLabel='Thêm part nhân vật'
    />
  );
}
