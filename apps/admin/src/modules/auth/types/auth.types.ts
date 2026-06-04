import type { AdminProfile } from '@/modules/admin/types/admin.types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  admin: AdminProfile;
};
