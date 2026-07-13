import type { JsonObject, URLString } from '../types/common';
import type { AdminProfile, PublicUser, UserDesign } from '../types/user';

export type PublicUserContract = PublicUser;
export type AdminProfileContract = AdminProfile;
export type UserDesignContract = UserDesign;

export type UpdateUserProfileRequestContract = {
  name?: string;
  phone?: string;
};

export type CreateUserDesignRequestContract = {
  name?: string;
  designData: JsonObject;
  previewUrl?: URLString;
};
