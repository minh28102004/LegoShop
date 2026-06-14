import type { Metadata } from 'next';
import Providers from '@/app/providers';
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
