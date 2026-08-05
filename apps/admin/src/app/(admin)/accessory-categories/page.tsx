"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function AccessoryCategoriesPage() {
  const { t } = useI18n();

  const fields: EntityField[] = [
    {
      key: "__basic",
      label: t("entity.formSections.basic"),
      type: "section",
    },
    {
      key: "name",
      label: t("accessoryCategoriesPage.name"),
      type: "text",
      required: true,
      span: 8,
    },
    {
      key: "slug",
      label: t("accessoryCategoriesPage.slug"),
      type: "text",
      span: 4,
    },
  ];

  return (
    <EntityManager
      title={t("accessoryCategoriesPage.singularTitle")}
      resource="accessory-categories"
      fields={fields}
      pageTitle={t("accessoryCategoriesPage.title")}
      createButtonLabel={t("accessoryCategoriesPage.createCategory")}
    />
  );
}
