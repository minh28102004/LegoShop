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

export type UserAuthResponse = {
  accessToken: string;
  user: PublicUser;
};
