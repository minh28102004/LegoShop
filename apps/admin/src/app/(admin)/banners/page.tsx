"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function BannersPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    { key: "__basic", label: t("entity.formSections.basic"), type: "section" },
    {
      key: "title",
      label: t("bannersPage.adminName"),
      type: "text",
      required: true,
      span: 8,
    },
    {
      key: "sourceKey",
      label: t("bannersPage.systemKey"),
      type: "text",
      required: true,
      helpText: t("bannersPage.systemKeyHelp"),
      span: 4,
    },
    {
      key: "linkUrl",
      label: t("bannersPage.linkUrl"),
      type: "text",
      span: 12,
    },
    { key: "__media", label: t("entity.formSections.media"), type: "section" },
    {
      key: "imageUrl",
      label: t("bannersPage.image"),
      type: "image",
      required: true,
      span: 12,
    },
    {
      key: "__display",
      label: t("entity.formSections.display"),
      type: "section",
    },
    {
      key: "sortOrder",
      label: t("bannersPage.sortOrder"),
      type: "number",
      span: 4,
    },
    {
      key: "status",
      label: t("bannersPage.status"),
      type: "select",
      span: 4,
      options: [
        { label: t("status.active"), value: "active" },
        { label: t("status.inactive"), value: "inactive" },
      ],
    },
  ];
  const tableFields = [
    "title",
    "sourceKey",
    "imageUrl",
    "sortOrder",
    "status",
  ].flatMap((key) => fields.filter((field) => field.key === key));

  return (
    <EntityManager
      title={t("bannersPage.singularTitle")}
      resource="banners"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("bannersPage.title")}
      createButtonLabel={t("bannersPage.createBanner")}
    />
  );
}
