'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function AccessoryCategoriesPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'name', label: t('accessoryCategoriesPage.name'), type: 'text', required: true },
    { key: 'slug', label: t('accessoryCategoriesPage.slug'), type: 'text' },
  ];

  return (
    <EntityManager
      title={t('accessoryCategoriesPage.singularTitle')}
      resource='accessory-categories'
      fields={fields}
      pageTitle={t('accessoryCategoriesPage.title')}
      pageDescription={t('accessoryCategoriesPage.description')}
      createButtonLabel={t('accessoryCategoriesPage.createCategory')}
    />
  );
}

