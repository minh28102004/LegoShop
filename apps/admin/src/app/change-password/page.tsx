'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/common/components/ui/LoadingSpinner';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { cn } from '@/common/utils/cn';
import { useI18n } from '@/lib/i18n/useI18n';
import { changeAdminPassword } from '@/modules/admin/services/adminApi';
import { clearAccessToken, getAccessToken } from '@/modules/auth/services/authStorage';

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type StrengthLevel = 'veryWeak' | 'weak' | 'medium' | 'strong' | 'veryStrong';

function strengthLabel(pw: string): {
  pct: number;
  level: StrengthLevel;
} {
  if (!pw) return { pct: 0, level: 'veryWeak' };

  let score = 0;

  if (pw.length >= 6) score += 15;
  if (pw.length >= 8) score += 15;
  if (pw.length >= 10) score += 15;
  if (pw.length >= 14) score += 10;
  if (/[a-z]/.test(pw)) score += 10;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  if (/^(.)\1+$/.test(pw)) score = Math.min(score, 20);
  if (/^(123456|12345678|password|qwerty)$/i.test(pw)) score = 5;

  const pct = Math.max(0, Math.min(100, score));

  if (pct >= 85) return { pct, level: 'veryStrong' };
  if (pct >= 70) return { pct, level: 'strong' };
  if (pct >= 45) return { pct, level: 'medium' };
  if (pct >= 25) return { pct, level: 'weak' };
  return { pct, level: 'veryWeak' };
}

