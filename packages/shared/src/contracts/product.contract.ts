import type { FrameOptionType, ProductStatus } from '../constants/status';
import type { ID, JsonObject, PriceInVND, URLString } from '../types/common';
import type {
  Accessory,
  Banner,
  FrameBackground,
  FrameColor,
  FrameOption,
  FrameSize,
  Product,
  ProductSummary,
  Template,
} from '../types/product';

export type ProductContract = Product;
export type ProductSummaryContract = ProductSummary;
export type TemplateContract = Template;
export type AccessoryContract = Accessory;
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
  status?: ProductStatus;
  featured?: boolean;
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
  imageUrl?: URLString;
  widthCm?: number;
  heightCm?: number;
  price?: PriceInVND;
  stock?: number;
  minQuantity?: number;
  maxQuantity?: number;
  sortOrder?: number;
  popular?: boolean;
  metadata?: JsonObject;
  status?: ProductStatus;
};

export type UpdateFrameOptionRequestContract = Partial<CreateFrameOptionRequestContract>;
