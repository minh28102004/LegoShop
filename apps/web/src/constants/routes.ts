// ============================================================
// ROUTES - Tat ca URL paths tap trung tai day
// ============================================================

export const ROUTES = {
  home: '/',
  collections: '/collections',
  collection: (slug: string) => `/collections/${slug}`,
  product: (slug: string) => `/products/${slug}`,
  creatorStudio: '/creator-studio',
  cart: '/cart',
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  orderLookup: '/orders/track',
  orderTracking: (orderCode: string) => `/orders/track/${orderCode}`,
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  shipping: '/shipping-policy',
  returns: '/return-policy',
  privacy: '/privacy-policy',
  terms: '/terms',
} as const

// Static routes (khong co params) - dung cho navigation
export const STATIC_ROUTES = {
  home: ROUTES.home,
  collections: ROUTES.collections,
  creatorStudio: ROUTES.creatorStudio,
  cart: ROUTES.cart,
  checkout: ROUTES.checkout,
  orderLookup: ROUTES.orderLookup,
  about: ROUTES.about,
  contact: ROUTES.contact,
  faq: ROUTES.faq,
} as const

export const HEADER_NAV = [
  {
    label: 'Bộ sưu tập',
    href: ROUTES.collections,
  },
  {
    label: 'Creator Studio',
    href: ROUTES.creatorStudio,
  },
  {
    label: 'Theo dõi đơn',
    href: ROUTES.orderLookup,
  },
  {
    label: 'FAQ',
    href: ROUTES.faq,
  },
] as const

export const FOOTER_LINKS = [
  {
    title: 'Sản phẩm',
    links: [
      { label: 'Bộ sưu tập', href: ROUTES.collections },
      { label: 'Creator Studio', href: ROUTES.creatorStudio },
      { label: 'Giỏ hàng', href: ROUTES.cart },
      { label: 'Thanh toán', href: ROUTES.checkout },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Liên hệ', href: ROUTES.contact },
      { label: 'Câu hỏi thường gặp', href: ROUTES.faq },
      { label: 'Theo dõi đơn', href: ROUTES.orderLookup },
      { label: 'Chính sách vận chuyển', href: ROUTES.shipping },
    ],
  },
  {
    title: 'Chính sách',
    links: [
      { label: 'Đổi trả', href: ROUTES.returns },
      { label: 'Bảo mật', href: ROUTES.privacy },
      { label: 'Điều khoản', href: ROUTES.terms },
      { label: 'Về BrickFrames', href: ROUTES.about },
    ],
  },
  {
    title: 'Liên hệ',
    links: [
      { label: 'Email', href: 'mailto:hello@brickframes.vn' },
      { label: 'Hotline', href: 'tel:0901234567' },
      { label: 'Facebook', href: 'https://facebook.com/brickframes' },
      { label: 'Instagram', href: 'https://instagram.com/brickframes.vn' },
    ],
  },
] as const

export const UI_MODAL_IDS = {
  CART_DRAWER: 'cart-drawer',
} as const
