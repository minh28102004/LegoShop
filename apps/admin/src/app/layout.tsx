import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lego Shop Admin',
  description: 'Administration dashboard for Lego Shop',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='vi' className='h-full antialiased'>
      <body className='min-h-full'>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