function StrengthMeter({ pw }: { pw: string }) {
  const { t } = useI18n();
  const strength = useMemo(() => strengthLabel(pw), [pw]);
  const label = pw ? t(`account.${strength.level}`) : t('account.notEntered');

  const cfg = useMemo(() => {
    switch (strength.level) {
      case 'veryStrong':
        return {
          pill: 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)] ring-1 ring-[var(--admin-primary-tint)]',
          bar: 'from-[var(--admin-primary-strong)] via-[var(--admin-primary)] to-sky-300',
          dot: 'bg-[var(--admin-primary-strong)]',
        };
      case 'strong':
        return {
          pill: 'bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)] ring-1 ring-[var(--admin-primary-tint)]',
          bar: 'from-[var(--admin-primary-strong)] to-[var(--admin-primary)]',
          dot: 'bg-[var(--admin-primary-strong)]',
        };
      case 'medium':
        return {
          pill: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
          bar: 'from-amber-500 to-yellow-400',
          dot: 'bg-amber-500',
        };
      case 'weak':
        return {
          pill: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
          bar: 'from-orange-500 to-amber-400',
          dot: 'bg-orange-500',
        };
      default:
        return {
          pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
          bar: 'from-rose-500 to-orange-400',
          dot: 'bg-rose-500',
        };
    }
  }, [strength.level]);

  const activeSegment = useMemo(() => {
    if (strength.pct >= 85) return 5;
    if (strength.pct >= 70) return 4;
    if (strength.pct >= 45) return 3;
    if (strength.pct >= 25) return 2;
    return 1;
  }, [strength.pct]);

  return (
    <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-sm font-semibold text-slate-700'>
            {t('account.passwordStrength')}
          </span>
          <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', cfg.pill)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {label}
          </span>
        </div>
        <div className='text-xs font-semibold text-slate-500'>{strength.pct}%</div>
      </div>

      <div className='mt-3 grid grid-cols-5 gap-1.5'>
        {Array.from({ length: 5 }).map((_, index) => {
          const segment = index + 1;
          const active = pw && segment <= activeSegment;

          return (
            <div
              key={segment}
              className={cn('h-2 rounded-full transition', active ? 'bg-slate-900/10' : 'bg-slate-200')}
            >
              {active ? (
                <div className={cn('h-full w-full rounded-full bg-gradient-to-r', cfg.bar)} />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200'>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-300', cfg.bar)}
          style={{ width: `${pw ? strength.pct : 0}%` }}
        />
      </div>
    </div>
  );
}

function PasswordHints({ pw }: { pw: string }) {
  const { t } = useI18n();
  const rules = useMemo(
    () => [
      { ok: pw.length >= 8, text: t('account.minEightChars') },
      { ok: /[A-Z]/.test(pw), text: t('account.hasUppercase') },
      { ok: /[a-z]/.test(pw), text: t('account.hasLowercase') },
      { ok: /[0-9]/.test(pw), text: t('account.hasNumber') },
      { ok: /[^A-Za-z0-9]/.test(pw), text: t('account.hasSpecial') },
    ],
    [pw, t],
  );

  return (
    <div className='rounded-2xl border border-slate-200 bg-white px-4 py-3'>
      <div className='text-sm font-semibold text-slate-800'>{t('account.passwordHintsTitle')}</div>
      <div className='mt-2 grid gap-2 sm:grid-cols-2'>
        {rules.map((rule) => (
          <div key={rule.text} className='flex items-center gap-2'>
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full ring-1',
                rule.ok ? 'bg-[var(--admin-primary-strong)] ring-[var(--admin-primary-tint)]' : 'bg-slate-300 ring-slate-200',
              )}
            />
            <span className={cn('text-xs font-semibold', rule.ok ? 'text-[var(--admin-primary-strong)]' : 'text-red-600')}>
              {rule.text}
            </span>
          </div>
        ))}
      </div>
      <div className='mt-3 text-xs text-slate-500'>
        {t('account.passwordExample')}{' '}
        <span className='font-semibold text-slate-700'>FigureLab@2026!</span>{' '}
        ({t('account.passwordExampleNote')})
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  leftIcon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  return (
    <div className='space-y-2'>
      <label className='text-sm font-semibold text-slate-700'>{label}</label>
      <div
        className={cn(
          'relative rounded-2xl border bg-white transition-colors',
          'hover:border-[var(--admin-primary-tint)]',
          'focus-within:border-[var(--admin-primary)] focus-within:ring-1 focus-within:ring-[var(--admin-primary-ring)]',
          error
            ? 'border-rose-300 hover:border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100'
            : 'border-slate-200',
          disabled ? 'bg-slate-50 opacity-80' : '',
        )}
      >
        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
          {leftIcon}
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className='h-11 w-full rounded-2xl bg-transparent pl-10 pr-12 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500'
        />
        <button
          type='button'
          onClick={() => setShow((current) => !current)}
          disabled={disabled}
          className='absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-60'
          aria-label={show ? t('account.hidePassword') : t('account.showPassword')}
        >
          {show ? <EyeOff className='h-[18px] w-[18px]' /> : <Eye className='h-[18px] w-[18px]' />}
        </button>
      </div>
      {error ? <div className='text-xs font-semibold text-rose-600'>{error}</div> : null}
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(ADMIN_ROUTES.login);
    }
  }, [router]);

  function validate() {
    const next: FieldErrors = {};

    if (!currentPassword.trim()) {
      next.currentPassword = t('account.currentPasswordRequired');
    }

    if (!newPassword.trim()) {
      next.newPassword = t('account.newPasswordRequired');
    } else if (newPassword.trim().length < 6) {
      next.newPassword = t('account.newPasswordMinLength');
    } else if (newPassword.trim() === currentPassword.trim()) {
      next.newPassword = t('account.newPasswordDifferent');
    }

    if (!confirmPassword.trim()) {
      next.confirmPassword = t('account.confirmPasswordRequired');
    } else if (confirmPassword.trim() !== newPassword.trim()) {
      next.confirmPassword = t('account.confirmPasswordMismatch');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);

    try {
      const result = await changeAdminPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      toast.success(result.message || t('account.changePasswordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});

      window.setTimeout(() => {
        clearAccessToken();
        router.replace(ADMIN_ROUTES.login);
      }, 650);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('account.changePasswordFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='admin-scrollbar min-h-screen overflow-y-auto bg-[#F6F8FC]'>
      <header className='sticky top-0 z-30 border-b border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]'>
        <div className='mx-auto flex max-w-3xl items-center gap-3 px-4 py-3'>
          <button
            type='button'
            onClick={() => router.back()}
            className='grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary-strong)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]'
            aria-label={t('common.previous')}
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
          <div className='min-w-0'>
            <div className='text-sm font-semibold text-slate-800'>{t('account.changePasswordTitle')}</div>
            <div className='text-xs text-slate-500'>{t('account.changePasswordSubtitle')}</div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'
        >
          <div className='bg-[linear-gradient(135deg,var(--admin-primary-strong),var(--admin-primary))] px-6 py-6 text-white'>
            <div className='flex items-start gap-4'>
              <div className='grid h-12 w-12 place-items-center rounded-2xl bg-white/15'>
                <ShieldCheck className='h-6 w-6' />
              </div>
              <div className='min-w-0'>
                <div className='text-xl font-semibold tracking-tight'>{t('account.updatePassword')}</div>
                <div className='text-sm text-white/85'>{t('account.updatePasswordDescription')}</div>
              </div>
            </div>
          </div>

          <div className='px-6 py-6'>
            <div className='grid gap-5'>
              <PasswordInput
                label={t('account.currentPassword')}
                value={currentPassword}
                onChange={(value) => {
                  setCurrentPassword(value);
                  if (errors.currentPassword) {
                    setErrors((current) => ({ ...current, currentPassword: undefined }));
                  }
                }}
                placeholder={t('account.currentPasswordPlaceholder')}
                disabled={loading}
                error={errors.currentPassword}
                leftIcon={<Lock className='h-4 w-4' />}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <PasswordInput
                  label={t('account.newPassword')}
                  value={newPassword}
                  onChange={(value) => {
                    setNewPassword(value);
                    if (errors.newPassword) {
                      setErrors((current) => ({ ...current, newPassword: undefined }));
                    }
                  }}
                  placeholder={t('account.newPasswordPlaceholder')}
                  disabled={loading}
                  error={errors.newPassword}
                  leftIcon={<KeyRound className='h-4 w-4' />}
                />

                <PasswordInput
                  label={t('account.confirmPassword')}
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword) {
                      setErrors((current) => ({ ...current, confirmPassword: undefined }));
                    }
                  }}
                  placeholder={t('account.confirmPasswordPlaceholder')}
                  disabled={loading}
                  error={errors.confirmPassword}
                  leftIcon={<KeyRound className='h-4 w-4' />}
                />
              </div>

              <StrengthMeter pw={newPassword} />
              <PasswordHints pw={newPassword} />
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4'>
            <button
              type='button'
              onClick={() => router.back()}
              disabled={loading}
              className='rounded-xl border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:scale-[1.05] hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {t('account.cancel')}
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={loading}
              className='inline-flex items-center gap-2 rounded-xl bg-[var(--admin-primary-strong)] px-6 py-2 font-semibold text-white transition hover:scale-[1.02] hover:bg-[#1F6FB0] active:scale-[0.98] active:bg-[#185C94] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading ? (
                <>
                  <LoadingSpinner size='sm' label={t('account.changingPassword')} className='border-white/30 border-t-white' />
                  {t('account.changingPassword')}
                </>
              ) : (
                t('account.changePasswordTitle')
              )}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
