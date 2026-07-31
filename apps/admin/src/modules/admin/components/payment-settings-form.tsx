'use client';

import { FormEvent, useEffect, useState } from 'react';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Checkbox from '@/common/components/ui/Checkbox';
import Input from '@/common/components/ui/Input';
import LoadingState from '@/common/components/ui/LoadingState';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import { getLocalizedApiError } from '@/lib/i18n/errors';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import { getPaymentSettings, updatePaymentSettings } from '@/modules/admin/services/adminApi';
import type { PaymentSettings } from '@/modules/admin/types/admin.types';

export default function PaymentSettingsForm() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setSettings(await getPaymentSettings());
      } catch (loadError) {
        setError(getLocalizedApiError(loadError, t, 'paymentSettings.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload: Partial<PaymentSettings> = {
        codEnabled: settings.codEnabled,
        payosEnabled: settings.payosEnabled,
        codDepositEnabled: settings.codDepositEnabled,
        codDepositPercent: settings.codDepositEnabled
          ? Math.max(0, Math.min(100, Number(settings.codDepositPercent || 0)))
          : 0,
      };
      setSettings(await updatePaymentSettings(payload));
      setMessage(t('paymentSettings.updateSuccess'));
    } catch (submitError) {
      setError(getLocalizedApiError(submitError, t, 'paymentSettings.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState text={t('paymentSettings.loading')} />;

  if (error || !settings) {
    return (
      <Card className='border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? t('paymentSettings.unavailable')}
      </Card>
    );
  }

  return (
    <PageShell>
      <Card className='overflow-hidden p-0'>
        <form onSubmit={handleSubmit}>
          <div className='border-b border-slate-200 px-4 py-5 sm:px-6'>
            <SectionHeader
              icon={<AdminNavIcon name='paymentSettings' className='h-6 w-6' />}
              title={t('paymentSettings.title')}
              description={t('paymentSettings.description')}
            />
          </div>

          <div className='grid gap-4 px-4 py-5 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]'>
            <section className='min-w-0 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5'>
              <div className='mb-4'>
                <h3 className='text-base font-semibold text-slate-900'>
                  {t('paymentSettingsUi.methodsTitle')}
                </h3>
                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  {t('paymentSettingsUi.methodsDescription')}
                </p>
              </div>
              <div className='space-y-3'>
                <Checkbox
                  checked={settings.codEnabled}
                  onChange={(event) => setSettings((current) =>
                    current ? { ...current, codEnabled: event.target.checked } : current)}
                  label={t('paymentSettings.enableCod')}
                  containerClassName='bg-white'
                />
                <Checkbox
                  checked={settings.payosEnabled}
                  onChange={(event) => setSettings((current) =>
                    current ? { ...current, payosEnabled: event.target.checked } : current)}
                  label={t('paymentSettings.enablePayos')}
                  containerClassName='bg-white'
                />
                <Checkbox
                  checked={settings.codDepositEnabled}
                  onChange={(event) => setSettings((current) =>
                    current ? { ...current, codDepositEnabled: event.target.checked } : current)}
                  label={t('paymentSettings.enableCodDeposit')}
                  containerClassName='bg-white'
                />
              </div>
            </section>

            <section className='min-w-0 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5'>
              <div className='mb-4'>
                <h3 className='text-base font-semibold text-slate-900'>
                  {t('paymentSettingsUi.codDepositTitle')}
                </h3>
                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  {t('paymentSettingsUi.codDepositDescription')}
                </p>
              </div>
              <label className='space-y-2'>
                <span className='admin-label'>{t('paymentSettings.codDepositPercent')}</span>
                <Input
                  type='number'
                  min={0}
                  max={100}
                  disabled={!settings.codDepositEnabled}
                  value={settings.codDepositPercent}
                  onChange={(event) => setSettings((current) =>
                    current
                      ? {
                          ...current,
                          codDepositPercent: Math.max(0, Math.min(100, Number(event.target.value || 0))),
                        }
                      : current)}
                  size='lg'
                  className='max-w-xs bg-white'
                />
                <span className='admin-help-text block'>
                  {t('paymentSettingsUi.codDepositHelp')}
                </span>
              </label>
            </section>
          </div>

          <div className='flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
            <div className='min-w-0 space-y-2'>
              {error ? (
                <p className='rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className='rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
                  {message}
                </p>
              ) : null}
            </div>
            <Button type='submit' disabled={saving} className='min-h-11 w-full sm:w-auto'>
              {saving ? t('entity.saving') : t('paymentSettings.saveSettings')}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
