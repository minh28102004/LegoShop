"use client";

import { useCallback, useEffect, useState } from "react";
import { publicApiClient } from "@/lib/api/public-client";
import {
  getBackgroundCategories,
  mapFrameBackground,
  mapFrameOptionSize,
  mapLegacyFrameSize,
  mapStudioAccessory,
  resolveStudioImageUrl,
  type StudioFrameBackground,
} from "../lib/studio-data";
import type {
  ApiAccessory,
  ApiCategory,
  ApiCharacter,
  ApiCharacterPart,
  ApiCharacterPreset,
  ApiFrameSize,
  ApiTemplate,
  StudioResourceKey,
  StudioResourceState,
} from "../state/studio.types";
import { useStudioI18n } from "./useStudioI18n";

const INITIAL_RESOURCE_STATE: StudioResourceState = {
  frameSizes: { status: "loading", error: null },
  templates: { status: "loading", error: null },
  templateCategories: { status: "loading", error: null },
  accessories: { status: "loading", error: null },
  accessoryCategories: { status: "loading", error: null },
  characters: { status: "loading", error: null },
  characterParts: { status: "loading", error: null },
  characterPresets: { status: "loading", error: null },
};

export function useStudioData(frameSize: string) {
  const { locale, text } = useStudioI18n();
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<ApiCategory[]>(
    [],
  );
  const [accessories, setAccessories] = useState<ApiAccessory[]>([]);
  const [characters, setCharacters] = useState<ApiCharacter[]>([]);
  const [characterParts, setCharacterParts] = useState<ApiCharacterPart[]>([]);
  const [characterPresets, setCharacterPresets] = useState<
    ApiCharacterPreset[]
  >([]);
  const [accessoryCategories, setAccessoryCategories] = useState<ApiCategory[]>(
    [],
  );
  const [frameSizes, setFrameSizes] = useState<ApiFrameSize[]>([]);
  const [resourceStates, setResourceStates] = useState<StudioResourceState>(
    INITIAL_RESOURCE_STATE,
  );
  const [resourceReloads, setResourceReloads] = useState<
    Record<StudioResourceKey, number>
  >({
    frameSizes: 0,
    templates: 0,
    templateCategories: 0,
    accessories: 0,
    accessoryCategories: 0,
    characters: 0,
    characterParts: 0,
    characterPresets: 0,
  });

  const setResourceState = useCallback(
    (
      resource: StudioResourceKey,
      status: StudioResourceState[StudioResourceKey]["status"],
      error: string | null = null,
    ) => {
      setResourceStates((current) => ({
        ...current,
        [resource]: { status, error },
      }));
    },
    [],
  );

  const retryResource = useCallback(
    (resource: StudioResourceKey) => {
      setResourceState(resource, "loading");
      setResourceReloads((current) => ({
        ...current,
        [resource]: current[resource] + 1,
      }));
    },
    [setResourceState],
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      publicApiClient.products.listFrameOptions({ type: "size" }),
      publicApiClient.products.listFrameSizes(),
    ])
      .then(([optionsResult, legacyResult]) => {
        if (controller.signal.aborted) return;
        const frameOptions =
          optionsResult.status === "fulfilled" ? optionsResult.value : [];
        const legacySizes =
          legacyResult.status === "fulfilled" ? legacyResult.value : [];

        if (
          optionsResult.status === "rejected" &&
          legacyResult.status === "rejected"
        ) {
          throw optionsResult.reason;
        }

        const optionFrameSizes = frameOptions
          .filter(
            (option) => option.status === "active" && option.type === "size",
          )
          .map((option) => mapFrameOptionSize(option, locale));
        const activeFrameSizes = (
          optionFrameSizes.length > 0
            ? optionFrameSizes
            : legacySizes.map((size) => mapLegacyFrameSize(size, locale))
        ).filter((size) => size.status === "active");

        setFrameSizes(activeFrameSizes);
        setResourceState("frameSizes", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load Studio frame sizes:", error);
        setResourceState("frameSizes", "error", text.resources.frameSizesError);
      });
    return () => controller.abort();
  }, [
    locale,
    resourceReloads.frameSizes,
    setResourceState,
    text.resources.frameSizesError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.products
      .listCharacters()
      .then((items) => {
        if (controller.signal.aborted) return;
        setCharacters(
          items
            .filter((character) => character.status === "active")
            .map((character) => ({
              ...character,
              imageUrl: resolveStudioImageUrl(character.imageUrl),
            })),
        );
        setResourceState("characters", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load Studio characters:", error);
        setResourceState("characters", "error", text.resources.charactersError);
      });
    return () => controller.abort();
  }, [
    resourceReloads.characters,
    setResourceState,
    text.resources.charactersError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.products
      .listCharacterParts()
      .then((items) => {
        if (controller.signal.aborted) return;
        setCharacterParts(
          items
            .filter((part) => part.status === "active")
            .flatMap((part) => {
              const imageUrl = resolveStudioImageUrl(part.imageUrl);
              return imageUrl ? [{ ...part, imageUrl }] : [];
            }),
        );
        setResourceState("characterParts", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load Studio character parts:", error);
        setResourceState(
          "characterParts",
          "error",
          text.resources.characterPartsError,
        );
      });
    return () => controller.abort();
  }, [
    resourceReloads.characterParts,
    setResourceState,
    text.resources.characterPartsError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.products
      .listCharacterPresets()
      .then((items) => {
        if (controller.signal.aborted) return;
        setCharacterPresets(
          items.filter((preset) => preset.status === "active"),
        );
        setResourceState("characterPresets", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load Studio character presets:", error);
        setResourceState(
          "characterPresets",
          "error",
          text.resources.characterPresetsError,
        );
      });
    return () => controller.abort();
  }, [
    resourceReloads.characterPresets,
    setResourceState,
    text.resources.characterPresetsError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.products
      .listFrameBackgrounds(
        frameSize ? { frameOptionId: frameSize } : undefined,
      )
      .then((backgrounds) => {
        if (controller.signal.aborted) return;
        const activeBackgrounds = (backgrounds as StudioFrameBackground[])
          .filter((background) => background.status === "active")
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map(mapFrameBackground);
        setTemplates(activeBackgrounds);
        setResourceState("templates", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to reload frame backgrounds:", error);
        setResourceState("templates", "error", text.resources.templatesError);
      });
    return () => controller.abort();
  }, [
    frameSize,
    resourceReloads.templates,
    setResourceState,
    text.resources.templatesError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.categories
      .listTemplateCategories()
      .then((categories) => {
        if (controller.signal.aborted) return;
        setTemplateCategories(
          categories
            .map((category) => ({
              id: category.slug || category.id,
              name: category.name,
              slug: category.slug,
            }))
            .sort((left, right) => left.name.localeCompare(right.name, locale)),
        );
        setResourceState("templateCategories", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load Studio template categories:", error);
        setTemplateCategories(getBackgroundCategories(templates, locale));
        setResourceState(
          "templateCategories",
          "error",
          text.resources.templateCategoriesError,
        );
      });
    return () => controller.abort();
  }, [
    locale,
    resourceReloads.templateCategories,
    setResourceState,
    templates,
    text.resources.templateCategoriesError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.products
      .listAccessories()
      .then((items) => {
        if (controller.signal.aborted) return;
        setAccessories(
          (items as Array<ApiAccessory & { status?: string }>)
            .filter((accessory) => accessory.status === "active")
            .map(mapStudioAccessory)
            .sort(
              (left, right) =>
                (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
                left.name.localeCompare(right.name, "vi"),
            ),
        );
        setResourceState("accessories", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load studio accessories:", error);
        setResourceState(
          "accessories",
          "error",
          text.resources.accessoriesError,
        );
      });
    return () => controller.abort();
  }, [
    resourceReloads.accessories,
    setResourceState,
    text.resources.accessoriesError,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    publicApiClient.categories
      .listAccessoryCategories()
      .then((categories) => {
        if (controller.signal.aborted) return;
        setAccessoryCategories(
          [...categories].sort((left, right) =>
            left.name.localeCompare(right.name, locale),
          ),
        );
        setResourceState("accessoryCategories", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load accessory categories:", error);
        setResourceState(
          "accessoryCategories",
          "error",
          text.resources.accessoryCategoriesError,
        );
      });
    return () => controller.abort();
  }, [
    locale,
    resourceReloads.accessoryCategories,
    setResourceState,
    text.resources.accessoryCategoriesError,
  ]);

  const retryableResources: StudioResourceKey[] = [
    "frameSizes",
    "templates",
    "templateCategories",
    "accessories",
    "accessoryCategories",
    "characters",
    "characterParts",
    "characterPresets",
  ];
  const isLoadingData = (
    ["frameSizes", "characters", "characterParts", "characterPresets"] as const
  ).some((resource) => resourceStates[resource].status === "loading");
  const dataError =
    (
      [
        "frameSizes",
        "characters",
        "characterParts",
        "characterPresets",
      ] as const
    )
      .map((resource) => resourceStates[resource].error)
      .find((error): error is string => Boolean(error)) ?? null;

  return {
    templates,
    templateCategories,
    accessories,
    characters,
    characterParts,
    characterPresets,
    accessoryCategories,
    frameSizes,
    resourceStates,
    retryResource,
    retryableResources,
    isLoadingData,
    dataError,
    isBackgroundsLoading: resourceStates.templates.status === "loading",
    backgroundsError: resourceStates.templates.error,
    isAccessoriesLoading: resourceStates.accessories.status === "loading",
    accessoriesError: resourceStates.accessories.error,
    isAccessoryCategoriesLoading:
      resourceStates.accessoryCategories.status === "loading",
    accessoryCategoriesError: resourceStates.accessoryCategories.error,
  };
}
