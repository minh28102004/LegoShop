import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces, Space_Mono } from 'next/font/google'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { ToastContainer } from '@/components/ui'
import { SITE } from '@/constants'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/cn'
import { Providers } from './providers'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: siteConfig.metadata.title,
    template: siteConfig.metadata.titleTemplate,
  },
  description: siteConfig.metadata.description,
  keywords: [...siteConfig.metadata.keywords],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
    images: [
      {
        url: SITE.ogImage,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    creator: SITE.twitterHandle,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={cn(
        fraunces.variable,
        dmSans.variable,
        spaceMono.variable,
        'h-full scroll-smooth antialiased',
      )}
    >
      <body className="min-h-full bg-background font-body text-text-primary antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
