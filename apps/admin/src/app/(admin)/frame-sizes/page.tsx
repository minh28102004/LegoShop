'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';

export default function FrameSizesPage() {

  const fields: EntityField[] = [
    { key: 'label', label: 'Tên kích thước', type: 'text', required: true },
    { key: 'price', label: 'Giá (VNĐ)', type: 'number', required: true },
    { key: 'popular', label: 'Phổ biến nhất', type: 'checkbox' },
  ];

  return (
    <EntityManager
      title="Kích thước khung"
      resource="frame-sizes"
      fields={fields}
      pageTitle="Quản lý kích thước khung"
      pageDescription="Thêm, sửa, xoá các loại kích thước khung có thể chọn trên Studio"
      createButtonLabel="Thêm kích thước mới"
    />
  );
}
