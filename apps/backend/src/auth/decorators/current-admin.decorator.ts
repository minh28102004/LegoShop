import type { AdminProfileContract } from '@lego-shop/shared';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type AuthenticatedAdminRequest = {
  user: AdminProfileContract;
};

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedAdminRequest>();
    return request.user;
  },
);
