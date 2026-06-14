'use client';

import { type PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <I18nProvider>
      {children}
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 3200,
          className:
            '!rounded-[16px] !border !border-slate-200 !bg-white !px-4 !py-3 !text-sm !font-semibold !text-slate-800 !shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)]',
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
          loading: {
            duration: Number.POSITIVE_INFINITY,
          },
        }}
      />
    </I18nProvider>
  );
}
