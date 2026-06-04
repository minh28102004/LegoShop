'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Badge, { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import Card from '@/common/components/ui/Card';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Select from '@/common/components/ui/Select';
import Table, {
  TableActions,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
  tableActionButtonClass,
} from '@/common/components/ui/Table';
import Tooltip from '@/common/components/ui/Tooltip';
import { listBusinessInquiries, updateBusinessInquiryStatus } from '@/modules/admin/services/adminApi';
import { useI18n } from '@/lib/i18n/useI18n';
import type { BusinessInquiry, InquiryStatus } from '@/modules/admin/types/admin.types';

const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'processing',
  'done',
  'cancelled',
];

export default function InquiriesManager() {
  const { t } = useI18n();
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  function EyeIcon() {
    return (
      <svg viewBox='0 0 24 24' fill='none' className='h-4 w-4' aria-hidden='true'>
        <path
          d='M2.5 12C4.5 7 8 4.5 12 4.5C16 4.5 19.5 7 21.5 12C19.5 17 16 19.5 12 19.5C8 19.5 4.5 17 2.5 12Z'
          stroke='currentColor'
          strokeWidth='1.8'
          strokeLinejoin='round'
        />
        <circle cx='12' cy='12' r='2.75' stroke='currentColor' strokeWidth='1.8' />
      </svg>
    );
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBusinessInquiries();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inquiries.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  async function updateStatus(id: string, status: InquiryStatus) {
    try {
      await updateBusinessInquiryStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inquiries.updateFailed'));
    }
  }

  return (
    <PageShell>
      <Card className='p-5 sm:p-6'>
        <SectionHeader
          eyebrow={t('common.status')}
          title={t('sidebar.businessInquiries')}
          description={t('sidebarDesc.businessInquiries')}
          badge={
            <Badge tone='info' className='rounded-full px-4 py-2 text-sm font-medium'>
              {inquiries.length} {t('common.total')}
            </Badge>
          }
        />
      </Card>

      <Table className='min-w-[980px]'>
        <TableHeader>
          <tr>
            <TableHead>{t('inquiries.company')}</TableHead>
            <TableHead>{t('inquiries.contact')}</TableHead>
            <TableHead>{t('inquiries.email')}</TableHead>
            <TableHead>{t('inquiries.phone')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead className='text-right'>{t('inquiries.action')}</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableEmptyState colSpan={6}>{t('inquiries.loading')}</TableEmptyState>
          ) : error ? (
            <TableEmptyState colSpan={6} className='text-red-700'>
              {error}
            </TableEmptyState>
          ) : inquiries.length === 0 ? (
            <TableEmptyState colSpan={6}>{t('inquiries.noData')}</TableEmptyState>
          ) : (
            inquiries.map((item) => (
              <TableRow key={item.id} hoverable>
                <TableCell className='font-medium text-slate-800'>
                  <span className='block max-w-[220px] truncate font-semibold text-slate-900'>
                    {item.companyName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='block max-w-[180px] truncate font-medium text-slate-700'>
                    {item.contactName}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='block max-w-[220px] truncate text-[13px] font-medium text-slate-500'>
                    {item.email}
                  </span>
                </TableCell>
                <TableCell className='font-medium tabular-nums text-slate-600'>{item.phone}</TableCell>
                <TableCell>
                  <div className='min-w-[190px] space-y-2'>
                    <StatusBadge value={item.status} t={t} />
                    <Select
                      value={item.status}
                      aria-label={t('common.status')}
                      onChange={(e) => updateStatus(item.id, e.target.value as InquiryStatus)}
                    >
                      {INQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <TableActions>
                    <Tooltip content={t('inquiries.detail')}>
                      <Link
                        href={`/business-inquiries/${item.id}`}
                        aria-label={t('inquiries.detail')}
                        className={tableActionButtonClass('view')}
                      >
                        <EyeIcon />
                      </Link>
                    </Tooltip>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </PageShell>
  );
}

