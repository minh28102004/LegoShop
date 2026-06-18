'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';

export default function FrameOptionsPage() {
  const fields: EntityField[] = [
    { key: 'imageUrl', label: 'Hình ảnh', type: 'image' },
    { key: 'widthCm', label: 'Chiều rộng', type: 'number', required: true },
    { key: 'heightCm', label: 'Chiều cao', type: 'number', required: true },
    { key: 'price', label: 'Giá', type: 'number', required: true },
    { key: 'stock', label: 'Số lượng', type: 'number', required: true },
    { key: 'colorHex', label: 'Màu sắc', type: 'text', placeholder: '#ffffff' },
  ];

  const tableFields: EntityField[] = [
    { key: 'imageUrl', label: 'Hình ảnh', type: 'image' },
    { key: 'frameSize', label: 'Kích thước', type: 'text' },
    { key: 'price', label: 'Giá', type: 'number' },
    { key: 'stock', label: 'Số lượng', type: 'number' },
    { key: 'colorHex', label: 'Màu sắc', type: 'text' },
  ];

  return (
    <EntityManager
      title='khung'
      resource='frame-options'
      fields={fields}
      tableFields={tableFields}
      pageTitle='Quản lý khung'
      pageDescription='Quản lý hình ảnh, kích thước, giá, số lượng và màu sắc của khung.'
      createButtonLabel='Thêm khung'
    />
  );
}
