'use client';

import { type PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { HOT_TOAST_OPTIONS } from '@lego-shop/ui';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <I18nProvider>
      {children}
      <Toaster
        position='top-right'
        toastOptions={HOT_TOAST_OPTIONS}
      />
    </I18nProvider>
  );
}
