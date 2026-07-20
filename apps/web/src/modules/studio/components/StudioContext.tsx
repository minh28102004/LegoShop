"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore, type SimpleCartItem } from "@/features/cart/store";
import { isCustomFrameDesignData } from "../lib/design-data";
import {
  mergePrintTextIntoContentValues,
  selectCharacterCount,
  selectPrintText,
} from "../state/studio-selectors";
import {
  areSnapshotsEqual,
  createSnapshot,
  createStudioHistory,
  pushHistory,
  redoHistory,
  resetHistory,
  undoHistory,
} from "../state/studio-history";
import {
  calculateStudioPrice,
  DEFAULT_CHARACTER_SURCHARGE,
} from "../lib/studio-pricing";
import { validateStudioStep } from "../lib/studio-validation";
import { useStudioI18n } from "../hooks/useStudioI18n";
import { useStudioData } from "../hooks/useStudioData";
import { resolveStudioImageUrl } from "../lib/studio-data";
import {
  buildCharacterPartSnapshots,
  calculateCharacterPrice,
  type FrameRestoreOverride,
  getNextCharacterNumber,
  getRestoredContentValues,
  getRestoredFrameSizeId,
  getRestoredTextElements,
  getStoredCharacterAccessorySnapshots,
  getStoredCharacterPartSnapshot,
  getTemplateElements,
  isElementType,
  isRecord,
  normalizeContentFields,
  readString,
  toCharacterPartSnapshot,
} from "../lib/studio-restore";
import {
  DEFAULT_PANEL_TAB_BY_STEP,
  DEFAULT_TOOL_BY_STEP,
} from "../state/studio.types";
import type {
  ApiAccessory,
  ApiCategory,
  ApiCharacter,
  ApiCharacterPart,
  ApiCharacterPreset,
  ApiFrameSize,
  ApiTemplate,
  PrintText,
  StudioCharacterInput,
  StudioCharacterPartSnapshot,
  StudioContentField,
  DesignSnapshot,
  StudioDesignState,
  StudioElement,
  StudioHistory,
  StudioPriceBreakdown,
  StudioResourceKey,
  StudioResourceState,
  StudioRestoreStatus,
  StudioPanelTab,
  StudioStep,
  StudioTool,
  StudioValidationResult,
} from "../state/studio.types";

export type {
  ApiAccessory,
  ApiCategory,
  ApiCharacter,
  ApiCharacterPart,
  ApiCharacterPreset,
  ApiFrameSize,
  ApiTemplate,
  ElementType,
  PrintText,
  StudioCharacterInput,
  StudioCharacterPartSnapshot,
  StudioContentField,
  StudioContentFieldType,
  StudioElement,
  StudioPanelTab,
  StudioStep,
  StudioTool,
} from "../state/studio.types";

export interface StudioContextType {
  activeStep: StudioStep;
  setActiveStep: (step: StudioStep) => void;
  activeTool: StudioTool;
  setActiveTool: (tool: StudioTool) => void;
  activePanelTab: StudioPanelTab;
  setActivePanelTab: (tab: StudioPanelTab) => void;
  isContextPanelCollapsed: boolean;
  setIsContextPanelCollapsed: (collapsed: boolean) => void;
  frameSize: string;
  setFrameSize: (size: string) => void;
  printText: PrintText;
  setPrintText: (text: PrintText) => void;
  contentFields: StudioContentField[];
  contentValues: Record<string, string>;
  setContentValue: (key: string, value: string) => void;
  clearContentValues: () => void;

