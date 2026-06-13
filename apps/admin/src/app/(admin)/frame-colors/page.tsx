'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';

export default function FrameColorsPage() {

  const fields: EntityField[] = [
    { key: 'name', label: 'Màu khung', type: 'text', required: true },
    { key: 'colorHex', label: 'Mã màu (Hex)', type: 'text' },
  ];

  return (
    <EntityManager
      title="Màu khung"
      resource="frame-colors"
      fields={fields}
      pageTitle="Quản lý màu khung"
      pageDescription="Thêm, sửa, xoá các màu sắc khung hình"
      createButtonLabel="Thêm màu mới"
    />
  );
}
