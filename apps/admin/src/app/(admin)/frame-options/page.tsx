"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function FrameOptionsPage() {
  const { t } = useI18n();
  const fields: EntityField[] = [
    { key: "__basic", label: t("entity.formSections.basic"), type: "section" },
    {
      key: "widthCm",
      label: t("frameFields.width"),
      type: "number",
      required: true,
      min: 0.1,
      span: 3,
    },
    {
      key: "heightCm",
      label: t("frameFields.height"),
      type: "number",
      required: true,
      min: 0.1,
      span: 3,
    },
    {
      key: "price",
      label: t("frameFields.price"),
      type: "number",
      required: true,
      min: 0,
      span: 3,
    },
    {
      key: "stock",
      label: t("frameFields.stockOptional"),
      type: "number",
      min: 0,
      span: 3,
    },
    { key: "__media", label: t("entity.formSections.media"), type: "section" },
    {
      key: "imageUrl",
      label: t("frameFields.image"),
      type: "image",
      span: 12,
    },
  ];
  const tableFields: EntityField[] = [
    { key: "imageUrl", label: t("frameFields.image"), type: "image" },
    { key: "frameSize", label: t("frameFields.frameSize"), type: "text" },
    { key: "price", label: t("frameFields.price"), type: "number" },
    { key: "stock", label: t("frameFields.stock"), type: "number" },
  ];

  return (
    <EntityManager
      title={t("frameFields.frameSingular")}
      resource="frame-options"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("frameFields.framesTitle")}
      createButtonLabel={t("frameFields.createFrame")}
    />
  );
}
