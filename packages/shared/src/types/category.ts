import type { ID, Nullable, Timestamped, URLString } from './common';
import type { ProductStatus } from '../constants/status';

export type TemplateCategory = Timestamped & {
  id: ID;
  name: string;
  slug: string;
  _count?: {
    templates: number;
  };
};

export type AccessoryCategory = Timestamped & {
  id: ID;
  name: string;
  slug: string;
  _count?: {
    accessories: number;
  };
};

export type Collection = Timestamped & {
  id: ID;
  name: string;
  slug: string;
  description: Nullable<string>;
  imageUrl: Nullable<URLString>;
  sortOrder: number;
  naturalWidth: Nullable<number>;
  naturalHeight: Nullable<number>;
  status: ProductStatus;
};
