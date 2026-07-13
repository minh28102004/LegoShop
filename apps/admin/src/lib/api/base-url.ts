import { env } from '@/config/env';

export function getApiBaseUrl(): string {
  return env.apiUrl;
}
