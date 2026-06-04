'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/common/components/ui/Card';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Select from '@/common/components/ui/Select';
import { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import { getBusinessInquiryById, updateBusinessInquiryStatus } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import type { BusinessInquiry, InquiryStatus } from '@/modules/admin/types/admin.types';

type Props = {
  inquiryId: string;
};

const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'processing',
  'done',
  'cancelled',
];

export default function InquiryDetail({ inquiryId }: Props) {
  const { t } = useI18n();
  const [inquiry, setInquiry] = useState<BusinessInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessInquiryById(inquiryId);
      setInquiry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inquiries.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [inquiryId, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  async function onStatusChange(status: InquiryStatus) {
    if (!inquiry) return;
    try {
      await updateBusinessInquiryStatus(inquiry.id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inquiries.updateFailed'));
    }
  }

  if (loading) {
    return <Card className='p-5'>{t('inquiries.loadingDetail')}</Card>;
  }

  if (error || !inquiry) {
    return (
      <Card className='border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? t('inquiries.notFound')}
      </Card>
    );
  }

  return (
    <PageShell>
      <Card className='p-5 sm:p-6'>
        <SectionHeader
          eyebrow={t('sidebar.businessInquiries')}
          title={t('inquiries.detailTitle')}
          description={inquiry.companyName}
          badge={<StatusBadge value={inquiry.status} t={t} />}
        />

        <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('inquiries.company')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{inquiry.companyName}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('inquiries.contact')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{inquiry.contactName}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('inquiries.email')}
            </p>
            <p className='mt-2 truncate text-sm font-medium text-slate-900'>{inquiry.email}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('inquiries.phone')}
            </p>
            <p className='mt-2 text-sm font-medium tabular-nums text-slate-900'>{inquiry.phone}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4 md:col-span-2'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('inquiries.created')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>
              {new Date(inquiry.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className='p-5 sm:p-6'>
        <SectionHeader title={t('common.status')} />
        <div className='mt-4 max-w-sm space-y-2'>
          <span className='admin-label'>{t('common.status')}</span>
          <Select
            value={inquiry.status}
            aria-label={t('common.status')}
            onChange={(e) => onStatusChange(e.target.value as InquiryStatus)}
          >
            {INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className='p-5 sm:p-6'>
        <SectionHeader title={t('inquiries.message')} />
        <div className='mt-4 rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
          <p className='whitespace-pre-wrap text-sm leading-7 text-slate-900'>{inquiry.message}</p>
        </div>
      </Card>
    </PageShell>
  );
}

