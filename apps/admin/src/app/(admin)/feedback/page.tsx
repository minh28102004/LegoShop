"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function FeedbackPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: "__basic", label: t("entity.formSections.basic"), type: "section" },
    {
      key: "customerName",
      label: t("feedbackPage.customerName"),
      type: "text",
      required: true,
      span: 6,
    },
    {
      key: "productType",
      label: t("feedbackPage.productType"),
      type: "text",
      required: true,
      span: 6,
    },
    {
      key: "quote",
      label: t("feedbackPage.quote"),
      type: "textarea",
      required: true,
      span: 12,
    },
    {
      key: "rating",
      label: t("feedbackPage.rating"),
      type: "number",
      required: true,
      min: 1,
      span: 4,
    },
    { key: "__media", label: t("entity.formSections.media"), type: "section" },
    {
      key: "images",
      label: t("feedbackPage.images"),
      type: "images",
      required: true,
      helpText: t("feedbackPage.imagesHelp"),
      span: 12,
    },
    {
      key: "__display",
      label: t("entity.formSections.display"),
      type: "section",
    },
    {
      key: "sortOrder",
      label: t("feedbackPage.sortOrder"),
      type: "number",
      min: 0,
      span: 4,
    },
    {
      key: "status",
      label: t("feedbackPage.status"),
      type: "select",
      span: 4,
      options: [
        { label: t("status.active"), value: "active" },
        { label: t("status.inactive"), value: "inactive" },
      ],
    },
  ];
  const tableFields = [
    "customerName",
    "productType",
    "images",
    "rating",
    "sortOrder",
    "status",
  ].flatMap((key) => fields.filter((field) => field.key === key));

  return (
    <EntityManager
      title={t("feedbackPage.singularTitle")}
      resource="feedback"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("feedbackPage.title")}
      createButtonLabel={t("feedbackPage.createFeedback")}
    />
  );
}
