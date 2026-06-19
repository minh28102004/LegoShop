import type {
  AdminLoginResponseContract,
  AdminProfile,
  LoginRequestContract,
  PublicUser,
  RegisterRequestContract,
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
