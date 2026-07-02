'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Mail, Pencil, Shield, User2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/common/components/ui/Button';
import Input from '@/common/components/ui/Input';
import LoadingSpinner from '@/common/components/ui/LoadingSpinner';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/common/components/ui/Modal';
import { ADMIN_ROUTES } from '@/common/constants/routes';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminAvatar from '@/modules/admin/components/AdminAvatar';
import { me, updateAdminProfile } from '@/modules/admin/services/adminApi';
import type { AdminProfile } from '@/modules/admin/types/admin.types';
import { getAccessToken } from '@/modules/auth/services/authStorage';

function toRoleLabel(role?: string | null) {
  const normalizedRole = (role ?? '').toUpperCase();
  if (normalizedRole.includes('ADMIN')) return 'Quản trị viên';
  if (normalizedRole.includes('STAFF')) return 'Nhân viên';
  if (normalizedRole.includes('HOST')) return 'Host';
  return role || '-';
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4'>
      <div className='grid h-10 w-10 place-items-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)] ring-1 ring-[var(--admin-primary-tint)]'>
        <Icon className='h-5 w-5' />
      </div>
      <div className='min-w-0'>
        <div className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
          {label}
        </div>
        <div className='mt-0.5 break-all text-sm font-semibold text-slate-800'>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function AccountProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const roleLabel = useMemo(() => toRoleLabel(profile?.role), [profile?.role]);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!getAccessToken()) {
        router.replace(ADMIN_ROUTES.login);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const data = await me();
        if (!mounted) return;
        setProfile(data);
        setName(data.name ?? '');
      } catch {
        if (!mounted) return;
        setError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSave() {
    setSaving(true);

    try {
      const updated = await updateAdminProfile({ name: name.trim() || null });
      setProfile(updated);
      setName(updated.name ?? '');
      setModalOpen(false);
      toast.success(t('account.updateProfileSuccess'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('account.updateProfileFailed');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='admin-scrollbar min-h-screen overflow-y-auto bg-[#F6F8FC]'>
      <header className='sticky top-0 z-30 border-b border-slate-100 bg-white'>
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
            <div className='text-sm font-semibold text-slate-800'>{t('account.profileTitle')}</div>
            <div className='text-xs text-slate-500'>{t('account.profileSubtitle')}</div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-4 py-6'>
        {loading ? (
          <div className='rounded-3xl border border-slate-200 bg-white p-10 shadow-sm'>
            <div className='flex items-center justify-center gap-3 text-slate-700'>
              <LoadingSpinner size='md' label={t('account.loadingProfile')} />
              <span className='text-sm font-semibold'>{t('account.loadingProfile')}</span>
            </div>
          </div>
        ) : error ? (
          <div className='rounded-3xl border border-rose-200 bg-white p-8 shadow-sm'>
            <div className='font-semibold text-rose-700'>{t('account.loadProfileFailed')}</div>
            <div className='mt-1 text-sm text-slate-500'>{t('entity.loadFailed')}</div>
          </div>
        ) : profile ? (
          <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
            <div className='bg-white px-6 py-8 md:px-10 md:py-10'>
              <div className='flex flex-col items-center text-center'>
                <div className='relative'>
                  <AdminAvatar
                    name={profile.name}
                    email={profile.email}
                    size={112}
                    ringClassName='ring-2 ring-[var(--admin-primary-tint)]'
                    className='bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)]'
                  />

                  <button
                    type='button'
                    onClick={() => setModalOpen(true)}
                    className='absolute -bottom-0.5 -right-0.5 grid h-9 w-9 place-items-center rounded-full bg-[var(--admin-primary-strong)] text-white shadow-lg transition hover:bg-[#1F6FB0] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--admin-primary-ring)]'
                    aria-label={t('account.updateProfile')}
                  >
                    <Pencil className='h-5 w-5' />
                  </button>
                </div>

                <h1 className='mt-4 text-2xl font-semibold tracking-tight text-slate-900'>
                  {profile.name || profile.email}
                </h1>

                <div className='mt-2 flex flex-wrap items-center justify-center gap-2'>
                  <span className='inline-flex items-center rounded-full bg-[var(--admin-primary-soft)] px-4 py-1 text-sm font-semibold text-[var(--admin-primary-strong)] ring-1 ring-[var(--admin-primary-tint)]'>
                    {roleLabel}
                  </span>
                  <span className='inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200'>
                    <span className='h-2 w-2 rounded-full bg-[var(--admin-primary-strong)]' />
                    {t('account.active')}
                  </span>
                </div>

                <Button
                  type='button'
                  onClick={() => setModalOpen(true)}
                  loading={saving}
                  className='mt-5 rounded-2xl bg-[var(--admin-primary-strong)] px-7 py-3 text-sm hover:bg-[#1F6FB0]'
                >
                  {saving ? t('account.updatingProfile') : t('account.updateProfile')}
                </Button>
              </div>
            </div>

            <div className='h-px bg-slate-100' />

            <div className='bg-slate-50/40 px-6 py-6 md:px-10 md:py-8'>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <InfoRow icon={Mail} label='Email' value={profile.email} />
                <InfoRow icon={User2} label={t('account.fullName')} value={profile.name ?? '-'} />
                <InfoRow icon={Shield} label={t('account.roleStatus')} value={`${roleLabel} • ${t('account.active')}`} />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        panelClassName='max-w-lg rounded-3xl'
        ariaLabelledby='account-profile-modal-title'
      >
        <ModalHeader>
          <div>
            <h2 id='account-profile-modal-title' className='text-lg font-semibold text-slate-900'>
              {t('account.updateProfile')}
            </h2>
            <p className='mt-1 text-sm text-slate-500'>{t('account.profileSubtitle')}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          <label className='block'>
            <span className='admin-label mb-2'>{t('account.fullName')}</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Lego Shop Admin'
              size='lg'
            />
          </label>
        </ModalBody>
        <ModalFooter>
          <Button
            type='button'
            variant='secondary'
            onClick={() => setModalOpen(false)}
            disabled={saving}
          >
            {t('account.cancel')}
          </Button>
          <Button type='button' onClick={handleSave} loading={saving}>
            {saving ? t('account.updatingProfile') : t('account.updateProfile')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
