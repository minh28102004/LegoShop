import { apiRequest } from '@/lib/api';
import type { LoginPayload, LoginResponse } from '@/modules/auth/types/auth.types';

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}
