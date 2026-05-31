import EntityManager, { type EntityField } from '@/components/admin/entity-manager';

const COLLECTION_FIELDS: EntityField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'imageUrl', label: 'Image', type: 'image' },
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

export default function CollectionsPage() {
  return <EntityManager title='Collection' resource='collections' fields={COLLECTION_FIELDS} />;
}
