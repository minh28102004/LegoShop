import type { Metadata } from 'next'

import {
  FOOTER_LINKS,
  HEADER_NAV,
  SEO,
  SITE,
  SOCIAL_LINKS,
} from '@/constants'

export const siteConfig = {
  metadata: {
    name: SITE.name,
    title: SEO.defaultTitle,
    titleTemplate: SEO.titleTemplate,
    description: SEO.defaultDescription,
    url: SITE.url,
    locale: SITE.locale,
    ogImage: SITE.ogImage,
    keywords: [
      'BrickFrames',
      'LEGO frame',
      'khung tranh LEGO',
      'custom brick art',
      'LEGO display',
      'framed brick art',
    ],
  },
  navigation: {
    header: HEADER_NAV,
    footer: FOOTER_LINKS,
  },
  socialLinks: SOCIAL_LINKS,
  contact: {
    email: SITE.email,
    phone: SITE.phone,
    address: SITE.address,
  },
} as const

export function generatePageMetadata(
  title: string,
  description: string,
  image?: string,
): Metadata {
  const imageUrl = image ?? siteConfig.metadata.ogImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.metadata.url,
      siteName: siteConfig.metadata.name,
      locale: siteConfig.metadata.locale,
      type: 'website',
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}
