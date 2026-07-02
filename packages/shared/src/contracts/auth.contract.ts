import type {
  AdminLoginResponse,
  ChangeAdminPasswordPayload,
  ChangeAdminPasswordResponse,
  LoginPayload,
  RegisterPayload,
  UpdateAdminProfilePayload,
  UserAuthResponse,
} from '../types/auth';

export type LoginRequestContract = LoginPayload;
export type RegisterRequestContract = RegisterPayload;
export type AdminLoginResponseContract = AdminLoginResponse;
export type UpdateAdminProfileRequestContract = UpdateAdminProfilePayload;
export type ChangeAdminPasswordRequestContract = ChangeAdminPasswordPayload;
export type ChangeAdminPasswordResponseContract = ChangeAdminPasswordResponse;
export type UserLoginResponseContract = UserAuthResponse;
export type UserRegisterResponseContract = UserAuthResponse;
