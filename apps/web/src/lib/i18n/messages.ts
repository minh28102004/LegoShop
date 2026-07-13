import type { Locale } from "./config";

export const messages = {
  vi: {
    common: {
      language: "Ngôn ngữ",
      localeShort: {
        vi: "VI",
        en: "EN",
      },
      localeLabel: {
        vi: "Tiếng Việt",
        en: "Tiếng Anh (English)",
      },
    },
    header: {
      announcement: "Quà tặng cá nhân hóa tinh tế cho những khoảnh khắc đáng nhớ",
      openMenu: "Mở menu",
      closeMenu: "Đóng menu",
      openCart: "Mở giỏ hàng",
      mobileMenuTitle: "Menu di động",
      nav: {
        home: "Trang chủ",
        studio: "Studio Thiết kế",
        legoFrame: "Bộ sưu tập",
        business: "Doanh nghiệp",
        lookup: "Tra cứu",
      },
    },
    footer: {
      badge: "Quà tặng trưng bày cá nhân hóa",
      brandDescription:
        "Chuyên khung trưng bày, mô hình cá nhân hóa và quà tặng thiết kế riêng cho các dịp đặc biệt.",
      columns: {
        explore: "Khám phá",
        support: "Hỗ trợ",
        contact: "Liên hệ",
      },
      links: {
        products: "Sản phẩm",
        occasions: "Quà theo dịp",
        business: "Quà doanh nghiệp",
        howToOrder: "Hướng dẫn đặt hàng",
        policies: "Chính sách",
        contact: "Liên hệ",
      },
      copyright: "© Figure Lab. Bảo lưu mọi quyền.",
    },
    toast: {
      switchedTo: "Đã chuyển sang {locale}",
    },
  },
  en: {
    common: {
      language: "Language",
      localeShort: {
        vi: "VI",
        en: "EN",
      },
      localeLabel: {
        vi: "Vietnamese",
        en: "English",
      },
    },
    header: {
      announcement: "Thoughtful personalized gifts for life’s memorable moments",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      openCart: "Open cart",
      mobileMenuTitle: "Mobile menu",
      nav: {
        home: "Home",
        studio: "Design Studio",
        legoFrame: "Collection",
        business: "Business",
        lookup: "Lookup",
      },
    },
    footer: {
      badge: "Personalized display gifts",
      brandDescription:
        "Custom display frames, personalized models, and tailored gifts made for birthdays, milestones, and special occasions.",
      columns: {
        explore: "Explore",
        support: "Support",
        contact: "Contact",
      },
      links: {
        products: "Products",
        occasions: "Gifts by occasion",
        business: "Corporate gifts",
        howToOrder: "How to order",
        policies: "Policies",
        contact: "Contact",
      },
      copyright: "© Figure Lab. All rights reserved.",
    },
    toast: {
      switchedTo: "Language changed to {locale}",
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;
