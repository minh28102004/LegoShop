import type { Metadata, Viewport } from 'next'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { ToastContainer } from '@/components/ui'
import { SITE } from '@/constants'
import { siteConfig } from '@/config/site'
import { Providers } from './providers'
import { Playfair_Display, Poppins, Space_Mono } from 'next/font/google'
import './globals.css'

// Playfair Display — Serif cho tiêu đề, logo (THE LUVIN style)
const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Poppins — Sans-serif nhẹ nhàng cho body text
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
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
    { media: '(prefers-color-scheme: light)', color: '#FDF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`h-full scroll-smooth antialiased ${playfairDisplay.variable} ${poppins.variable} ${spaceMono.variable}`}>
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
