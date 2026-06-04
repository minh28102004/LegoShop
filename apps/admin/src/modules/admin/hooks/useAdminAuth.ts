'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { me } from '@/modules/admin/services/adminApi';
import type { AdminProfile } from '@/modules/admin/types/admin.types';
import {
  clearAccessToken,
  getAccessToken,
} from '@/modules/auth/services/authStorage';

export function useAdminAuth() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(ADMIN_ROUTES.login);
      return;
    }

    me()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        clearAccessToken();
        router.replace(ADMIN_ROUTES.login);
      });
  }, [router]);

  function logout() {
    clearAccessToken();
    router.replace(ADMIN_ROUTES.login);
  }

  return {
    profile,
    loading,
    logout,
  };
}
