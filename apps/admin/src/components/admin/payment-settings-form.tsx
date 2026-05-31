'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/admin-api';
import type { PaymentSettings } from '@/types/admin';

export default function PaymentSettingsForm() {
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
        setError(err instanceof Error ? err.message : 'Failed to load payment settings');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
      setMessage('Payment settings updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className='rounded-2xl border border-stone-300/70 bg-white/90 p-5'>Loading settings...</div>;
  }

  if (error || !settings) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? 'Settings unavailable'}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
      <h2 className='text-lg font-semibold'>Payment Settings</h2>
      <p className='mt-1 text-sm text-stone-600'>
        Configure COD, payOS, and COD deposit behavior for checkout.
      </p>

      <div className='mt-4 space-y-3'>
        <label className='flex items-center gap-3 text-sm'>
          <input
            type='checkbox'
            checked={settings.codEnabled}
            onChange={(e) => setSettings((prev) => (prev ? { ...prev, codEnabled: e.target.checked } : prev))}
            className='h-5 w-5'
          />
          Enable COD
        </label>

        <label className='flex items-center gap-3 text-sm'>
          <input
            type='checkbox'
            checked={settings.payosEnabled}
            onChange={(e) =>
              setSettings((prev) => (prev ? { ...prev, payosEnabled: e.target.checked } : prev))
            }
            className='h-5 w-5'
          />
          Enable payOS
        </label>

        <label className='flex items-center gap-3 text-sm'>
          <input
            type='checkbox'
            checked={settings.codDepositEnabled}
            onChange={(e) =>
              setSettings((prev) =>
                prev ? { ...prev, codDepositEnabled: e.target.checked } : prev,
              )
            }
            className='h-5 w-5'
          />
          Enable COD Deposit
        </label>

        <label className='block text-sm'>
          <span className='mb-1 block text-stone-700'>COD Deposit Percent (0-100)</span>
          <input
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
            className='w-full max-w-xs rounded-xl border border-stone-300 px-3 py-2 disabled:bg-stone-100'
          />
        </label>
      </div>

      <div className='mt-5'>
        <button
          type='submit'
          disabled={saving}
          className='rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error ? (
        <p className='mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</p>
      ) : null}
      {message ? (
        <p className='mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700'>
          {message}
        </p>
      ) : null}
    </form>
  );
}
