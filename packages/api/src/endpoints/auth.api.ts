import type {
  AdminLoginResponseContract,
  AdminProfile,
  ChangeAdminPasswordRequestContract,
  ChangeAdminPasswordResponseContract,
  LoginRequestContract,
  PublicUser,
  RegisterRequestContract,
  UpdateAdminProfileRequestContract,
  UserLoginResponseContract,
  UserRegisterResponseContract,
} from '@lego-shop/shared';
import type { ApiRequester } from '../client';

export function createAuthApi(request: ApiRequester) {
  return {
    adminLogin(payload: LoginRequestContract): Promise<AdminLoginResponseContract> {
      return request('auth/login', {
        method: 'POST',
        body: payload,
      });
    },

    adminMe(): Promise<AdminProfile> {
      return request('auth/me', {
        auth: true,
      });
    },

    updateAdminProfile(payload: UpdateAdminProfileRequestContract): Promise<AdminProfile> {
      return request('auth/profile', {
        method: 'PATCH',
        auth: true,
        body: payload,
      });
    },

    changeAdminPassword(
      payload: ChangeAdminPasswordRequestContract,
    ): Promise<ChangeAdminPasswordResponseContract> {
      return request('auth/change-password', {
        method: 'POST',
        auth: true,
        body: payload,
      });
    },

    userLogin(payload: LoginRequestContract): Promise<UserLoginResponseContract> {
      return request('users/login', {
        method: 'POST',
        body: payload,
      });
    },

    userRegister(payload: RegisterRequestContract): Promise<UserRegisterResponseContract> {
      return request('users/register', {
        method: 'POST',
        body: payload,
      });
    },

    userMe(): Promise<PublicUser> {
      return request('users/me', {
        auth: true,
      });
    },
  };
}
