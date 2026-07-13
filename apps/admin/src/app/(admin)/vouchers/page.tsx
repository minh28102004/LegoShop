'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';

const statusOptions = [
  { label: 'Đang bật', value: 'active' },
  { label: 'Tạm tắt', value: 'inactive' },
];

const discountTypeOptions = [
  { label: 'Giảm theo %', value: 'percentage' },
  { label: 'Giảm số tiền', value: 'fixed' },
];

export default function VouchersPage() {
  const fields: EntityField[] = [
    { key: 'code', label: 'Mã voucher', type: 'text', required: true, placeholder: 'SUMMER20' },
    { key: 'discountType', label: 'Kiểu giảm', type: 'select', required: true, options: discountTypeOptions },
    { key: 'discountValue', label: 'Giá trị', type: 'number', required: true },
    { key: 'minOrderAmount', label: 'Đơn tối thiểu', type: 'number' },
    { key: 'maxDiscountAmount', label: 'Giảm tối đa', type: 'number' },
    { key: 'usageLimit', label: 'Giới hạn lượt dùng', type: 'number' },
    { key: 'startsAt', label: 'Thời gian bắt đầu', type: 'datetime' },
    { key: 'expiresAt', label: 'Thời gian hết hạn', type: 'datetime' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: statusOptions },
    { key: 'description', label: 'Mô tả', type: 'textarea' },
  ];

  const tableFields: EntityField[] = [
    { key: 'code', label: 'Mã', type: 'text' },
    { key: 'discountType', label: 'Kiểu', type: 'select', options: discountTypeOptions },
    { key: 'discountValue', label: 'Giá trị', type: 'number' },
    { key: 'minOrderAmount', label: 'Đơn tối thiểu', type: 'number' },
    { key: 'usedCount', label: 'Đã dùng', type: 'number' },
    { key: 'status', label: 'Trạng thái', type: 'select', options: statusOptions },
    { key: 'expiresAt', label: 'Hết hạn', type: 'datetime' },
  ];

  return (
    <EntityManager
      title='voucher'
      resource='vouchers'
      fields={fields}
      tableFields={tableFields}
      pageTitle='Quản lý voucher'
      pageDescription='Tạo mã giảm giá theo phần trăm hoặc số tiền cố định để khách áp dụng ở checkout.'
      createButtonLabel='Thêm voucher'
    />
  );
}
