// Web public routes - chỉ dùng cho website public, không dùng trong admin/backend
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
  gallery: '/#gallery',
  occasions: '/#categories',
  howToOrder: '/#how-to-order',
  aboutBrand: '/#about-figure-lab',
  creatorStudio: '/studio',
  collections: '/collection',
  orderLookup: '/order-tracking',
  checkoutSuccess: '/order-success',
} as const

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
  { label: 'Trang chủ', href: ROUTES.home, tone: 'default' },
  { label: 'Studio Thiết kế', href: ROUTES.studio, tone: 'default' },
  { label: 'Khung Lego', href: ROUTES.collection, tone: 'default' },
  { label: 'Khung Gallery', href: ROUTES.gallery, tone: 'default' },
  { label: 'Doanh nghiệp', href: ROUTES.business, tone: 'default' },
  { label: 'Tra cứu', href: ROUTES.orderTracking, tone: 'accent' },
] as const

export const FOOTER_LINKS = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Sản phẩm', href: ROUTES.collection },
      { label: 'Quà theo dịp', href: ROUTES.occasions },
      { label: 'Quà doanh nghiệp', href: ROUTES.business },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Hướng dẫn đặt hàng', href: ROUTES.howToOrder },
      { label: 'Chính sách', href: ROUTES.privacy },
      { label: 'Liên hệ', href: ROUTES.business },
    ],
  },
  {
    title: 'Kết nối',
    links: [
      { label: 'Instagram', href: 'https://instagram.com/figurelab.vn' },
      { label: 'Facebook', href: 'https://facebook.com/figurelab.vn' },
      { label: 'TikTok', href: 'https://tiktok.com/@figurelab.vn' },
    ],
  },
] as const

export const UI_MODAL_IDS = {
  CART_DRAWER: 'cart-drawer',
} as const
