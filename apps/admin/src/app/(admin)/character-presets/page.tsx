"use client";

import { useEffect, useMemo, useState } from "react";
import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";
import { listResource } from "@/modules/admin/services/adminApi";
import type { CharacterPart } from "@/modules/admin/types/admin.types";
import { formatVnd } from "@/lib/i18n/format";

export default function CharacterPresetsPage() {
  const { t, locale } = useI18n();
  const [parts, setParts] = useState<CharacterPart[]>([]);

  useEffect(() => {
    listResource("character-parts")
      .then(setParts)
      .catch(() => setParts([]));
  }, []);

  const fields = useMemo<EntityField[]>(() => {
    const optionsFor = (type: CharacterPart["type"]) =>
      parts
        .filter(
          (part) => part.type === type && part.availability === "available",
        )
        .map((part) => ({
          label: `${part.name} · ${formatVnd(part.priceAdjustment, locale)}`,
          value: part.id,
        }));

    return [
      {
        key: "__basic",
        label: t("entity.formSections.basic"),
        type: "section",
      },
      {
        key: "name",
        label: t("characterPresetsPage.name"),
        type: "text",
        required: true,
        placeholder: t("characterPresetsPage.namePlaceholder"),
        span: 8,
      },
      {
        key: "slug",
        label: t("entity.slug"),
        type: "text",
        placeholder: t("characterPresetsPage.slugPlaceholder"),
        span: 4,
      },
      {
        key: "description",
        label: t("characterPresetsPage.descriptionField"),
        type: "textarea",
        placeholder: t("characterPresetsPage.descriptionPlaceholder"),
        span: 12,
      },
      {
        key: "__media",
        label: t("entity.formSections.media"),
        type: "section",
      },
      {
        key: "previewImageUrl",
        label: t("characterPresetsPage.previewImage"),
        type: "image",
        span: 12,
      },
      {
        key: "__composition",
        label: t("entity.formSections.composition"),
        type: "section",
      },
      {
        key: "facePartId",
        label: t("characterPresetsPage.face"),
        type: "select",
        required: true,
        options: optionsFor("FACE"),
        span: 4,
      },
      {
        key: "hairPartId",
        label: t("characterPresetsPage.hair"),
        type: "select",
        required: true,
        options: optionsFor("HAIR"),
        span: 4,
      },
      {
        key: "torsoPartId",
        label: t("characterPresetsPage.torso"),
        type: "select",
        required: true,
        options: optionsFor("TORSO"),
        span: 4,
      },
      {
        key: "legsPartId",
        label: t("characterPresetsPage.legs"),
        type: "select",
        required: true,
        options: optionsFor("LEGS"),
        span: 4,
      },
      {
        key: "hatPartId",
        label: t("characterPresetsPage.optionalHat"),
        type: "select",
        options: optionsFor("HAT"),
        span: 4,
      },
      {
        key: "accessoryPartIds",
        label: t("characterPresetsPage.accessories"),
        type: "multi-select",
        options: optionsFor("ACCESSORY"),
        helpText: t("characterPresetsPage.accessoriesHelp"),
        span: 12,
      },
      {
        key: "__display",
        label: t("entity.formSections.display"),
        type: "section",
      },
      {
        key: "sortOrder",
        label: t("characterPresetsPage.sortOrder"),
        type: "number",
        span: 4,
      },
      {
        key: "isBuilderPreset",
        label: t("characterPresetsPage.builderVisible"),
        type: "checkbox",
        span: 4,
      },
      {
        key: "isSellable",
        label: t("characterPresetsPage.sellable"),
        type: "checkbox",
        span: 4,
      },
      {
        key: "status",
        label: t("common.status"),
        type: "select",
        span: 4,
        options: [
          { label: t("status.active"), value: "active" },
          { label: t("status.inactive"), value: "inactive" },
        ],
      },
    ];
  }, [locale, parts, t]);

  const tableFields = [
    "name",
    "previewImageUrl",
    "sortOrder",
    "isBuilderPreset",
    "isSellable",
    "status",
  ].flatMap((key) => fields.filter((field) => field.key === key));

  return (
    <EntityManager
      title={t("characterPresetsPage.singular")}
      resource="character-presets"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("characterPresetsPage.title")}
      createButtonLabel={t("characterPresetsPage.create")}
    />
  );
}
