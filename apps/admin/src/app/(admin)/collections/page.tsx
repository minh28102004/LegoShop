"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function CollectionsPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: "__basic", label: t("entity.formSections.basic"), type: "section" },
    {
      key: "name",
      label: t("collectionsPage.name"),
      type: "text",
      required: true,
      span: 8,
    },
    {
      key: "slug",
      label: t("collectionsPage.slug"),
      type: "text",
      span: 4,
    },
    {
      key: "description",
      label: t("collectionsPage.descriptionField"),
      type: "textarea",
      span: 12,
    },
    { key: "__media", label: t("entity.formSections.media"), type: "section" },
    {
      key: "imageUrl",
      label: t("collectionsPage.image"),
      type: "image",
      span: 12,
    },
    {
      key: "__display",
      label: t("entity.formSections.display"),
      type: "section",
    },
    {
      key: "sortOrder",
      label: t("collectionsPage.sortOrder"),
      type: "number",
      span: 4,
    },
    {
      key: "status",
      label: t("collectionsPage.status"),
      type: "select",
      span: 4,
      options: [
        { label: t("status.active"), value: "active" },
        { label: t("status.inactive"), value: "inactive" },
      ],
    },
  ];
  const tableFields = [
    "name",
    "imageUrl",
    "slug",
    "sortOrder",
    "status",
  ].flatMap((key) => fields.filter((field) => field.key === key));

  return (
    <EntityManager
      title={t("collectionsPage.singularTitle")}
      resource="collections"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("collectionsPage.title")}
      createButtonLabel={t("collectionsPage.createCollection")}
    />
  );
}
