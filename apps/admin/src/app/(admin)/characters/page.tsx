'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CharactersPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'name', label: 'Tên nhân vật', type: 'text', required: true },
    { key: 'price', label: 'Giá', type: 'number', required: true },
    { key: 'imageUrl', label: 'Hình ảnh', type: 'image' },
    { key: 'sortOrder', label: 'Thứ tự hiển thị', type: 'number' },
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
      title='nhân vật'
      resource='characters'
      fields={fields}
      pageTitle='Quản lý nhân vật'
      pageDescription='Tạo nhân vật LEGO thật để khách chọn trong Studio, kèm ảnh, giá và trạng thái hiển thị.'
      createButtonLabel='Thêm nhân vật'
    />
  );
}
