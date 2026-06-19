import type { ID, ISODateString, JsonObject, Nullable, Timestamped, URLString } from './common';
import type { UserRole } from '../constants/roles';

export type PublicUser = {
  id: ID;
  email: string;
  name: Nullable<string>;
  phone?: Nullable<string>;
  createdAt?: ISODateString;
};

export type AdminProfile = {
  id: ID;
  email: string;
  name: Nullable<string>;
  role: UserRole | string;
};

export type User = PublicUser & Timestamped;

export type UserDesign = Timestamped & {
  id: ID;
  userId: ID;
  name: string;
  designData: JsonObject;
  previewUrl: Nullable<URLString>;
};
