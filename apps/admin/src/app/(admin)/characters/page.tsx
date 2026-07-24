'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CharactersPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'name', label: 'Tên linh kiện', type: 'text', required: true },
    {
      key: 'slug',
      label: 'Slug',
      type: 'text',
      placeholder: 'VD: toc-den-ngan',
      helpText: 'Định danh ổn định dùng cho liên kết và import dữ liệu.',
    },
    {
      key: 'type',
      label: 'Nhóm linh kiện',
      type: 'select',
      required: true,
      options: [
        { label: 'Khuôn mặt', value: 'FACE' },
        { label: 'Tóc', value: 'HAIR' },
        { label: 'Thân áo', value: 'TORSO' },
        { label: 'Chân', value: 'LEGS' },
        { label: 'Mũ', value: 'HAT' },
        { label: 'Phụ kiện', value: 'ACCESSORY' },
      ],
    },
    {
      key: 'imageUrl',
      label: 'Ảnh PNG/WebP',
      type: 'image',
      required: true,
      helpText:
        'Dùng ảnh nền trong suốt, cùng kích thước canvas (khuyến nghị 512×512) để các lớp ghép đúng vị trí.',
    },
    { key: 'priceAdjustment', label: 'Giá bán (VND)', type: 'number', required: true },
    { key: 'compareAtPrice', label: 'Giá gốc (VND)', type: 'number' },
    {
      key: 'category',
      label: 'Danh mục',
      type: 'text',
      placeholder: 'VD: classic, graduation',
    },
    {
      key: 'availability',
      label: 'Tình trạng kho',
      type: 'select',
      options: [
        { label: 'Có sẵn', value: 'available' },
        { label: 'Tạm hết', value: 'out_of_stock' },
        { label: 'Ngừng bán', value: 'unavailable' },
      ],
    },
    {
      key: 'compatibility',
      label: 'Điều kiện tương thích',
      type: 'json',
      placeholder: '{\n  "bodyScale": ["standard"]\n}',
      helpText: 'JSON dùng để giới hạn linh kiện tương thích trong Character Builder.',
    },
    { key: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number' },
    {
      key: 'tags',
      label: 'Từ khóa tìm kiếm',
      type: 'tags',
      placeholder: 'VD: black, short, tóc nam',
    },
    {
      key: 'isActive',
      label: 'Cho phép sử dụng trong Builder',
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

  const tableFields = fields.filter((field) =>
    ['name', 'type', 'imageUrl', 'priceAdjustment', 'availability', 'isActive', 'status'].includes(
      field.key,
    ),
  );

  return (
    <EntityManager
      title='linh kiện nhân vật'
      resource='character-parts'
      fields={fields}
      tableFields={tableFields}
      pageTitle='Quản lý linh kiện nhân vật'
      pageDescription='Quản lý khuôn mặt, tóc, thân áo, chân, mũ và phụ kiện dùng chung cho Character Builder, preset và sản phẩm bán lẻ.'
      createButtonLabel='Thêm linh kiện'
    />
  );
}
