import type { Metadata } from "next";
import { vi } from "@/lib/i18n/dictionaries/vi";

const siteCopy = vi.metadata.site;

export const SITE = {
  name: "Figure Lab",
  tagline: siteCopy.tagline,
  description: siteCopy.description,
  url: "https://figurelab.vn",
  email: "hello@figurelab.vn",
  phone: "0901 234 567",
  address: siteCopy.address,
  locale: "vi-VN",
  currency: "VND",
  twitterHandle: "@figurelab.vn",
  ogImage: "/og-image.jpg",
} as const;

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/figurelab.vn",
  instagram: "https://instagram.com/figurelab.vn",
  tiktok: "https://tiktok.com/@figurelab.vn",
  youtube: "https://youtube.com/@figurelabvn",
} as const;

export const SEO = {
  defaultTitle: siteCopy.defaultTitle,
  titleTemplate: `%s | ${SITE.name}`,
  defaultDescription: SITE.description,
} as const;

export const siteConfig = {
  metadata: {
    name: SITE.name,
    title: SEO.defaultTitle,
    titleTemplate: SEO.titleTemplate,
    description: SEO.defaultDescription,
    url: SITE.url,
    locale: SITE.locale,
    ogImage: SITE.ogImage,
    keywords: siteCopy.keywords,
  },
  socialLinks: SOCIAL_LINKS,
  contact: {
    email: SITE.email,
    phone: SITE.phone,
    address: SITE.address,
  },
} as const;

export function generatePageMetadata(
  title: string,
  description: string,
  image?: string,
): Metadata {
  const imageUrl = image ?? siteConfig.metadata.ogImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.metadata.url,
      siteName: siteConfig.metadata.name,
      locale: siteConfig.metadata.locale,
      type: "website",
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
