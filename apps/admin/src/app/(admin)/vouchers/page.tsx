"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function VouchersPage() {
  const { t } = useI18n();
  const statusOptions = [
    { label: t("voucherPage.enabled"), value: "active" },
    { label: t("voucherPage.disabled"), value: "inactive" },
  ];
  const discountTypeOptions = [
    { label: t("voucherPage.percentage"), value: "percentage" },
    { label: t("voucherPage.fixed"), value: "fixed" },
  ];
  const effectiveStatusOptions = [
    { label: t("status.active"), value: "active" },
    { label: t("status.scheduled"), value: "scheduled" },
    { label: t("status.expired"), value: "expired" },
    { label: t("status.exhausted"), value: "exhausted" },
    { label: t("status.disabled"), value: "disabled" },
  ];
  const fields: EntityField[] = [
    { key: "__basic", label: t("entity.formSections.basic"), type: "section" },
    {
      key: "code",
      label: t("voucherPage.code"),
      type: "text",
      required: true,
      placeholder: "SUMMER20",
      span: 6,
    },
    {
      key: "discountType",
      label: t("voucherPage.discountType"),
      type: "select",
      required: true,
      options: discountTypeOptions,
      span: 3,
    },
    {
      key: "discountValue",
      label: t("voucherPage.value"),
      type: "number",
      required: true,
      span: 3,
    },
    {
      key: "minOrderAmount",
      label: t("voucherPage.minimumOrder"),
      type: "number",
      span: 4,
    },
    {
      key: "maxDiscountAmount",
      label: t("voucherPage.maximumDiscount"),
      type: "number",
      span: 4,
    },
    {
      key: "usageLimit",
      label: t("voucherPage.usageLimit"),
      type: "number",
      span: 4,
    },
    {
      key: "__validity",
      label: t("entity.formSections.validity"),
      type: "section",
    },
    {
      key: "startsAt",
      label: t("voucherPage.startsAt"),
      type: "datetime",
      span: 6,
    },
    {
      key: "expiresAt",
      label: t("voucherPage.expiresAt"),
      type: "datetime",
      span: 6,
    },
    {
      key: "status",
      label: t("common.status"),
      type: "select",
      span: 4,
      options: statusOptions,
    },
    {
      key: "description",
      label: t("voucherPage.descriptionField"),
      type: "textarea",
      span: 12,
    },
  ];
  const tableFields: EntityField[] = [
    { key: "code", label: t("voucherPage.codeShort"), type: "text" },
    {
      key: "discountType",
      label: t("voucherPage.discountTypeShort"),
      type: "select",
      options: discountTypeOptions,
    },
    { key: "discountValue", label: t("voucherPage.value"), type: "number" },
    {
      key: "minOrderAmount",
      label: t("voucherPage.minimumOrder"),
      type: "number",
    },
    { key: "usedCount", label: t("voucherPage.usedCount"), type: "number" },
    {
      key: "effectiveStatus",
      label: t("common.status"),
      type: "select",
      options: effectiveStatusOptions,
    },
    {
      key: "expiresAt",
      label: t("voucherPage.expiresAtShort"),
      type: "datetime",
    },
  ];

  return (
    <EntityManager
      title={t("voucherPage.singular")}
      resource="vouchers"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("voucherPage.title")}
      createButtonLabel={t("voucherPage.create")}
    />
  );
}
