import type { FrameOptionType, ProductStatus, ProductType } from '../constants/status';
import type {
  ID,
  JsonObject,
  JsonValue,
  Nullable,
  PriceInVND,
  Timestamped,
  URLString,
} from './common';
import type { AccessoryCategory, Collection, TemplateCategory } from './category';

export type ProductComponentPart = JsonObject & {
  id?: ID;
  type: 'frame' | 'background' | 'character' | 'accessory' | 'product';
  name: string;
  price?: PriceInVND;
  quantity?: number;
  imageUrl?: Nullable<URLString>;
};

export type ProductComponentConfig = JsonObject & {
  frame?: ProductComponentPart;
  background?: ProductComponentPart;
  characters?: ProductComponentPart[];
  accessories?: ProductComponentPart[];
  parts?: ProductComponentPart[];
};

export type Product = Timestamped & {
  id: ID;
  name: string;
  slug: string;
  description: Nullable<string>;
  basePrice: PriceInVND;
  images: URLString[];
  productType: ProductType | string;
  componentConfig: Nullable<ProductComponentConfig>;
  status: ProductStatus;
  featured: boolean;
  collectionId: Nullable<ID>;
  collection?: Nullable<Collection>;
};

export type ProductSummary = Pick<
  Product,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'basePrice'
  | 'images'
  | 'productType'
  | 'componentConfig'
  | 'status'
  | 'featured'
  | 'collectionId'
>;

export type Template = Timestamped & {
  id: ID;
  name: string;
  imageUrl: Nullable<URLString>;
  configJson: Nullable<JsonObject>;
  status: ProductStatus;
  categoryId: Nullable<ID>;
  category?: Nullable<TemplateCategory>;
};

export type Accessory = Timestamped & {
  id: ID;
  name: string;
  price: PriceInVND;
  imageUrl: Nullable<URLString>;
  iconUrl: Nullable<URLString>;
  status: ProductStatus;
  categoryId: Nullable<ID>;
  category?: Nullable<AccessoryCategory>;
};

export type Character = Timestamped & {
  id: ID;
  name: string;
  price: PriceInVND;
  imageUrl: Nullable<URLString>;
  sortOrder: number;
  status: ProductStatus;
};

export type Banner = Timestamped & {
  id: ID;
  title: Nullable<string>;
  imageUrl: URLString;
  linkUrl: Nullable<URLString>;
  sortOrder: number;
  status: ProductStatus;
};

export type FrameBackground = Timestamped & {
  id: ID;
  title: string;
  description: Nullable<string>;
  instructions: Nullable<string>;
  imageUrl: URLString;
  contentFields: Nullable<JsonValue>;
  frameOptionIds: ID[];
  sortOrder: number;
  status: ProductStatus;
};

export type FrameSize = Timestamped & {
  id: ID;
  label: string;
  price: PriceInVND;
  popular: boolean;
  status: ProductStatus;
};

export type FrameColor = Timestamped & {
  id: ID;
  name: string;
  colorHex: Nullable<string>;
  status: ProductStatus;
};

export type FrameOption = Timestamped & {
  id: ID;
  type: FrameOptionType;
  name: string;
  label: Nullable<string>;
  slug: Nullable<string>;
  description: Nullable<string>;
  colorHex: Nullable<string>;
  imageUrl: Nullable<URLString>;
  widthCm: Nullable<number>;
  heightCm: Nullable<number>;
  price: PriceInVND;
  stock: Nullable<number>;
  minQuantity: number;
  maxQuantity: number;
  sortOrder: number;
  popular: boolean;
  metadata: Nullable<JsonObject>;
  status: ProductStatus;
};
