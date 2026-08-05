import type {
  CharacterPartType,
  FrameOptionType,
  ProductStatus,
  ProductType,
} from "../constants/status";
import type {
  ID,
  JsonObject,
  JsonValue,
  PriceInVND,
  URLString,
} from "../types/common";
import type {
  Accessory,
  Banner,
  Character,
  CharacterPart,
  CharacterPreset,
  FrameBackground,
  FrameColor,
  FrameOption,
  FrameSize,
  Product,
  ProductComponentConfig,
  ProductSummary,
  Template,
} from "../types/product";

export type ProductContract = Product;
export type ProductSummaryContract = ProductSummary;
export type TemplateContract = Template;
export type AccessoryContract = Accessory;
export type CharacterContract = Character;
export type CharacterPartContract = CharacterPart;
export type CharacterPresetContract = CharacterPreset;
export type BannerContract = Banner;
export type FrameBackgroundContract = FrameBackground;
export type FrameSizeContract = FrameSize;
export type FrameColorContract = FrameColor;
export type FrameOptionContract = FrameOption;

export type CreateProductRequestContract = {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  basePrice: PriceInVND;
  compareAtPrice?: PriceInVND | null;
  images?: URLString[];
  thumbnailUrl?: URLString;
  productType?: ProductType;
  category?: string;
  availability?: string;
  inventory?: number | null;
  published?: boolean;
  characterPresetId?: ID | null;
  componentConfig?: ProductComponentConfig;
  status?: ProductStatus;
  featured?: boolean;
  collectionId?: ID;
};

export type UpdateProductRequestContract =
  Partial<CreateProductRequestContract>;

export type CreateTemplateRequestContract = {
  name: string;
  imageUrl?: URLString;
  configJson?: JsonObject;
  status?: ProductStatus;
  categoryId?: ID;
};

export type UpdateTemplateRequestContract =
  Partial<CreateTemplateRequestContract>;

export type CreateAccessoryRequestContract = {
  name: string;
  price?: PriceInVND;
  imageUrl?: URLString;
  iconUrl?: URLString;
  status?: ProductStatus;
  categoryId?: ID;
};

export type UpdateAccessoryRequestContract =
  Partial<CreateAccessoryRequestContract>;

export type CreateCharacterRequestContract = {
  name: string;
  price?: PriceInVND;
  imageUrl?: URLString;
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateCharacterRequestContract =
  Partial<CreateCharacterRequestContract>;

export type CreateCharacterPartRequestContract = {
  name: string;
  slug?: string;
  type: CharacterPartType;
  imageUrl: URLString;
  priceAdjustment?: PriceInVND;
  compareAtPrice?: PriceInVND | null;
  category?: string;
  availability?: string;
  compatibility?: JsonValue;
  sortOrder?: number;
  tags?: JsonValue;
  status?: ProductStatus;
};

export type UpdateCharacterPartRequestContract =
  Partial<CreateCharacterPartRequestContract>;

export type CreateBannerRequestContract = {
  title?: string;
  sourceKey?: string;
  imageUrl: URLString;
  linkUrl?: URLString;
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateBannerRequestContract = Partial<CreateBannerRequestContract>;

export type CreateFrameBackgroundRequestContract = {
  title: string;
  imageUrl: URLString;
  thumbnailUrl?: URLString;
  category?: string;
  description?: string;
  instructions?: string;
  contentFields?: JsonValue;
  frameOptionIds?: ID[];
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateFrameBackgroundRequestContract =
  Partial<CreateFrameBackgroundRequestContract>;

export type CreateFrameSizeRequestContract = {
  label: string;
  price: PriceInVND;
  popular?: boolean;
};

export type UpdateFrameSizeRequestContract =
  Partial<CreateFrameSizeRequestContract>;

export type CreateFrameColorRequestContract = {
  name: string;
  colorHex?: string;
};

export type UpdateFrameColorRequestContract =
  Partial<CreateFrameColorRequestContract>;

export type CreateFrameOptionRequestContract = {
  type?: FrameOptionType;
  name?: string;
  label?: string;
  slug?: string;
  description?: string;
  colorHex?: string;
  colorVariantsText?: string;
  imageUrl?: URLString;
  widthCm?: number;
  heightCm?: number;
  price?: PriceInVND;
  stock?: number | null;
  minQuantity?: number;
  maxQuantity?: number;
  sortOrder?: number;
  popular?: boolean;
  metadata?: JsonObject;
  status?: ProductStatus;
};

export type UpdateFrameOptionRequestContract =
  Partial<CreateFrameOptionRequestContract>;

export type CreateCharacterPresetRequestContract = {
  name: string;
  slug?: string;
  description?: string;
  previewImageUrl?: URLString;
  isBuilderPreset?: boolean;
  isSellable?: boolean;
  faceHint?: string;
  hairHint?: string;
  torsoHint?: string;
  legsHint?: string;
  hatHint?: string;
  facePartId?: ID | null;
  hairPartId?: ID | null;
  torsoPartId?: ID | null;
  legsPartId?: ID | null;
  hatPartId?: ID | null;
  accessoryPartIds?: ID[];
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateCharacterPresetRequestContract =
  Partial<CreateCharacterPresetRequestContract>;

export type CharacterBuilderQuoteRequestContract = {
  partIds: ID[];
};

export type CharacterBuilderQuoteResponseContract = {
  valid: boolean;
  basePrice: PriceInVND;
  partsTotal: PriceInVND;
  totalPrice: PriceInVND;
  resolvedParts: Array<{
    id: ID;
    name: string;
    type: CharacterPartType;
    imageUrl: URLString;
    priceAdjustment: PriceInVND;
  }>;
};
