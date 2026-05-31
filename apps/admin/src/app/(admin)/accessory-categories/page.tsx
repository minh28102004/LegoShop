import EntityManager, { type EntityField } from '@/components/admin/entity-manager';

const ACCESSORY_CATEGORY_FIELDS: EntityField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text' },
];

export default function AccessoryCategoriesPage() {
  return (
    <EntityManager
      title='Accessory Category'
      resource='accessory-categories'
      fields={ACCESSORY_CATEGORY_FIELDS}
    />
  );
}
