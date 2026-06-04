"use client";

import { useMemo } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function ProductsPage() {
  const { t } = useI18n();

  const PRODUCT_FIELDS: EntityField[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('productsPage.name'),
        type: 'text',
        required: true,
      },
      {
        key: 'basePrice',
        label: t('productsPage.basePrice'),
        type: 'number',
        required: true,
      },
      {
        key: 'status',
        label: t('productsPage.status'),
        type: 'select',
        options: [
          { label: t('status.active'), value: 'active' },
          { label: t('status.inactive'), value: 'inactive' },
        ],
      },
      {
        key: 'slug',
        label: t('productsPage.slug'),
        type: 'text',
      },
      {
        key: 'description',
        label: t('productsPage.descriptionLabel'),
        type: 'textarea',
        placeholder: t('productsPage.descriptionPlaceholder'),
      },
      {
        key: 'images',
        label: t('productsPage.images'),
        type: 'images',
        placeholder: t('productsPage.images'),
      },
      { key: 'featured', label: t('productsPage.featured'), type: 'checkbox' },
    ],
    [t],
  );

  return (
    <EntityManager
      title={t('productsPage.singularTitle')}
      resource='products'
      fields={PRODUCT_FIELDS}
      pageTitle={t('productsPage.title')}
      pageDescription={t('productsPage.description')}
      createButtonLabel={t('productsPage.createProduct')}
    />
  );
}
