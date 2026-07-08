import type { CreateUserDesignRequestContract, UserDesignContract } from '@lego-shop/shared';
import type { ApiRequester } from '../client';

export function createUserDesignsApi(request: ApiRequester) {
  return {
    createUserDesign(payload: CreateUserDesignRequestContract): Promise<UserDesignContract> {
      return request('user-designs', {
        auth: true,
        method: 'POST',
        body: payload,
      });
    },
  };
}
