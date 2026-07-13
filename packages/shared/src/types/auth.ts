import type { AdminProfile, PublicUser } from './user';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name?: string;
  phone?: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  admin: AdminProfile;
};

export type UpdateAdminProfilePayload = {
  name?: string | null;
};

export type ChangeAdminPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeAdminPasswordResponse = {
  success: boolean;
  message: string;
};

export type UserAuthResponse = {
  accessToken: string;
  user: PublicUser;
};
