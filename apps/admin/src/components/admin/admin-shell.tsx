'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, getAccessToken } from '@/lib/auth';
import { me } from '@/lib/admin-api';
import type { AdminProfile } from '@/types/admin';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard' }],
  },
  {
    title: 'Catalog',
    items: [
      { href: '/products', label: 'Products' },
      { href: '/templates', label: 'Templates' },
      { href: '/template-categories', label: 'Template Categories' },
      { href: '/accessories', label: 'Accessories' },
      { href: '/accessory-categories', label: 'Accessory Categories' },
      { href: '/banners', label: 'Banners' },
      { href: '/collections', label: 'Collections' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/orders', label: 'Orders' },
      { href: '/business-inquiries', label: 'Business Inquiries' },
    ],
  },
  {
    title: 'Settings',
    items: [{ href: '/payment-settings', label: 'Payment Settings' }],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export default function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    me()
      .then((data) => {
        setProfile(data);
      })
      .catch(() => {
        clearAccessToken();
        router.replace('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const pageTitle = useMemo(() => {
    const item = NAV_ITEMS.find((entry) =>
      entry.href === '/'
        ? pathname === '/'
        : pathname === entry.href || pathname.startsWith(`${entry.href}/`),
    );
    return item?.label ?? 'Admin';
  }, [pathname]);

  if (loading) {
    return (
      <div className='grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#f9ddb6_0,#f7f3eb_34%,#f0e8dd_100%)] text-stone-800'>
        <div className='rounded-3xl border border-stone-200/70 bg-white/85 px-6 py-5 shadow-lg backdrop-blur'>
          <p className='text-xs font-semibold uppercase tracking-[0.25em] text-stone-500'>
            Lego Shop Admin
          </p>
          <p className='mt-2 text-sm text-stone-700'>Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,#f9ddb6_0,#f7f3eb_34%,#f0e8dd_100%)] text-stone-800'>
      <div className='mx-auto flex min-h-screen max-w-[1560px] gap-6 px-4 py-4 md:px-6 lg:px-8'>
        <aside className='sticky top-4 hidden h-[calc(100vh-2rem)] w-80 shrink-0 flex-col overflow-hidden rounded-[28px] border border-stone-200/80 bg-white/80 shadow-[0_18px_50px_rgba(120,83,39,0.12)] backdrop-blur md:flex'>
          <div className='border-b border-stone-200/80 p-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-stone-500'>
              Lego Shop
            </p>
            <div className='mt-3 flex items-center justify-between gap-3'>
              <div>
                <h2 className='text-2xl font-semibold tracking-tight'>Admin Control</h2>
                <p className='mt-1 text-sm text-stone-600'>Backend-connected workspace</p>
              </div>
              <div className='rounded-2xl bg-stone-900 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-50'>
                Live
                <div className='mt-1 text-[10px] font-normal tracking-normal text-stone-300'>
                  localhost:3002
                </div>
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-4'>
            <div className='space-y-5'>
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className='mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500'>
                    {section.title}
                  </p>
                  <nav className='space-y-1'>
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${
                            active
                              ? 'bg-stone-900 text-stone-50 shadow-md shadow-stone-900/15'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`h-2 w-2 rounded-full transition ${
                              active ? 'bg-amber-300' : 'bg-stone-300 group-hover:bg-stone-400'
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          <div className='border-t border-stone-200/80 p-4'>
            <div className='rounded-2xl bg-stone-50 px-4 py-3'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500'>
                Signed in as
              </p>
              <p className='mt-1 font-medium text-stone-800'>{profile?.name || profile?.email}</p>
            </div>
          </div>
        </aside>

        <section className='flex-1 py-1'>
          <header className='mb-5 rounded-[28px] border border-stone-200/80 bg-white/85 px-5 py-4 shadow-[0_12px_40px_rgba(120,83,39,0.08)] backdrop-blur'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500'>
                  Lego Shop Admin
                </p>
                <h1 className='mt-2 text-2xl font-semibold tracking-tight'>{pageTitle}</h1>
                <p className='mt-1 text-sm text-stone-600'>
                  Signed in as {profile?.name || profile?.email}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700'>
                  Backend connected
                </div>
                <button
                  onClick={() => {
                    clearAccessToken();
                    router.replace('/login');
                  }}
                  className='rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100'
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
