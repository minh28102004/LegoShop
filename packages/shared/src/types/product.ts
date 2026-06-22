import type { FrameOptionType, ProductStatus } from '../constants/status';
import type {
  ID,
  JsonObject,
  JsonValue,
  Nullable,
  PriceInVND,
  Timestamped,
  URLString,
} from './common';
import type { AccessoryCategory, TemplateCategory } from './category';

export type Product = Timestamped & {
  id: ID;
  name: string;
  slug: string;
  description: Nullable<string>;
  basePrice: PriceInVND;
  images: URLString[];
  status: ProductStatus;
  featured: boolean;
};

export type ProductSummary = Pick<
  Product,
  'id' | 'name' | 'slug' | 'description' | 'basePrice' | 'images' | 'status' | 'featured'
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
  stock: number;
  minQuantity: number;
  maxQuantity: number;
  sortOrder: number;
  popular: boolean;
  metadata: Nullable<JsonObject>;
  status: ProductStatus;
};
