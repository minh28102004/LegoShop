import { createApiClient } from '@lego-shop/api';
import { getAccessToken } from '@/modules/auth/services/authStorage';
import { getApiBaseUrl } from './base-url';

export const adminApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  getAccessToken: () => getAccessToken() ?? undefined,
});
