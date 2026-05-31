import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

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
    <html lang='en' className={`${sora.variable} h-full antialiased`}>
      <body className='min-h-full'>{children}</body>
    </html>
  );
}
