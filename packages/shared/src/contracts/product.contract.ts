import type { FrameOptionType, ProductStatus, ProductType } from '../constants/status';
import type { ID, JsonObject, JsonValue, PriceInVND, URLString } from '../types/common';
import type {
  Accessory,
  Banner,
  Character,
  FrameBackground,
  FrameColor,
  FrameOption,
  FrameSize,
  Product,
  ProductComponentConfig,
  ProductSummary,
  Template,
} from '../types/product';

export type ProductContract = Product;
export type ProductSummaryContract = ProductSummary;
export type TemplateContract = Template;
export type AccessoryContract = Accessory;
export type CharacterContract = Character;
export type BannerContract = Banner;
export type FrameBackgroundContract = FrameBackground;
export type FrameSizeContract = FrameSize;
export type FrameColorContract = FrameColor;
export type FrameOptionContract = FrameOption;

export type CreateProductRequestContract = {
  name: string;
  slug?: string;
  description?: string;
  basePrice: PriceInVND;
  images?: URLString[];
  productType?: ProductType;
  componentConfig?: ProductComponentConfig;
  status?: ProductStatus;
  featured?: boolean;
  collectionId?: ID;
};

export type UpdateProductRequestContract = Partial<CreateProductRequestContract>;

export type CreateTemplateRequestContract = {
  name: string;
  imageUrl?: URLString;
  configJson?: JsonObject;
  status?: ProductStatus;
  categoryId?: ID;
};

export type UpdateTemplateRequestContract = Partial<CreateTemplateRequestContract>;

export type CreateAccessoryRequestContract = {
  name: string;
  price?: PriceInVND;
  imageUrl?: URLString;
  iconUrl?: URLString;
  status?: ProductStatus;
  categoryId?: ID;
};

export type UpdateAccessoryRequestContract = Partial<CreateAccessoryRequestContract>;

export type CreateCharacterRequestContract = {
  name: string;
  price?: PriceInVND;
  imageUrl?: URLString;
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateCharacterRequestContract = Partial<CreateCharacterRequestContract>;

export type CreateBannerRequestContract = {
  title?: string;
  imageUrl: URLString;
  linkUrl?: URLString;
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateBannerRequestContract = Partial<CreateBannerRequestContract>;

export type CreateFrameBackgroundRequestContract = {
  title: string;
  imageUrl: URLString;
  description?: string;
  instructions?: string;
  contentFields?: JsonValue;
  frameOptionIds?: ID[];
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateFrameBackgroundRequestContract = Partial<CreateFrameBackgroundRequestContract>;

export type CreateFrameSizeRequestContract = {
  label: string;
  price: PriceInVND;
  popular?: boolean;
};

export type UpdateFrameSizeRequestContract = Partial<CreateFrameSizeRequestContract>;

export type CreateFrameColorRequestContract = {
  name: string;
  colorHex?: string;
};

export type UpdateFrameColorRequestContract = Partial<CreateFrameColorRequestContract>;

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

export type UpdateFrameOptionRequestContract = Partial<CreateFrameOptionRequestContract>;
