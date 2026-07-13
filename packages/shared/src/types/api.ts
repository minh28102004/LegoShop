import type { ISODateString } from './common';

export type SortOrder = 'asc' | 'desc';

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export type ListQuery = PaginationQuery & {
  search?: string;
  search_fields?: string;
  sort_by?: string;
  sort_dir?: SortOrder | string;
  date_from?: string;
  date_to?: string;
  date_field?: string;
  preset?: string;
  status?: string | string[];
  category_id?: string | string[];
  price_min?: number;
  price_max?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  total_pages?: number;
  sort_by?: string;
  sort_dir?: string;
  filters_applied?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  data: T;
  success?: boolean;
  message?: string;
  timestamp?: ISODateString;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  field?: string;
  details?: unknown;
  errors?: ApiError[];
  timestamp?: ISODateString;
};
