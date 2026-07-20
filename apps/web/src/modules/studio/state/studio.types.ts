import type {
  Character,
  CharacterPart,
  CharacterPartType,
  CharacterPreset,
  JsonObject,
  JsonValue,
} from "@lego-shop/shared";

export type ElementType = "text" | "accessory" | "character";

export const STUDIO_STEPS = [
  "frame",
  "background",
  "content",
  "characters",
  "review",
] as const;

export type StudioStep = (typeof STUDIO_STEPS)[number];

export const STUDIO_STEP_INDEX: Record<StudioStep, number> = {
  frame: 0,
  background: 1,
  content: 2,
  characters: 3,
  review: 4,
};

export type StudioTool =
  | "frame"
  | "background"
  | "image"
  | "text"
  | "characters"
  | "accessories"
  | "layers";

export type StudioPanelTab =
  | "frame"
  | "templates"
  | "backgrounds"
  | "information"
  | "uploads"
  | "add-text"
  | "formatting"
  | "characters"
  | "accessories"
  | "layers"
  | "review";

export const DEFAULT_TOOL_BY_STEP: Record<StudioStep, StudioTool> = {
  frame: "frame",
  background: "background",
  content: "text",
  characters: "characters",
  review: "layers",
};

export const DEFAULT_PANEL_TAB_BY_STEP: Record<StudioStep, StudioPanelTab> = {
  frame: "frame",
  background: "templates",
  content: "information",
  characters: "characters",
  review: "review",
};

export type StudioElementOwner = "template" | "user";

export type StudioCharacterPartSnapshot = {
  id: string;
  name: string;
  type: CharacterPartType;
  imageUrl: string | null;
};

export interface StudioElement {
  id: string;
  type: ElementType;
  owner?: StudioElementOwner;
  x: number;
  y: number;
  content?: string;
  imageUrl?: string;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  price?: number;
  accessoryId?: string;
  characterId?: string;
  scale?: number;
  rotation?: number;
  faceId?: string;
  hairId?: string;
  torsoId?: string;
  legsId?: string;
  hatId?: string;
  accessoryIds?: string[];
  characterParts?: Partial<
    Record<
      CharacterPartType,
      StudioCharacterPartSnapshot | StudioCharacterPartSnapshot[]
    >
  >;
}

export interface PrintText {
  title: string;
  date: string;
  message: string;
}

export type StudioContentFieldType = "text" | "date" | "textarea" | "image";

export interface StudioContentField {
  key: string;
  label: string;
  type: StudioContentFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  maxLines?: number;
}

export interface ApiTemplate {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  configJson: JsonObject | null;
  contentFields?: JsonValue | null;
  status?: string;
  source?: "template" | "background";
  category?: string | null;
  thumbnailUrl?: string | null;
  naturalWidth?: number | null;
  naturalHeight?: number | null;
}

export interface ApiAccessory {
  id: string;
  name: string;
  slug?: string | null;
  price: number;
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  iconUrl: string | null;
  categoryId: string | null;
  sortOrder?: number;
  naturalWidth?: number | null;
  naturalHeight?: number | null;
}

export type ApiCharacter = Character;
export type ApiCharacterPart = CharacterPart;
export type ApiCharacterPreset = CharacterPreset;

export type StudioCharacterInput = {
  name?: string;
  face: ApiCharacterPart;
  hair: ApiCharacterPart;
  torso: ApiCharacterPart;
  legs: ApiCharacterPart;
  hat?: ApiCharacterPart;
  accessories?: ApiCharacterPart[];
};

export interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface ApiFrameSize {
  id: string;
  label: string;
  price: number;
  popular: boolean;
  status: string;
  widthCm: number | null;
  heightCm: number | null;
  colorHex: string | null;
  colorName: string | null;
}

export interface ApiFrameBackground {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  imageUrl: string;
  contentFields?: JsonValue | null;
  sortOrder: number;
  status: string;
}

export type StudioResourceKey =
  | "frameSizes"
  | "templates"
  | "templateCategories"
  | "accessories"
  | "accessoryCategories"
  | "characters"
  | "characterParts"
  | "characterPresets";

export type ResourceStatus = "idle" | "loading" | "success" | "error";

export type StudioResourceState = Record<
  StudioResourceKey,
  { status: ResourceStatus; error: string | null }
>;

export type StudioRestoreStatus =
  "idle" | "loading" | "hydrating" | "ready" | "error";

export type StudioSaveStatus =
  | "idle"
  | "validating"
  | "preparing-preview"
  | "saving"
  | "success"
  | "error"
  | "auth-required";

export type StudioDesignState = {
  frameSize: string;
  activeTemplate: string | null;
  customBackgroundUrl: string | null;
  customBackgroundOriginalName: string | null;
  contentFields: StudioContentField[];
  contentValues: Record<string, string>;
  elements: StudioElement[];
};

export type StudioValidationResult = {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  summaryErrors: string[];
  firstInvalidField?: string;
};

export type StudioPriceBreakdown = {
  basePrice: number;
  framePrice: number;
  templatePrice: number;
  characterPrice: number;
  accessoryPrice: number;
  customizationPrice: number;
  totalPrice: number;
};

export type DesignSnapshot = Pick<
  StudioDesignState,
  | "frameSize"
  | "activeTemplate"
  | "customBackgroundUrl"
  | "customBackgroundOriginalName"
  | "contentValues"
  | "elements"
>;

export type StudioHistory = {
  past: DesignSnapshot[];
  present: DesignSnapshot;
  future: DesignSnapshot[];
};

export type TemplatePreservationResult = {
  canPreserve: boolean;
  preservedFields: string[];
  destructiveFields: string[];
};
