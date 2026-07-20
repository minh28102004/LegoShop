import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE, siteConfig } from "@/config/site";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { Providers } from "./providers";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

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
    type: "website",
    images: [
      {
        url: SITE.ogImage,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9FF" },
    { media: "(prefers-color-scheme: dark)", color: "#071D3A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full w-full scroll-smooth antialiased`}
    >
      <body className="h-dvh w-full overflow-hidden bg-background font-body text-text-primary antialiased">
        <Providers>
          <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden">
            <Header />

            <div aria-hidden="true" className="h-[62px] shrink-0 lg:h-[58px]" />

            <div
              id="site-scroll-root"
              className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden scroll-pt-[84px] lg:scroll-pt-[78px]"
            >
              <main className="w-full min-w-0 overflow-x-hidden">
                {children}
              </main>

              <Footer />
            </div>

            <CartDrawer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
