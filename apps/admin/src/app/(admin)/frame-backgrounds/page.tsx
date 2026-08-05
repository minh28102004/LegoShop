"use client";

import { useEffect, useMemo, useState } from "react";
import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";
import { listResource } from "@/modules/admin/services/adminApi";
import type { FrameOption } from "@/modules/admin/types/admin.types";

function getFrameOptionLabel(option: FrameOption) {
  if (option.label?.trim()) return option.label.trim();
  if (option.name?.trim()) return option.name.trim();
  if (
    typeof option.widthCm === "number" &&
    typeof option.heightCm === "number"
  ) {
    return `${option.widthCm} × ${option.heightCm}`;
  }
  return option.id;
}

export default function FrameBackgroundsPage() {
  const { t } = useI18n();
  const [frameOptions, setFrameOptions] = useState<FrameOption[]>([]);

  useEffect(() => {
    listResource("frame-options")
      .then(setFrameOptions)
      .catch(() => setFrameOptions([]));
  }, []);

  const fields = useMemo<EntityField[]>(
    () => [
      {
        key: "__basic",
        label: t("entity.formSections.basic"),
        type: "section",
      },
      {
        key: "title",
        label: t("frameBackgroundsPage.titleField"),
        type: "text",
        required: true,
        span: 8,
      },
      {
        key: "category",
        label: t("frameBackgroundsPage.category"),
        type: "text",
        span: 4,
      },
      {
        key: "description",
        label: t("frameBackgroundFields.customerDescription"),
        type: "textarea",
        span: 12,
      },
      {
        key: "__media",
        label: t("entity.formSections.media"),
        type: "section",
      },
      {
        key: "imageUrl",
        label: t("frameBackgroundsPage.image"),
        type: "image",
        required: true,
        span: 6,
      },
      {
        key: "thumbnailUrl",
        label: t("frameBackgroundsPage.thumbnail"),
        type: "image",
        span: 6,
      },
      {
        key: "__configuration",
        label: t("entity.formSections.configuration"),
        type: "section",
      },
      {
        key: "instructions",
        label: t("frameBackgroundFields.instructions"),
        type: "textarea",
        span: 12,
      },
      {
        key: "contentFields",
        label: t("frameBackgroundFields.contentFields"),
        type: "content-fields",
        span: 12,
      },
      {
        key: "frameOptionIds",
        label: t("frameBackgroundFields.applicableFrames"),
        type: "multi-select",
        options: frameOptions
          .filter((option) => option.type === "size")
          .map((option) => ({
            value: option.id,
            label: getFrameOptionLabel(option),
          })),
        helpText: t("frameBackgroundFields.applicableFramesHelp"),
        span: 12,
      },
      {
        key: "__display",
        label: t("entity.formSections.display"),
        type: "section",
      },
      {
        key: "sortOrder",
        label: t("frameBackgroundsPage.sortOrder"),
        type: "number",
        span: 4,
      },
      {
        key: "status",
        label: t("frameBackgroundsPage.status"),
        type: "select",
        span: 4,
        options: [
          { label: t("status.active"), value: "active" },
          { label: t("status.inactive"), value: "inactive" },
        ],
      },
    ],
    [frameOptions, t],
  );

  const tableFields = ["title", "imageUrl", "sortOrder", "status"].flatMap(
    (key) => fields.filter((field) => field.key === key),
  );

  return (
    <EntityManager
      title={t("frameBackgroundsPage.singularTitle")}
      resource="frame-backgrounds"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("frameBackgroundsPage.title")}
      createButtonLabel={t("frameBackgroundsPage.createBackground")}
    />
  );
}
