import type {
  Accessory,
  Character,
  CharacterPart,
  CharacterPreset,
  Collection,
  FrameBackground,
  FrameColor,
  FrameOption,
  FrameOptionType,
  FrameSize,
  Product,
  ProductDetail,
  PublicProductsQuery,
  PublicProductsResponse,
  Template,
} from "@lego-shop/shared";
import type { ApiRequester, ApiRequestOptions, QueryParams } from "../client";

export type FrameOptionsQuery = QueryParams & {
  type?: FrameOptionType;
};

export type AccessoriesQuery = QueryParams & {
  categoryId?: string;
};

export type FrameBackgroundsQuery = QueryParams & {
  category?: string;
  frameOptionId?: string;
};

type ProductCatalogRequestOptions = Pick<ApiRequestOptions, "signal">;

export function createProductsApi(request: ApiRequester) {
  return {
    listProducts(query?: QueryParams): Promise<Product[]> {
      return request("public/products", { query });
    },

    listProductCatalog(
      query?: PublicProductsQuery,
      options?: ProductCatalogRequestOptions,
    ): Promise<PublicProductsResponse> {
      return request("public/products", { ...options, query });
    },

    getProductBySlug(slug: string): Promise<ProductDetail> {
      return request(`public/products/${encodeURIComponent(slug)}`);
    },

    listTemplates(query?: QueryParams): Promise<Template[]> {
      return request("public/templates", { query });
    },

    getTemplateById(id: string): Promise<Template> {
      return request(`public/templates/${encodeURIComponent(id)}`);
    },

    listAccessories(query?: AccessoriesQuery): Promise<Accessory[]> {
      return request("public/accessories", { query });
    },

    getAccessoryById(id: string): Promise<Accessory> {
      return request(`public/accessories/${encodeURIComponent(id)}`);
    },

    listCharacters(query?: QueryParams): Promise<Character[]> {
      return request("public/characters", { query });
    },

    getCharacterById(id: string): Promise<Character> {
      return request(`public/characters/${encodeURIComponent(id)}`);
    },

    listCharacterParts(query?: QueryParams): Promise<CharacterPart[]> {
      return request("public/character-parts", { query });
    },

    listCharacterPresets(query?: QueryParams): Promise<CharacterPreset[]> {
      return request("public/character-presets", { query });
    },

    listCollections(query?: QueryParams): Promise<Collection[]> {
      return request("public/collections", { query });
    },

    getCollectionBySlug(slug: string): Promise<Collection> {
      return request(`public/collections/${encodeURIComponent(slug)}`);
    },

    listFrameOptions(query?: FrameOptionsQuery): Promise<FrameOption[]> {
      return request("public/frame-options", { query });
    },

    listFrameSizes(query?: QueryParams): Promise<FrameSize[]> {
      return request("public/frame-sizes", { query });
    },

    listFrameColors(query?: QueryParams): Promise<FrameColor[]> {
      return request("public/frame-colors", { query });
    },

    listFrameBackgrounds(
      query?: FrameBackgroundsQuery,
    ): Promise<FrameBackground[]> {
      return request("public/frame-backgrounds", { query });
    },
  };
}
