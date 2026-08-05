import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { USER_ROLE } from '@lego-shop/shared';
import { firstValueFrom, isObservable } from 'rxjs';

export function isAdminApiPath(url: string) {
  const pathname = url.split('?')[0].replace(/^\/api(?=\/)/, '');
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/admin-dashboard/')
  );
}

export function assertAdminRoleForPath(url: string, role?: string) {
  if (isAdminApiPath(url) && role !== USER_ROLE.ADMIN) {
    throw new ForbiddenException({
      code: 'ADMIN_ROLE_REQUIRED',
      message: 'Administrator role is required',
    });
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = super.canActivate(context);
    const authenticated = isObservable(result)
      ? await firstValueFrom(result)
      : await result;

    if (!authenticated) return false;

    const request = context.switchToHttp().getRequest<{
      originalUrl?: string;
      url?: string;
      user?: { role?: string };
    }>();
    assertAdminRoleForPath(
      request.originalUrl ?? request.url ?? '',
      request.user?.role,
    );

    return true;
  }
}
