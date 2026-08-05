"use client";

import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";

export default function CharactersPage() {
  const { t } = useI18n();
  const fields: EntityField[] = [
    { key: "__basic", label: t("entity.formSections.basic"), type: "section" },
    {
      key: "name",
      label: t("characterPartsPage.name"),
      type: "text",
      required: true,
      span: 8,
    },
    {
      key: "slug",
      label: t("entity.slug"),
      type: "text",
      placeholder: "short-black-hair",
      helpText: t("characterPartsPage.slugHelp"),
      span: 4,
    },
    {
      key: "type",
      label: t("characterPartsPage.group"),
      type: "select",
      required: true,
      span: 4,
      options: [
        { label: t("characterPartsPage.face"), value: "FACE" },
        { label: t("characterPartsPage.hair"), value: "HAIR" },
        { label: t("characterPartsPage.torso"), value: "TORSO" },
        { label: t("characterPartsPage.legs"), value: "LEGS" },
        { label: t("characterPartsPage.hat"), value: "HAT" },
        { label: t("characterPartsPage.accessory"), value: "ACCESSORY" },
      ],
    },
    {
      key: "priceAdjustment",
      label: t("characterPartsPage.sellingPrice"),
      type: "number",
      required: true,
      span: 4,
    },
    {
      key: "compareAtPrice",
      label: t("characterPartsPage.comparePrice"),
      type: "number",
      span: 4,
    },
    {
      key: "category",
      label: t("characterPartsPage.category"),
      type: "text",
      placeholder: "classic, graduation",
      span: 6,
    },
    { key: "__media", label: t("entity.formSections.media"), type: "section" },
    {
      key: "imageUrl",
      label: t("characterPartsPage.image"),
      type: "image",
      required: true,
      helpText: t("characterPartsPage.imageHelp"),
      span: 12,
    },
    {
      key: "__availability",
      label: t("entity.formSections.availability"),
      type: "section",
    },
    {
      key: "availability",
      label: t("characterPartsPage.availability"),
      type: "select",
      span: 4,
      options: [
        { label: t("characterPartsPage.available"), value: "available" },
        { label: t("characterPartsPage.outOfStock"), value: "out_of_stock" },
        { label: t("characterPartsPage.unavailable"), value: "unavailable" },
      ],
    },
    {
      key: "compatibility",
      label: t("characterPartsPage.compatibility"),
      type: "json",
      advanced: true,
      placeholder: '{\n  "bodyScale": ["standard"]\n}',
      helpText: t("characterPartsPage.compatibilityHelp"),
      span: 6,
    },
    {
      key: "sortOrder",
      label: t("characterPartsPage.sortOrder"),
      type: "number",
      span: 3,
    },
    {
      key: "tags",
      label: t("characterPartsPage.tags"),
      type: "tags",
      placeholder: "black, short, classic",
      span: 12,
    },
  ];
  const tableFields = [
    "name",
    "imageUrl",
    "type",
    "priceAdjustment",
    "availability",
  ].flatMap((key) => fields.filter((field) => field.key === key));

  return (
    <EntityManager
      title={t("characterPartsPage.singular")}
      resource="character-parts"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("characterPartsPage.title")}
      createButtonLabel={t("characterPartsPage.create")}
    />
  );
}
