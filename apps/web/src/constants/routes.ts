// ============================================================
// ROUTES - Tat ca URL paths tap trung tai day
// ============================================================

export const ROUTES = {
  home: '/',
  collection: '/collection',
  studio: '/studio',
  cart: '/cart',
  checkout: '/checkout',
  orderSuccess: '/order-success',
  orderTracking: '/order-tracking',
  paymentSuccess: '/payment/success',
  paymentCancel: '/payment/cancel',
  business: '/business',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  shipping: '/shipping-policy',
  returns: '/return-policy',
  privacy: '/privacy-policy',
  terms: '/terms',
  // Legacy aliases
  creatorStudio: '/studio',
  collections: '/collection',
  orderLookup: '/order-tracking',
  checkoutSuccess: '/order-success',
} as const

// Static routes (khong co params) - dung cho navigation
export const STATIC_ROUTES = {
  home: ROUTES.home,
  collection: ROUTES.collection,
  studio: ROUTES.studio,
  cart: ROUTES.cart,
  checkout: ROUTES.checkout,
  orderTracking: ROUTES.orderTracking,
  business: ROUTES.business,
  about: ROUTES.about,
  contact: ROUTES.contact,
} as const

export const HEADER_NAV = [
  {
    label: 'Trang chủ',
    href: ROUTES.home,
  },
  {
    label: 'Studio Thiết kế',
    href: ROUTES.studio,
  },
  {
    label: 'Khung Lego',
    href: ROUTES.collection,
  },
  {
    label: 'Doanh nghiệp',
    href: ROUTES.business,
  },
  {
    label: 'Tra cứu',
    href: ROUTES.orderTracking,
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