  elements: StudioElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeTemplate: string | null;
  setActiveTemplate: (id: string | null) => void;
  customBackgroundUrl: string | null;
  setCustomBackgroundUrl: (url: string | null) => void;
  customBackgroundOriginalName: string | null;
  setCustomBackgroundOriginalName: (name: string | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  editCartItemId: string | null;
  isEditMode: boolean;

  // Characters (nhân vật LEGO)
  characterCount: number;
  characterPrice: number;

  totalPrice: number;
  priceBreakdown: StudioPriceBreakdown;
  designState: StudioDesignState;
  validateStep: (targetStep: StudioStep) => StudioValidationResult;
  restoreStatus: StudioRestoreStatus;
  savedDesignId: string | null;
  setSavedDesignId: (id: string | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  addElement: (el: Omit<StudioElement, "id">) => void;
  addCharacter: (character: StudioCharacterInput) => void;
  updateCharacterParts: (id: string, character: StudioCharacterInput) => void;
  removeLastCharacter: () => void;
  updateElement: (id: string, updates: Partial<StudioElement>) => void;
  removeElement: (id: string) => void;
  clearAll: () => void;

  // Data from API
  templates: ApiTemplate[];
  templateCategories: ApiCategory[];
  accessories: ApiAccessory[];
  characters: ApiCharacter[];
  characterParts: ApiCharacterPart[];
  characterPresets: ApiCharacterPreset[];
  accessoryCategories: ApiCategory[];
  frameSizes: ApiFrameSize[];
  isLoadingData: boolean;
  dataError: string | null;
  isBackgroundsLoading: boolean;
  backgroundsError: string | null;
  isAccessoriesLoading: boolean;
  accessoriesError: string | null;
  isAccessoryCategoriesLoading: boolean;
  accessoryCategoriesError: string | null;
  resourceStates: StudioResourceState;
  retryResource: (resource: StudioResourceKey) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const EMPTY_DESIGN_SNAPSHOT: DesignSnapshot = {
  frameSize: "",
  activeTemplate: null,
  customBackgroundUrl: null,
  customBackgroundOriginalName: null,
  contentValues: {},
  elements: [],
};

export function StudioProvider({ children }: { children: ReactNode }) {
  const { text } = useStudioI18n();
  const defaultContentFields = useMemo<StudioContentField[]>(
    () => text.defaults.contentFields.map((field) => ({ ...field })),
    [text.defaults.contentFields],
  );
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();
  const [activeStep, setActiveStep] = useState<StudioStep>("frame");
  const [activeTool, setActiveTool] = useState<StudioTool>(
    DEFAULT_TOOL_BY_STEP.frame,
  );
  const [activePanelTab, setActivePanelTab] = useState<StudioPanelTab>(
    DEFAULT_PANEL_TAB_BY_STEP.frame,
  );
  const [isContextPanelCollapsed, setIsContextPanelCollapsed] =
    useState(false);
  const [frameSize, setFrameSize] = useState<string>("");
  const [contentValues, setContentValues] = useState<Record<string, string>>(
    {},
  );

  const [elements, setElements] = useState<StudioElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(
    null,
  );
  const [customBackgroundOriginalName, setCustomBackgroundOriginalName] =
    useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [editCartItemId, setEditCartItemId] = useState<string | null>(null);
  const [frameRestoreOverride, setFrameRestoreOverride] =
    useState<FrameRestoreOverride | null>(null);
  const [restoreStatus, setRestoreStatus] =
    useState<StudioRestoreStatus>("idle");
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const hasRestoredCartItemRef = useRef(false);
  const lastRestoreKeyRef = useRef<string | null>(null);
  const skipNextTemplateResetRef = useRef(false);
  const lastAppliedTemplateRef = useRef<string | null | undefined>(undefined);
  const restoredActiveTemplateRef = useRef<string | null | undefined>(
    undefined,
  );
  const [history, setHistory] = useState<StudioHistory>(() =>
    createStudioHistory(EMPTY_DESIGN_SNAPSHOT),
  );
  const historyRef = useRef(history);
  const isApplyingHistoryRef = useRef(false);
  const historyResetPendingRef = useRef(false);

  const {
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
    isLoadingData,
    dataError,
    isBackgroundsLoading,
    backgroundsError,
    isAccessoriesLoading,
    accessoriesError,
    isAccessoryCategoriesLoading,
    accessoryCategoriesError,
  } = useStudioData(frameSize);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(searchParamString);
    const nextEditCartItemId = params.get("editCartItemId");
    const nextOverride: FrameRestoreOverride = {
      id: params.get("frameOptionId"),
      label: params.get("frameLabel"),
      color: params.get("frameColor"),
    };
    const nextOverrideValue =
      nextOverride.id || nextOverride.label || nextOverride.color
        ? nextOverride
        : null;
    const nextRestoreKey = JSON.stringify({
      editCartItemId: nextEditCartItemId,
      frameOverride: nextOverrideValue,
    });

    if (lastRestoreKeyRef.current !== nextRestoreKey) {
      hasRestoredCartItemRef.current = false;
      restoredActiveTemplateRef.current = undefined;
      lastRestoreKeyRef.current = null;
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setEditCartItemId(nextEditCartItemId);
      setFrameRestoreOverride(nextOverrideValue);
      setRestoreStatus(nextEditCartItemId ? "loading" : "idle");
    });

    return () => {
      cancelled = true;
    };
  }, [searchParamString]);

