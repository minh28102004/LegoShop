import { ForbiddenException } from '@nestjs/common';
import { assertAdminRoleForPath, isAdminApiPath } from './jwt-auth.guard';

describe('admin route authorization', () => {
  it('recognizes admin catalog and dashboard paths behind the API prefix', () => {
    expect(isAdminApiPath('/api/admin/orders?page=1')).toBe(true);
    expect(isAdminApiPath('/admin-dashboard/stats')).toBe(true);
    expect(isAdminApiPath('/public/orders')).toBe(false);
  });

  it('rejects a regular user from an admin endpoint', () => {
    expect(() => assertAdminRoleForPath('/api/admin/vouchers', 'user')).toThrow(
      ForbiddenException,
    );
  });

  it('allows an administrator and leaves customer routes unchanged', () => {
    expect(() => assertAdminRoleForPath('/admin/orders', 'admin')).not.toThrow();
    expect(() => assertAdminRoleForPath('/users/me', 'user')).not.toThrow();
  });
});
