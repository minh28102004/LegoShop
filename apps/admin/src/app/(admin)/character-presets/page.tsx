'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function CharacterPresetsPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    {
      key: 'name',
      label: 'Tên mẫu',
      type: 'text',
      required: true,
      placeholder: 'VD: Nam tốt nghiệp',
    },
    {
      key: 'description',
      label: 'Mô tả',
      type: 'text',
      placeholder: 'VD: Tóc nam + mũ tốt nghiệp',
    },
    {
      key: 'faceHint',
      label: 'Gợi ý mặt (faceHint)',
      type: 'text',
      placeholder: 'VD: mỉm cười, da sáng',
      helpText: 'Từ khoá tìm part FACE theo tên. Để trống = chọn part đầu tiên.',
    },
    {
      key: 'hairHint',
      label: 'Gợi ý tóc (hairHint)',
      type: 'text',
      placeholder: 'VD: nam, nữ, dài, ngắn',
      helpText: 'Từ khoá tìm part HAIR theo tên.',
    },
    {
      key: 'torsoHint',
      label: 'Gợi ý áo (torsoHint)',
      type: 'text',
      placeholder: 'VD: đỏ, xanh, vest',
    },
    {
      key: 'legsHint',
      label: 'Gợi ý quần (legsHint)',
      type: 'text',
      placeholder: 'VD: đen, jeans',
    },
    {
      key: 'hatHint',
      label: 'Gợi ý mũ (hatHint)',
      type: 'text',
      placeholder: 'VD: tốt nghiệp, bảo hiểm',
      helpText: 'Để trống = không chọn mũ cho mẫu này.',
    },
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
      title='mẫu nhân vật'
      resource='character-presets'
      fields={fields}
      pageTitle='Quản lý mẫu nhân vật có sẵn'
      pageDescription='Tạo mẫu preset để khách chọn nhanh khi thiết kế nhân vật. Mỗi mẫu gợi ý part theo từ khoá, khách vẫn có thể sửa từng part sau khi chọn.'
      createButtonLabel='Thêm mẫu nhân vật'
    />
  );
}
