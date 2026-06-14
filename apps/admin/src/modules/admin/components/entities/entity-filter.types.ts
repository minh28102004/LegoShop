export type EntityFilterOption = {
  label: string;
  value: string;
};

export type EntitySortDirection = 'asc' | 'desc';

export type EntityFilterDraft = {
  status: string[];
  category: string[];
  priceMin: string;
  priceMax: string;
  sortDir: EntitySortDirection;
};

export const EMPTY_ENTITY_FILTER_DRAFT: EntityFilterDraft = {
  status: [],
  category: [],
  priceMin: '',
  priceMax: '',
  sortDir: 'desc',
};