  // When activeTemplate changes, reload its default elements
  useEffect(() => {
    if (isBackgroundsLoading) return;
    if (!activeTemplate) {
      lastAppliedTemplateRef.current = null;
      return;
    }
    if (
      hasRestoredCartItemRef.current &&
      restoredActiveTemplateRef.current !== undefined &&
      activeTemplate === restoredActiveTemplateRef.current
    ) {
      skipNextTemplateResetRef.current = false;
      lastAppliedTemplateRef.current = activeTemplate;
      return;
    }
    if (
      hasRestoredCartItemRef.current &&
      restoredActiveTemplateRef.current !== undefined &&
      activeTemplate !== restoredActiveTemplateRef.current
    ) {
      restoredActiveTemplateRef.current = undefined;
    }
    if (skipNextTemplateResetRef.current) {
      skipNextTemplateResetRef.current = false;
      lastAppliedTemplateRef.current = activeTemplate;
      return;
    }
    if (lastAppliedTemplateRef.current === activeTemplate) return;

    const tpl = templates.find((t) => t.id === activeTemplate);
    const templateElements = tpl ? getTemplateElements(tpl.configJson) : [];
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      lastAppliedTemplateRef.current = activeTemplate;
      const nextTemplateElements = templateElements.map((element) => ({
        ...element,
        owner: "template" as const,
        id: Math.random().toString(36).substring(2, 9),
      }));
      setElements((currentElements) => [
        ...currentElements.filter((element) => element.owner !== "template"),
        ...nextTemplateElements,
      ]);
      setSelectedId(null);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTemplate, templates, isBackgroundsLoading]);

  const activeTemplateObj = useMemo(
    () => templates.find((t) => t.id === activeTemplate) ?? null,
    [activeTemplate, templates],
  );
  const contentFields = useMemo(
    () =>
      normalizeContentFields(
        activeTemplateObj?.contentFields,
        defaultContentFields,
        text.defaults.fieldLabel,
      ),
    [
      activeTemplateObj?.contentFields,
      defaultContentFields,
      text.defaults.fieldLabel,
    ],
  );
  const printText = useMemo(
    () => selectPrintText(contentFields, contentValues),
    [contentFields, contentValues],
  );
  const setPrintText = useCallback(
    (nextPrintText: PrintText) => {
      setContentValues((currentValues) =>
        mergePrintTextIntoContentValues(
          contentFields,
          currentValues,
          nextPrintText,
        ),
      );
    },
    [contentFields],
  );
  const characterCount = useMemo(
    () => selectCharacterCount(elements),
    [elements],
  );
  const designState = useMemo<StudioDesignState>(
    () => ({
      frameSize,
      activeTemplate,
      customBackgroundUrl,
      customBackgroundOriginalName,
      contentFields,
      contentValues,
      elements,
    }),
    [
      activeTemplate,
      contentFields,
      contentValues,
      customBackgroundOriginalName,
      customBackgroundUrl,
      elements,
      frameSize,
    ],
  );
  const designSnapshot = useMemo(
    () => createSnapshot(designState),
    [designState],
  );

