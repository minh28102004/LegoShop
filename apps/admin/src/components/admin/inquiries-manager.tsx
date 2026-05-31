'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listBusinessInquiries, updateBusinessInquiryStatus } from '@/lib/admin-api';
import type { BusinessInquiry, InquiryStatus } from '@/types/admin';

const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'processing',
  'done',
  'cancelled',
];

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listBusinessInquiries();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: InquiryStatus) {
    try {
      await updateBusinessInquiryStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  return (
    <section className='overflow-hidden rounded-2xl border border-stone-300/70 bg-white/90 shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[900px] text-sm'>
          <thead className='bg-stone-100 text-left text-stone-600'>
            <tr>
              <th className='px-3 py-2'>Company</th>
              <th className='px-3 py-2'>Contact</th>
              <th className='px-3 py-2'>Email</th>
              <th className='px-3 py-2'>Phone</th>
              <th className='px-3 py-2'>Status</th>
              <th className='px-3 py-2'>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className='px-3 py-8 text-center text-stone-500'>
                  Loading...
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-3 py-8 text-center text-stone-500'>
                  No inquiries found.
                </td>
              </tr>
            ) : (
              inquiries.map((item) => (
                <tr key={item.id} className='border-t border-stone-200'>
                  <td className='px-3 py-2'>{item.companyName}</td>
                  <td className='px-3 py-2'>{item.contactName}</td>
                  <td className='px-3 py-2'>{item.email}</td>
                  <td className='px-3 py-2'>{item.phone}</td>
                  <td className='px-3 py-2'>
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value as InquiryStatus)}
                      className='rounded-lg border border-stone-300 bg-white px-2 py-1'
                    >
                      {INQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='px-3 py-2'>
                    <Link
                      href={`/business-inquiries/${item.id}`}
                      className='rounded-md border border-stone-300 bg-white px-2 py-1 text-xs font-medium hover:bg-stone-100'
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {error ? (
        <div className='border-t border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>{error}</div>
      ) : null}
    </section>
  );
}
