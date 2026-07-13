import { adminApiClient } from '@/lib/api/admin-client';
import type { LoginPayload, LoginResponse } from '@/modules/auth/types/auth.types';

export async function login(payload: LoginPayload) {
  return adminApiClient.auth.adminLogin(payload) as Promise<LoginResponse>;
}
