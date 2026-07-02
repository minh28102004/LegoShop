'use client';

import { useEffect, useMemo, useState } from 'react';
import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';
import { listResource } from '@/modules/admin/services/adminApi';
import type { Collection } from '@/modules/admin/types/admin.types';

export default function ProductsPage() {
  const { t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    listResource('collections')
      .then((data) => setCollections(data as Collection[]))
      .catch(() => setCollections([]));
  }, []);

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
        key: 'productType',
        label: 'Loại sản phẩm',
        type: 'select',
        options: [
          { label: 'Sản phẩm hoàn thiện', value: 'finished' },
          { label: 'Đồ lẻ', value: 'retail' },
        ],
      },
      {
        key: 'collectionId',
        label: 'Bộ sưu tập',
        type: 'select',
        options: collections.map((collection) => ({
          label: collection.name,
          value: collection.id,
        })),
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
      {
        key: 'componentConfig',
        label: 'Cấu hình thành phần',
        type: 'json',
        placeholder:
          '{\n  "frame": { "id": "frame-option-id", "name": "Khung 30x30", "price": 30000 },\n  "background": { "id": "background-id", "name": "Nền trái tim", "price": 0 },\n  "characters": [{ "name": "Nhân vật", "quantity": 2, "price": 10000 }],\n  "accessories": [{ "id": "accessory-id", "name": "Charm trái tim", "quantity": 1, "price": 10000 }]\n}',
      },
      { key: 'featured', label: t('productsPage.featured'), type: 'checkbox' },
    ],
    [collections, t],
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
