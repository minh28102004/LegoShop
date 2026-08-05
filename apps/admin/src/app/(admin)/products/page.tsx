"use client";

import { useEffect, useMemo, useState } from "react";
import EntityManager, {
  type EntityField,
} from "@/modules/admin/components/entity-manager";
import { useI18n } from "@/lib/i18n/useI18n";
import { listResource } from "@/modules/admin/services/adminApi";
import type {
  Accessory,
  Character,
  CharacterPreset,
  Collection,
  FrameBackground,
  FrameOption,
} from "@/modules/admin/types/admin.types";

export default function ProductsPage() {
  const { t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [characterPresets, setCharacterPresets] = useState<CharacterPreset[]>(
    [],
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [frameOptions, setFrameOptions] = useState<FrameOption[]>([]);
  const [frameBackgrounds, setFrameBackgrounds] = useState<FrameBackground[]>(
    [],
  );
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    Promise.all([
      listResource("collections").catch(() => [] as Collection[]),
      listResource("character-presets").catch(() => [] as CharacterPreset[]),
      listResource("characters").catch(() => [] as Character[]),
      listResource("frame-options").catch(() => [] as FrameOption[]),
      listResource("frame-backgrounds").catch(() => [] as FrameBackground[]),
      listResource("accessories").catch(() => [] as Accessory[]),
    ]).then(
      ([
        nextCollections,
        nextPresets,
        nextCharacters,
        nextFrames,
        nextBackgrounds,
        nextAccessories,
      ]) => {
        setCollections(nextCollections);
        setCharacterPresets(nextPresets);
        setCharacters(nextCharacters);
        setFrameOptions(nextFrames);
        setFrameBackgrounds(nextBackgrounds);
        setAccessories(nextAccessories);
      },
    );
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
        label: t("productsPage.name"),
        type: "text",
        required: true,
        span: 4,
      },
      {
        key: "slug",
        label: t("productsPage.slug"),
        type: "text",
        span: 8,
      },
      {
        key: "productType",
        label: t("productFields.productType"),
        type: "select",
        required: true,
        span: 4,
        options: [
          {
            label: t("productFields.types.frameTemplate"),
            value: "frame_template",
          },
          {
            label: t("productFields.types.legoCharacter"),
            value: "lego_character",
          },
          { label: t("productFields.types.loosePart"), value: "loose_part" },
          {
            label: t("productFields.types.customFrame"),
            value: "custom_frame",
          },
          {
            label: t("productFields.types.customCharacter"),
            value: "custom_character",
          },
          { label: t("productFields.types.legacyFinished"), value: "finished" },
          {
            label: t("productFields.types.legacyPremade"),
            value: "premade_character",
          },
          { label: t("productFields.types.diyKit"), value: "diy_kit" },
          { label: t("productFields.types.legacyRetail"), value: "retail" },
        ],
      },
      {
        key: "collectionId",
        label: t("productFields.collection"),
        type: "select",
        span: 4,
        options: collections
          .filter((collection) => collection.status === "active")
          .map((collection) => ({
            label: collection.name,
            value: collection.id,
          })),
      },
      {
        key: "availability",
        label: t("productFields.availability"),
        type: "select",
        span: 4,
        options: [
          { label: t("productFields.available"), value: "available" },
          { label: t("productFields.outOfStock"), value: "out_of_stock" },
          { label: t("productFields.unavailable"), value: "unavailable" },
        ],
      },
      {
        key: "basePrice",
        label: t("productsPage.basePrice"),
        type: "number",
        required: true,
        span: 3,
      },
      {
        key: "compareAtPrice",
        label: t("productFields.comparePrice"),
        type: "number",
        span: 3,
      },
      {
        key: "inventory",
        label: t("productFields.inventory"),
        type: "number",
        helpText: t("productFields.inventoryHelp"),
        span: 3,
      },
      {
        key: "category",
        label: t("productFields.category"),
        type: "text",
        placeholder: t("productFields.categoryPlaceholder"),
        span: 3,
      },
      {
        key: "shortDescription",
        label: t("productFields.shortDescription"),
        type: "textarea",
        placeholder: t("productFields.shortDescriptionPlaceholder"),
        span: 12,
      },
      {
        key: "description",
        label: t("productsPage.descriptionLabel"),
        type: "textarea",
        placeholder: t("productsPage.descriptionPlaceholder"),
        span: 12,
      },
      {
        key: "__media",
        label: t("entity.formSections.media"),
        type: "section",
      },
      {
        key: "thumbnailUrl",
        label: t("productFields.thumbnail"),
        type: "image",
        span: 5,
      },
      {
        key: "images",
        label: t("productsPage.images"),
        type: "images",
        placeholder: t("productsPage.images"),
        span: 7,
      },
      {
        key: "__configuration",
        label: t("entity.formSections.configuration"),
        type: "section",
      },
      {
        key: "characterPresetId",
        label: t("productFields.characterPreset"),
        type: "select",
        span: 6,
        showWhen: {
          field: "productType",
          values: ["lego_character", "custom_character", "premade_character"],
        },
        options: characterPresets
          .filter((preset) => preset.status === "active" && preset.isSellable)
          .map((preset) => ({
            label: preset.name,
            value: preset.id,
          })),
        helpText: t("productFields.presetHelp"),
      },
      {
        key: "componentConfig",
        label: t("entity.formSections.configuration"),
        type: "product-config",
        span: 12,
        productConfigOptions: {
          frames: frameOptions
            .filter((option) => option.type === "size")
            .map((option) => ({
              id: option.id,
              name:
                option.label?.trim() ||
                option.name ||
                `${option.widthCm ?? "?"} × ${option.heightCm ?? "?"}`,
              imageUrl: option.imageUrl,
              price: option.price,
            })),
          backgrounds: frameBackgrounds
            .filter((background) => background.status === "active")
            .map((background) => ({
              id: background.id,
              name: background.title,
              imageUrl: background.thumbnailUrl || background.imageUrl,
              frameOptionIds: background.frameOptionIds,
            })),
          characters: characters
            .filter((character) => character.status === "active")
            .map((character) => ({
              id: character.id,
              name: character.name,
              imageUrl: character.imageUrl,
              price: character.price,
            })),
          accessories: accessories.map((accessory) => ({
            id: accessory.id,
            name: accessory.name,
            imageUrl: accessory.imageUrl || accessory.iconUrl,
            price: accessory.price,
          })),
        },
      },
      {
        key: "__display",
        label: t("entity.formSections.display"),
        type: "section",
      },
      {
        key: "published",
        label: t("productFields.published"),
        type: "checkbox",
        span: 4,
      },
      {
        key: "featured",
        label: t("productsPage.featured"),
        type: "checkbox",
        span: 4,
      },
    ],
    [
      accessories,
      characterPresets,
      characters,
      collections,
      frameBackgrounds,
      frameOptions,
      t,
    ],
  );

  const tableFields = [
    "name",
    "basePrice",
    "thumbnailUrl",
    "published",
  ].flatMap((key) => fields.filter((field) => field.key === key));

  return (
    <EntityManager
      title={t("productsPage.singularTitle")}
      resource="products"
      fields={fields}
      tableFields={tableFields}
      pageTitle={t("productsPage.title")}
      createButtonLabel={t("productsPage.createProduct")}
    />
  );
}