  useEffect(() => {
    if (restoreStatus === "loading" || restoreStatus === "hydrating") return;

    if (historyResetPendingRef.current) {
      historyResetPendingRef.current = false;
      const nextHistory = resetHistory(designSnapshot);
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      return;
    }

    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      return;
    }

    setHistory((currentHistory) => {
      if (areSnapshotsEqual(currentHistory.present, designSnapshot)) {
        historyRef.current = currentHistory;
        return currentHistory;
      }

      const nextHistory = pushHistory(currentHistory, designSnapshot);
      historyRef.current = nextHistory;
      return nextHistory;
    });
  }, [designSnapshot, restoreStatus]);

  const applyDesignSnapshot = useCallback((snapshot: DesignSnapshot) => {
    isApplyingHistoryRef.current = true;
    skipNextTemplateResetRef.current = true;
    lastAppliedTemplateRef.current = snapshot.activeTemplate;
    setFrameSize(snapshot.frameSize);
    setActiveTemplate(snapshot.activeTemplate);
    setCustomBackgroundUrl(snapshot.customBackgroundUrl);
    setCustomBackgroundOriginalName(snapshot.customBackgroundOriginalName);
    setContentValues({ ...snapshot.contentValues });
    setElements(snapshot.elements.map((element) => ({ ...element })));
    setSelectedId(null);
  }, []);

  const undo = useCallback(() => {
    const nextHistory = undoHistory(historyRef.current);
    if (nextHistory === historyRef.current) return;

    historyRef.current = nextHistory;
    setHistory(nextHistory);
    applyDesignSnapshot(nextHistory.present);
  }, [applyDesignSnapshot]);

  const redo = useCallback(() => {
    const nextHistory = redoHistory(historyRef.current);
    if (nextHistory === historyRef.current) return;

    historyRef.current = nextHistory;
    setHistory(nextHistory);
    applyDesignSnapshot(nextHistory.present);
  }, [applyDesignSnapshot]);
  const validateStep = useCallback(
    (targetStep: StudioStep) =>
      validateStudioStep(targetStep, designState, text.validation),
    [designState, text.validation],
  );

  function restoreCartItem(cartItem: SimpleCartItem) {
    const designData = cartItem.designData;
    const accessoryPriceById = new Map(
      (cartItem.accessories ?? []).map((accessory) => [
        accessory.id,
        accessory.price,
      ]),
    );
    const accessoryById = new Map(
      accessories.map((accessory) => [accessory.id, accessory]),
    );
    const characterById = new Map(
      characters.map((character) => [character.id, character]),
    );
    const characterPartById = new Map(
      characterParts.map((part) => [part.id, part]),
    );

    const restoredFrameSizeId = getRestoredFrameSizeId(
      cartItem,
      frameSizes,
      frameRestoreOverride,
    );
    if (process.env.NODE_ENV !== "production") {
      const framePart = cartItem.parts?.find((part) => part.type === "frame");
      console.info("[studio restore frame]", {
        restoredFrameSizeId,
        frameRestoreOverride,
        framePart,
        cartFrameSizeId: cartItem.frameSizeId,
        cartFrameSizeLabel: cartItem.frameSizeLabel,
        cartFrameColorName: cartItem.frameColorName,
        designFrameOptionId: isCustomFrameDesignData(designData)
          ? designData.frameOptionId
          : null,
        designFrameOptionLabel: isCustomFrameDesignData(designData)
          ? designData.frameOptionLabel
          : null,
        availableFrameSizes: frameSizes.map((size) => ({
          id: size.id,
          label: size.label,
          colorName: size.colorName,
        })),
      });
    }
    setFrameSize(restoredFrameSizeId);
    setSelectedId(null);
    setActiveStep("review");
    setActiveTool(DEFAULT_TOOL_BY_STEP.review);
    setActivePanelTab(DEFAULT_PANEL_TAB_BY_STEP.review);
    setIsContextPanelCollapsed(false);

    if (isCustomFrameDesignData(designData)) {
      const backgroundTemplateId = designData.backgroundId
        ? `background:${designData.backgroundId}`
        : null;
      const uploadedBackground = designData.uploadedImages.find(
        (image) => image.type === "background",
      );

      skipNextTemplateResetRef.current = true;
      restoredActiveTemplateRef.current = backgroundTemplateId ?? null;
      if (backgroundTemplateId) {
        setActiveTemplate(backgroundTemplateId);
        setCustomBackgroundUrl(null);
        setCustomBackgroundOriginalName(null);
      } else if (uploadedBackground?.url) {
        setActiveTemplate(null);
        setCustomBackgroundUrl(resolveStudioImageUrl(uploadedBackground.url));
        setCustomBackgroundOriginalName(uploadedBackground.originalName);
      }

      setContentValues(
        getRestoredContentValues(
          designData,
          backgroundTemplateId,
          templates,
          contentFields,
        ),
      );
      setElements([
        ...getRestoredTextElements(designData),
        ...designData.accessories.map((accessory) => ({
          id: `${accessory.id}-${Math.random().toString(36).substring(2, 8)}`,
          type: "accessory" as const,
          x: accessory.position.x,
          y: accessory.position.y,
          width: 60 * accessory.position.scale,
          height: 60 * accessory.position.scale,
          content: accessory.name,
          imageUrl:
            resolveStudioImageUrl(readString(accessory.imageUrl) ?? null) ??
            resolveStudioImageUrl(
              accessoryById.get(accessory.id)?.imageUrl ?? null,
            ) ??
            resolveStudioImageUrl(
              accessoryById.get(accessory.id)?.iconUrl ?? null,
            ) ??
            "",
          price:
            accessoryById.get(accessory.id)?.price ??
            accessoryPriceById.get(accessory.id) ??
            0,
          accessoryId: accessory.id,
          owner: "user" as const,
        })),
        ...designData.characters.map((character, index) => {
          const catalogCharacter = character.catalogId
            ? characterById.get(character.catalogId)
            : null;
          const imageUrl =
            resolveStudioImageUrl(character.imageUrl ?? null) ??
            resolveStudioImageUrl(catalogCharacter?.imageUrl ?? null);
          const position = character.position ?? {
            x: character.x,
            y: character.y,
            scale: character.scale,
            rotate: character.rotation,
          };
          const accessoryIds = Array.isArray(character.accessoryIds)
            ? character.accessoryIds
            : [];
          const face = characterPartById.get(character.faceId);
          const hair = characterPartById.get(character.hairId);
          const torso = characterPartById.get(character.torsoId);
          const legs = characterPartById.get(character.legsId);
          const hat = character.hatId
            ? characterPartById.get(character.hatId)
            : undefined;
          const characterAccessories = accessoryIds
            .map((id) => characterPartById.get(id))
            .filter((part): part is ApiCharacterPart => Boolean(part));
          const element: StudioElement = {
            id: character.id || `character-${index + 1}`,
            type: "character",
            x: position.x,
            y: position.y,
            width: 46 * position.scale,
            height: 74 * position.scale,
            scale: position.scale,
            rotation:
              character.rotation ?? position.rotation ?? position.rotate ?? 0,
            content:
              character.name ?? catalogCharacter?.name ?? `NV ${index + 1}`,
            price:
              character.price ??
              catalogCharacter?.price ??
              DEFAULT_CHARACTER_SURCHARGE,
            owner: "user",
          };

          if (character.catalogId) element.characterId = character.catalogId;
          if (imageUrl) element.imageUrl = imageUrl;
          if (character.faceId) element.faceId = character.faceId;
          if (character.hairId) element.hairId = character.hairId;
          if (character.torsoId) element.torsoId = character.torsoId;
          if (character.legsId) element.legsId = character.legsId;
          if (character.hatId) element.hatId = character.hatId;
          if (accessoryIds.length) element.accessoryIds = accessoryIds;
          element.characterParts = {};
          const faceSnapshot = toCharacterPartSnapshot(face);
          const hairSnapshot = toCharacterPartSnapshot(hair);
          const torsoSnapshot = toCharacterPartSnapshot(torso);
          const legsSnapshot = toCharacterPartSnapshot(legs);
          const hatSnapshot = toCharacterPartSnapshot(hat);
          const accessorySnapshots = characterAccessories
            .map((part) => toCharacterPartSnapshot(part))
            .filter((part): part is StudioCharacterPartSnapshot =>
              Boolean(part),
            );
          const storedCharacterParts = isRecord(character.characterParts)
            ? character.characterParts
            : null;
          const storedFaceSnapshot = getStoredCharacterPartSnapshot(
            storedCharacterParts?.FACE,
          );
          const storedHairSnapshot = getStoredCharacterPartSnapshot(
            storedCharacterParts?.HAIR,
          );
          const storedTorsoSnapshot = getStoredCharacterPartSnapshot(
            storedCharacterParts?.TORSO,
          );
          const storedLegsSnapshot = getStoredCharacterPartSnapshot(
            storedCharacterParts?.LEGS,
          );
          const storedHatSnapshot = getStoredCharacterPartSnapshot(
            storedCharacterParts?.HAT,
          );
          const storedAccessorySnapshots = getStoredCharacterAccessorySnapshots(
            storedCharacterParts?.ACCESSORY,
          );

          const restoredFaceSnapshot = faceSnapshot ?? storedFaceSnapshot;
          const restoredHairSnapshot = hairSnapshot ?? storedHairSnapshot;
          const restoredTorsoSnapshot = torsoSnapshot ?? storedTorsoSnapshot;
          const restoredLegsSnapshot = legsSnapshot ?? storedLegsSnapshot;
          const restoredHatSnapshot = hatSnapshot ?? storedHatSnapshot;

          if (restoredFaceSnapshot)
            element.characterParts.FACE = restoredFaceSnapshot;
          if (restoredHairSnapshot)
            element.characterParts.HAIR = restoredHairSnapshot;
          if (restoredTorsoSnapshot)
            element.characterParts.TORSO = restoredTorsoSnapshot;
          if (restoredLegsSnapshot)
            element.characterParts.LEGS = restoredLegsSnapshot;
          if (restoredHatSnapshot)
            element.characterParts.HAT = restoredHatSnapshot;
          element.characterParts.ACCESSORY =
            accessorySnapshots.length > 0
              ? accessorySnapshots
              : storedAccessorySnapshots;

          return element;
        }),
      ]);
      return;
    }

    const legacyTemplateId =
      typeof designData.templateId === "string" ? designData.templateId : null;
    skipNextTemplateResetRef.current = true;
    setActiveTemplate(legacyTemplateId);
    setCustomBackgroundUrl(
      resolveStudioImageUrl(
        typeof designData.backgroundImageUrl === "string"
          ? designData.backgroundImageUrl
          : cartItem.previewUrl,
      ),
    );
    setCustomBackgroundOriginalName(null);
    const legacyPrintText: PrintText = {
      title:
        typeof designData.printText === "object" &&
        designData.printText &&
        !Array.isArray(designData.printText)
          ? String(
              (designData.printText as Record<string, unknown>).title ?? "",
            )
          : "",
      date:
        typeof designData.printText === "object" &&
        designData.printText &&
        !Array.isArray(designData.printText)
          ? String((designData.printText as Record<string, unknown>).date ?? "")
          : "",
      message:
        typeof designData.printText === "object" &&
        designData.printText &&
        !Array.isArray(designData.printText)
          ? String(
              (designData.printText as Record<string, unknown>).message ?? "",
            )
          : "",
    };
    const legacyContentValues =
      typeof designData.contentValues === "object" &&
      designData.contentValues &&
      !Array.isArray(designData.contentValues)
        ? (Object.fromEntries(
            Object.entries(designData.contentValues).filter(
              ([, value]) => typeof value === "string",
            ),
          ) as Record<string, string>)
        : {};
    setContentValues(
      mergePrintTextIntoContentValues(
        contentFields,
        legacyContentValues,
        legacyPrintText,
      ),
    );
    const legacyElements = Array.isArray(designData.elements)
      ? designData.elements.filter(
          (element): element is StudioElement =>
            isRecord(element) && isElementType(element.type),
        )
      : [];
    setElements(
      legacyElements.map((element) => ({ ...element, owner: "user" })),
    );
  }

  const restoreCartItemRef = useRef(restoreCartItem);

  useEffect(() => {
    restoreCartItemRef.current = restoreCartItem;
  });

  useEffect(() => {
    if (
      !editCartItemId ||
      isLoadingData ||
      isBackgroundsLoading ||
      isAccessoriesLoading
    ) {
      return;
    }
    const restoreKey = JSON.stringify({
      editCartItemId,
      frameOverride: frameRestoreOverride,
    });
    if (
      hasRestoredCartItemRef.current &&
      lastRestoreKeyRef.current === restoreKey
    ) {
      return;
    }

    const cartItem = useCartStore
      .getState()
      .items.find((item) => item.id === editCartItemId);
    let cancelled = false;

    if (!cartItem) {
      queueMicrotask(() => {
        if (cancelled) return;
        setRestoreStatus("error");
        hasRestoredCartItemRef.current = true;
        lastRestoreKeyRef.current = restoreKey;
        alert(text.toast.restoreMissing);
        setEditCartItemId(null);
        window.history.replaceState(null, "", "/studio");
      });
    } else {
      queueMicrotask(() => {
        if (cancelled) return;
        setRestoreStatus("hydrating");
        historyResetPendingRef.current = true;
        hasRestoredCartItemRef.current = true;
        lastRestoreKeyRef.current = restoreKey;
        restoreCartItemRef.current(cartItem);
        setRestoreStatus("ready");
      });
    }

    return () => {
      cancelled = true;
    };
  }, [
    editCartItemId,
    frameRestoreOverride,
    isLoadingData,
    isBackgroundsLoading,
    isAccessoriesLoading,
    templates.length,
    characterParts.length,
    frameSizes.length,
    text.toast.restoreMissing,
  ]);

  const priceBreakdown = useMemo(
    () =>
      calculateStudioPrice({
        frameSize,
        frameSizes,
        activeTemplate,
        templates,
        elements,
      }),
    [activeTemplate, elements, frameSize, frameSizes, templates],
  );
  const totalPrice = priceBreakdown.totalPrice;

  const addElement = useCallback((el: Omit<StudioElement, "id">) => {
    const newEl: StudioElement = {
      ...el,
      owner: el.owner ?? "user",
      id: Math.random().toString(36).substring(2, 9),
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, []);

  const setContentValue = useCallback((key: string, value: string) => {
    setContentValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearContentValues = useCallback(() => {
    setContentValues({});
  }, []);

  const addCharacter = useCallback((character: StudioCharacterInput) => {
    const id = Math.random().toString(36).substring(2, 9);
    const characterPrice = calculateCharacterPrice(
      character,
      DEFAULT_CHARACTER_SURCHARGE,
    );

    setElements((prev) => {
      const characters = prev.filter((element) => element.type === "character");
      const characterIndex = characters.length;
      const nextNumber = getNextCharacterNumber(prev);
      const name = character.name?.trim() || `NV ${nextNumber}`;
      const newEl: StudioElement = {
        id,
        type: "character",
        x: 90 + (characterIndex % 4) * 70,
        y: 165 + Math.floor(characterIndex / 4) * 35,
        content: name,
        width: 54,
        height: 92,
        scale: 1,
        rotation: 0,
        price: characterPrice,
        owner: "user",
        faceId: character.face.id,
        hairId: character.hair.id,
        torsoId: character.torso.id,
        legsId: character.legs.id,
        accessoryIds: character.accessories?.map((part) => part.id) ?? [],
        characterParts: buildCharacterPartSnapshots(character),
      };

      if (character.hat?.id) newEl.hatId = character.hat.id;

      return [...prev, newEl];
    });
    setSelectedId(id);
  }, []);

  const updateCharacterParts = useCallback(
    (id: string, character: StudioCharacterInput) => {
      const characterPrice = calculateCharacterPrice(
        character,
        DEFAULT_CHARACTER_SURCHARGE,
      );
      setElements((prev) =>
        prev.map((element) => {
          if (element.id !== id || element.type !== "character") return element;
          const elementWithoutHat = { ...element };
          delete elementWithoutHat.hatId;
          return {
            ...elementWithoutHat,
            content: character.name?.trim() || element.content || "NV",
            price: characterPrice,
            faceId: character.face.id,
            hairId: character.hair.id,
            torsoId: character.torso.id,
            legsId: character.legs.id,
            ...(character.hat?.id ? { hatId: character.hat.id } : {}),
            accessoryIds: character.accessories?.map((part) => part.id) ?? [],
            characterParts: buildCharacterPartSnapshots(character),
          };
        }),
      );
      setSelectedId(id);
    },
    [],
  );

  const removeLastCharacter = useCallback(() => {
    setElements((prev) => {
      const lastCharacterIndex = [...prev]
        .reverse()
        .findIndex((el) => el.type === "character");
      if (lastCharacterIndex === -1) return prev;

      const index = prev.length - 1 - lastCharacterIndex;
      const removed = prev[index];
      setSelectedId((current) =>
        removed && current === removed.id ? null : current,
      );
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }, []);

  const updateElement = useCallback(
    (id: string, updates: Partial<StudioElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      );
    },
    [],
  );

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }, []);

  const clearAll = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      activeStep,
      setActiveStep,
      activeTool,
      setActiveTool,
      activePanelTab,
      setActivePanelTab,
      isContextPanelCollapsed,
      setIsContextPanelCollapsed,
      frameSize,
      setFrameSize,
      frameSizes,
      printText,
      setPrintText,
      contentFields,
      contentValues,
      setContentValue,
      clearContentValues,
      characterCount,
      characterPrice: DEFAULT_CHARACTER_SURCHARGE,
      totalPrice,
      priceBreakdown,
      designState,
      validateStep,
      restoreStatus,
      savedDesignId,
      setSavedDesignId,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      undo,
      redo,
      elements,
      selectedId,
      activeTemplate,
      customBackgroundUrl,
      customBackgroundOriginalName,
      zoom,
      setZoom,
      editCartItemId,
      isEditMode: Boolean(editCartItemId),
      setActiveTemplate,
      setCustomBackgroundUrl,
      setCustomBackgroundOriginalName,
      setSelectedId,
      addElement,
      addCharacter,
      updateCharacterParts,
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      characters,
      characterParts,
      characterPresets,
      accessoryCategories,
      isLoadingData,
      dataError,
      isBackgroundsLoading,
      backgroundsError,
      isAccessoriesLoading,
      accessoriesError,
      isAccessoryCategoriesLoading,
      accessoryCategoriesError,
      resourceStates,
      retryResource,
    }),
    [
      activeStep,
      activeTool,
      activePanelTab,
      isContextPanelCollapsed,
      frameSize,
      frameSizes,
      printText,
      setPrintText,
      contentFields,
      contentValues,
      setContentValue,
      clearContentValues,
      characterCount,
      totalPrice,
      priceBreakdown,
      designState,
      validateStep,
      restoreStatus,
      savedDesignId,
      history.past.length,
      history.future.length,
      undo,
      redo,
      elements,
      selectedId,
      activeTemplate,
      customBackgroundUrl,
      customBackgroundOriginalName,
      zoom,
      editCartItemId,
      addElement,
      addCharacter,
      updateCharacterParts,
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      characters,
      characterParts,
      characterPresets,
      accessoryCategories,
      isLoadingData,
      dataError,
      isBackgroundsLoading,
      backgroundsError,
      isAccessoriesLoading,
      accessoriesError,
      isAccessoryCategoriesLoading,
      accessoryCategoriesError,
      resourceStates,
      retryResource,
    ],
  );

  return (
    <StudioContext.Provider value={contextValue}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
}
