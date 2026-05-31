"use client";

import EntityManager, { type EntityField } from '@/components/admin/entity-manager';

const PRODUCT_FIELDS: EntityField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'basePrice', label: 'Base Price', type: 'number', required: true },
  {
    key: 'images',
    label: 'Images',
    type: 'images',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'active', value: 'active' },
      { label: 'inactive', value: 'inactive' },
    ],
  },
  { key: 'featured', label: 'Featured', type: 'checkbox' },
];

export default function ProductsPage() {
  return (
    <EntityManager
      title='Product'
      resource='products'
      fields={PRODUCT_FIELDS}
    />
  );
}
