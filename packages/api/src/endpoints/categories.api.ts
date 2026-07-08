import type { AccessoryCategory, TemplateCategory } from '@lego-shop/shared';
import type { ApiRequester, QueryParams } from '../client';

export function createCategoriesApi(request: ApiRequester) {
  return {
    listTemplateCategories(query?: QueryParams): Promise<TemplateCategory[]> {
      return request('public/template-categories', { query });
    },

    listAccessoryCategories(query?: QueryParams): Promise<AccessoryCategory[]> {
      return request('public/accessory-categories', { query });
    },
  };
}
