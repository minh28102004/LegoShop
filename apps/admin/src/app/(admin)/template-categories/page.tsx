import EntityManager, { type EntityField } from '@/components/admin/entity-manager';

const CATEGORY_FIELDS: EntityField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text' },
];

export default function TemplateCategoriesPage() {
  return <EntityManager title='Template Category' resource='template-categories' fields={CATEGORY_FIELDS} />;
}
