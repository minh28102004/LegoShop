'use client';

import { useEffect, useState } from 'react';
import { getBusinessInquiryById, updateBusinessInquiryStatus } from '@/lib/admin-api';
import type { BusinessInquiry, InquiryStatus } from '@/types/admin';

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
  const [inquiry, setInquiry] = useState<BusinessInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessInquiryById(inquiryId);
      setInquiry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiry');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [inquiryId]);

  async function onStatusChange(status: InquiryStatus) {
    if (!inquiry) return;
    try {
      await updateBusinessInquiryStatus(inquiry.id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  if (loading) {
    return <div className='rounded-2xl border border-stone-300/70 bg-white/90 p-5'>Loading inquiry...</div>;
  }

  if (error || !inquiry) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? 'Inquiry not found'}
      </div>
    );
  }

  return (
    <section className='rounded-2xl border border-stone-300/70 bg-white/90 p-5 shadow-sm'>
      <h2 className='text-lg font-semibold'>Business Inquiry Detail</h2>
      <div className='mt-4 grid gap-2 text-sm'>
        <p>
          <span className='text-stone-600'>Company:</span> {inquiry.companyName}
        </p>
        <p>
          <span className='text-stone-600'>Contact:</span> {inquiry.contactName}
        </p>
        <p>
          <span className='text-stone-600'>Email:</span> {inquiry.email}
        </p>
        <p>
          <span className='text-stone-600'>Phone:</span> {inquiry.phone}
        </p>
        <p>
          <span className='text-stone-600'>Created:</span>{' '}
          {new Date(inquiry.createdAt).toLocaleString()}
        </p>
      </div>

      <div className='mt-4'>
        <label className='text-sm'>
          <span className='mb-1 block text-stone-700'>Status</span>
          <select
            value={inquiry.status}
            onChange={(e) => onStatusChange(e.target.value as InquiryStatus)}
            className='rounded-xl border border-stone-300 bg-white px-3 py-2'
          >
            {INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className='mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4'>
        <p className='text-sm text-stone-600'>Message</p>
        <p className='mt-2 whitespace-pre-wrap text-sm text-stone-900'>{inquiry.message}</p>
      </div>
    </section>
  );
}
