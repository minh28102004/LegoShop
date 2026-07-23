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
  Nullable,
  PriceInVND,
  Timestamped,
  URLString,
} from "./common";
import type {
  AccessoryCategory,
  Collection,
  TemplateCategory,
} from "./category";

export type ProductComponentPart = JsonObject & {
  id?: ID;
  type:
    | "frame"
    | "frameColor"
    | "background"
    | "character"
    | "accessory"
    | "product";
  name: string;
  price?: PriceInVND;
  quantity?: number;
  imageUrl?: Nullable<URLString>;
};

export type ProductComponentConfig = JsonObject & {
  frame?: ProductComponentPart;
  frameColor?: ProductComponentPart;
  background?: ProductComponentPart;
  characters?: ProductComponentPart[];
  accessories?: ProductComponentPart[];
  parts?: ProductComponentPart[];
  includedItems?: ProductIncludedItem[];
  originalPrice?: PriceInVND;
  frameSizeIds?: ID[];
  recommendedFrameSizeId?: ID;
  requiresNote?: boolean;
  customizableFields?: ProductCustomizableField[];
};

export type ProductCompositionSummary = {
  frame: Nullable<ProductComponentPart>;
  frameColor: Nullable<ProductComponentPart>;
  background: Nullable<ProductComponentPart>;
  characters: ProductComponentPart[];
  accessories: ProductComponentPart[];
  includedItems: ProductIncludedItem[];
  characterCount: number;
  accessoryCount: number;
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
  originalPrice?: Nullable<PriceInVND>;
  orderCount?: number;
  characterCount?: number;
  accessoryCount?: number;
  charmCount?: number;
  includedItemLabels?: string[];
  composition?: ProductCompositionSummary;
};

export type PublicProductsSort =
  "featured" | "newest" | "popular" | "price_asc" | "price_desc" | "name_asc";

export type PublicProductsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  collection?: string;
  collections?: string[];
  collectionIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  characterCount?: number;
  characterCounts?: number[];
  charmCount?: number;
  charmCounts?: number[];
  statuses?: ProductStatus[];
  sort?: PublicProductsSort;
  type?: string;
  featured?: boolean;
  isNew?: boolean;
  includedGift?: boolean;
  frameSize?: string;
};

export type PublicProductsMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PublicProductsResponse = {
  items: Product[];
  meta: PublicProductsMeta;
};

export type ProductSummary = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "basePrice"
  | "images"
  | "productType"
  | "componentConfig"
  | "status"
  | "featured"
  | "collectionId"
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
  slug: Nullable<string>;
  price: PriceInVND;
  imageUrl: Nullable<URLString>;
  iconUrl: Nullable<URLString>;
  sortOrder: number;
  naturalWidth: Nullable<number>;
  naturalHeight: Nullable<number>;
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

export type CharacterPart = Timestamped & {
  id: ID;
  name: string;
  type: CharacterPartType;
  imageUrl: URLString;
  priceAdjustment: PriceInVND;
  sortOrder: number;
  tags: Nullable<JsonValue>;
  status: ProductStatus;
};

export type Banner = Timestamped & {
  id: ID;
  title: Nullable<string>;
  imageUrl: URLString;
  linkUrl: Nullable<URLString>;
  sortOrder: number;
  naturalWidth: Nullable<number>;
  naturalHeight: Nullable<number>;
  status: ProductStatus;
};

export type HomepageMedia = {
  id: ID;
  sourceKey: string;
  imageUrl: URLString;
  thumbnailUrl: Nullable<URLString>;
  naturalWidth: number;
  naturalHeight: number;
  sortOrder: number;
};

export type FrameBackground = Timestamped & {
  id: ID;
  title: string;
  slug: Nullable<string>;
  category: Nullable<string>;
  description: Nullable<string>;
  instructions: Nullable<string>;
  imageUrl: URLString;
  thumbnailUrl: Nullable<URLString>;
  naturalWidth: Nullable<number>;
  naturalHeight: Nullable<number>;
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

export type CharacterPreset = Timestamped & {
  id: ID;
  name: string;
  description: Nullable<string>;
  faceHint: Nullable<string>;
  hairHint: Nullable<string>;
  torsoHint: Nullable<string>;
  legsHint: Nullable<string>;
  hatHint: Nullable<string>;
  sortOrder: number;
  status: ProductStatus;
};

export type ProductTemplateFrameSize = {
  id: ID;
  label: string;
  price: PriceInVND;
  priceAdjustment: PriceInVND;
  recommended: boolean;
};

export type ProductTemplateCharacter = {
  id: ID;
  name: string;
  price: PriceInVND;
  imageUrl: Nullable<URLString>;
  quantity: number;
};

export type ProductTemplateAccessory = {
  id: ID;
  name: string;
  price: PriceInVND;
  originalPrice: Nullable<PriceInVND>;
  imageUrl: Nullable<URLString>;
  iconUrl: Nullable<URLString>;
  quantity: number;
  maxQuantity: number;
  colorVariants: Array<{
    name: string;
    colorHex: string;
  }>;
};

export type ProductIncludedItem = {
  id: string;
  name: string;
  quantity: number;
  icon: "gift" | "package" | "sparkles";
};

export type ProductCustomizableField = {
  key: string;
  label: string;
  required: boolean;
};

export type ProductPricingSummary = {
  basePrice: PriceInVND;
  originalPrice: Nullable<PriceInVND>;
  minimumPrice: PriceInVND;
};

export type ProductDetail = Product & {
  requiresNote: boolean;
  frameSizes: ProductTemplateFrameSize[];
  recommendedFrameSizeId: Nullable<ID>;
  characters: ProductTemplateCharacter[];
  accessories: ProductTemplateAccessory[];
  availableAccessories: ProductTemplateAccessory[];
  includedItems: ProductIncludedItem[];
  customizableFields: ProductCustomizableField[];
  pricing: ProductPricingSummary;
};
