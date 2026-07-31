'use client';

import EntityManager, { type EntityField } from '@/modules/admin/components/entity-manager';
import { useI18n } from '@/lib/i18n/useI18n';

export default function VouchersPage() {
  const { t } = useI18n();
  const statusOptions = [
    { label: t('voucherPage.enabled'), value: 'active' },
    { label: t('voucherPage.disabled'), value: 'inactive' },
  ];
  const discountTypeOptions = [
    { label: t('voucherPage.percentage'), value: 'percentage' },
    { label: t('voucherPage.fixed'), value: 'fixed' },
  ];
  const fields: EntityField[] = [
    { key: 'code', label: t('voucherPage.code'), type: 'text', required: true, placeholder: 'SUMMER20' },
    { key: 'discountType', label: t('voucherPage.discountType'), type: 'select', required: true, options: discountTypeOptions },
    { key: 'discountValue', label: t('voucherPage.value'), type: 'number', required: true },
    { key: 'minOrderAmount', label: t('voucherPage.minimumOrder'), type: 'number' },
    { key: 'maxDiscountAmount', label: t('voucherPage.maximumDiscount'), type: 'number' },
    { key: 'usageLimit', label: t('voucherPage.usageLimit'), type: 'number' },
    { key: 'startsAt', label: t('voucherPage.startsAt'), type: 'datetime' },
    { key: 'expiresAt', label: t('voucherPage.expiresAt'), type: 'datetime' },
    { key: 'status', label: t('common.status'), type: 'select', options: statusOptions },
    { key: 'description', label: t('voucherPage.descriptionField'), type: 'textarea' },
  ];
  const tableFields: EntityField[] = [
    { key: 'code', label: t('voucherPage.codeShort'), type: 'text' },
    { key: 'discountType', label: t('voucherPage.discountTypeShort'), type: 'select', options: discountTypeOptions },
    { key: 'discountValue', label: t('voucherPage.value'), type: 'number' },
    { key: 'minOrderAmount', label: t('voucherPage.minimumOrder'), type: 'number' },
    { key: 'usedCount', label: t('voucherPage.usedCount'), type: 'number' },
    { key: 'status', label: t('common.status'), type: 'select', options: statusOptions },
    { key: 'expiresAt', label: t('voucherPage.expiresAtShort'), type: 'datetime' },
  ];

  return (
    <EntityManager
      title={t('voucherPage.singular')}
      resource='vouchers'
      fields={fields}
      tableFields={tableFields}
      pageTitle={t('voucherPage.title')}
      pageDescription={t('voucherPage.description')}
      createButtonLabel={t('voucherPage.create')}
    />
  );
}
