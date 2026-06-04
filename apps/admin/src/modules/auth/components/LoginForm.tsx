'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import LanguageSwitcher from '@/modules/admin/components/LanguageSwitcher';
import { login } from '@/modules/auth/services/authApi';
import { setAccessToken } from '@/modules/auth/services/authStorage';
import { useI18n } from '@/lib/i18n/useI18n';

export default function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({ email, password });
      setAccessToken(response.accessToken);
      router.replace(ADMIN_ROUTES.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='grid min-h-screen place-items-center bg-slate-50 px-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.18)]'
      >
        <div className='flex justify-end'>
          <LanguageSwitcher />
        </div>

        <div className='mt-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700'>
          Lego Shop
        </div>
        <h1 className='mt-4 text-3xl font-semibold text-slate-900'>{t('auth.loginTitle')}</h1>
        <p className='mt-2 text-sm leading-6 text-slate-600'>{t('auth.loginSubtitle')}</p>

        <div className='mt-6 space-y-4'>
          <label className='block text-sm'>
            <span className='mb-1 block font-medium text-slate-700'>{t('common.email')}</span>
            <Input
              required
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className='block text-sm'>
            <span className='mb-1 block font-medium text-slate-700'>{t('common.password')}</span>
            <Input
              required
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        {error ? (
          <p className='mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {error}
          </p>
        ) : null}

        <Button type='submit' disabled={loading} className='mt-6 w-full rounded-xl py-2.5'>
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
    </main>
  );
}
