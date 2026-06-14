'use client';

import { FormEvent, useEffect, useState } from 'react';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import Checkbox from '@/common/components/ui/Checkbox';
import Input from '@/common/components/ui/Input';
import LoadingState from '@/common/components/ui/LoadingState';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import { getPaymentSettings, updatePaymentSettings } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
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
        const data = await getPaymentSettings();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('paymentSettings.loadFailed'));
      } finally {
        setLoading(false);
      }
    }

    load();
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

      const updated = await updatePaymentSettings(payload);
      setSettings(updated);
      setMessage(t('paymentSettings.updateSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('paymentSettings.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState text={t('paymentSettings.loading')} />;
  }

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
          <div className='border-b border-slate-200 px-5 py-5 sm:px-6'>
            <SectionHeader
              icon={<AdminNavIcon name='paymentSettings' className='h-6 w-6' />}
              title={t('paymentSettings.title')}
              description={t('paymentSettings.description')}
            />
          </div>

          <div className='grid gap-5 px-5 py-5 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]'>
            <section className='rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5'>
              <div className='mb-4'>
                <h3 className='text-base font-semibold text-slate-900'>Phương thức thanh toán</h3>
                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  Bật hoặc tắt các phương thức đang hiển thị trong checkout.
                </p>
              </div>

              <div className='space-y-3'>
                <Checkbox
                  checked={settings.codEnabled}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, codEnabled: e.target.checked } : prev))
                  }
                  label={t('paymentSettings.enableCod')}
                  containerClassName='bg-white'
                />

                <Checkbox
                  checked={settings.payosEnabled}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, payosEnabled: e.target.checked } : prev))
                  }
                  label={t('paymentSettings.enablePayos')}
                  containerClassName='bg-white'
                />

                <Checkbox
                  checked={settings.codDepositEnabled}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev ? { ...prev, codDepositEnabled: e.target.checked } : prev,
                    )
                  }
                  label={t('paymentSettings.enableCodDeposit')}
                  containerClassName='bg-white'
                />
              </div>
            </section>

            <section className='rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5'>
              <div className='mb-4'>
                <h3 className='text-base font-semibold text-slate-900'>Đặt cọc COD</h3>
                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  Tỷ lệ đặt cọc được giới hạn từ 0 đến 100%.
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
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? {
                            ...prev,
                            codDepositPercent: Math.max(0, Math.min(100, Number(e.target.value || 0))),
                          }
                        : prev,
                    )
                  }
                  size='lg'
                  className='max-w-xs bg-white'
                />
                <span className='admin-help-text block'>
                  Chỉ áp dụng khi bật tùy chọn đặt cọc COD.
                </span>
              </label>
            </section>
          </div>

          <div className='flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
            <div className='space-y-2'>
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

            <Button type='submit' disabled={saving}>
              {saving ? t('entity.saving') : t('paymentSettings.saveSettings')}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

