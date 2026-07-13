import type { Metadata } from "next";

export const SITE = {
  name: "Figure Lab",
  tagline: "Quà tặng cá nhân hóa tinh tế cho những khoảnh khắc đáng nhớ",
  description:
    "Figure Lab mang đến quà tặng cá nhân hóa với figure, mô hình, khung tranh và gift box dành cho sinh nhật, tốt nghiệp, kỷ niệm và doanh nghiệp.",
  url: "https://figurelab.vn",
  email: "hello@figurelab.vn",
  phone: "0901 234 567",
  address: "Quận 1, TP. Hồ Chí Minh",
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
  defaultTitle: `${SITE.name} - Quà tặng cá nhân hóa tinh tế`,
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
    keywords: [
      "Figure Lab",
      "quà tặng cá nhân hóa",
      "figure quà tặng",
      "museum box",
      "love notes box",
      "khung tranh lego",
      "gift box doanh nghiệp",
    ],
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
