import type { Metadata } from 'next';
import Providers from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Figure Lab Admin',
  description: 'Hệ thống quản trị Figure Lab',
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
