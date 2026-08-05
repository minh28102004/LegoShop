"use client";

import { useEffect, useMemo, useState } from "react";
import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { listResource } from "@/modules/admin/services/adminApi";
import type { AccessoryCategory } from "@/modules/admin/types/admin.types";
import { useI18n } from "@/lib/i18n/useI18n";

export default function AccessoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<AccessoryCategory[]>([]);

  useEffect(() => {
    listResource("accessory-categories")
      .then((data) => setCategories(data as AccessoryCategory[]))
      .catch(() => setCategories([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      {
        key: "__basic",
        label: t("entity.formSections.basic"),
        type: "section",
      },
      {
        key: "name",
        label: t("accessoriesPage.name"),
        type: "text",
        required: true,
        span: 8,
      },
      {
        key: "price",
        label: t("accessoriesPage.price"),
        type: "number",
        required: true,
        span: 4,
      },
      {
        key: "categoryId",
        label: t("accessoriesPage.category"),
        type: "select",
        span: 6,
        options: categories.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      },
      {
        key: "__media",
        label: t("entity.formSections.media"),
        type: "section",
      },
      {
        key: "imageUrl",
        label: t("accessoriesPage.image"),
        type: "image",
        span: 6,
      },
      {
        key: "iconUrl",
        label: t("accessoriesPage.icon"),
        type: "image",
        span: 6,
      },
    ],
    [categories, t],
  );
  const tableFields = ["name", "imageUrl", "categoryId", "price"].flatMap(
    (key) => fields.filter((field) => field.key === key),
  );

  return (
    <EntityManager
      title={t("accessoriesPage.singularTitle")}
      resource="accessories"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("accessoriesPage.title")}
      createButtonLabel={t("accessoriesPage.createAccessory")}
    />
  );
}
