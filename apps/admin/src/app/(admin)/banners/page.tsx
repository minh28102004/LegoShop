import EntityManager, { type EntityField } from '@/components/admin/entity-manager';

const BANNER_FIELDS: EntityField[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'imageUrl', label: 'Image', type: 'image', required: true },
  { key: 'linkUrl', label: 'Link URL', type: 'text' },
  { key: 'sortOrder', label: 'Sort Order', type: 'number' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'active', value: 'active' },
      { label: 'inactive', value: 'inactive' },
    ],
  },
];

export default function BannersPage() {
  return <EntityManager title='Banner' resource='banners' fields={BANNER_FIELDS} />;
}
