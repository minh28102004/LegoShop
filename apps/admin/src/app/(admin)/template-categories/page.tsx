'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function TemplateCategoriesPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: 'name', label: t('templateCategoriesPage.name'), type: 'text', required: true },
    { key: 'slug', label: t('templateCategoriesPage.slug'), type: 'text' },
  ];

  return (
    <EntityManager
      title={t('templateCategoriesPage.singularTitle')}
      resource='template-categories'
      fields={fields}
      pageTitle={t('templateCategoriesPage.title')}
      pageDescription={t('templateCategoriesPage.description')}
      createButtonLabel={t('templateCategoriesPage.createCategory')}
    />
  );
}

