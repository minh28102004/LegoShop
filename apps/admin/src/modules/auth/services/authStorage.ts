import { STORAGE_KEYS } from '@/common/constants/storage-keys';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.adminAccessToken);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.adminAccessToken, token);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.adminAccessToken);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
