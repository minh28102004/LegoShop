import type { ProductStatus } from '../constants/status';
import type { URLString } from '../types/common';
import type { AccessoryCategory, Collection, TemplateCategory } from '../types/category';

export type TemplateCategoryContract = TemplateCategory;
export type AccessoryCategoryContract = AccessoryCategory;
export type CollectionContract = Collection;

export type CreateCategoryRequestContract = {
  name: string;
  slug?: string;
};

export type UpdateCategoryRequestContract = Partial<CreateCategoryRequestContract>;

export type CreateCollectionRequestContract = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: URLString;
  status?: ProductStatus;
};

export type UpdateCollectionRequestContract = Partial<CreateCollectionRequestContract>;
