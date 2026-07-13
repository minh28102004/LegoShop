// Web public routes - only used for the public website.
export const ROUTES = {
  home: "/",
  collection: "/collection",
  studio: "/studio",
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: "/order-success",
  orderTracking: "/order-tracking",
  paymentSuccess: "/payment/success",
  paymentCancel: "/payment/cancel",
  business: "/business",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  shipping: "/shipping-policy",
  returns: "/return-policy",
  privacy: "/privacy-policy",
  terms: "/terms",
  gallery: "/#gallery",
  occasions: "/#categories",
  howToOrder: "/#how-to-order",
  aboutBrand: "/#about-figure-lab",
  creatorStudio: "/studio",
  collections: "/collection",
  orderLookup: "/order-tracking",
  checkoutSuccess: "/order-success",
} as const;

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
} as const;

export const HEADER_NAV_ITEMS = [
  { key: "home", href: ROUTES.home, tone: "default" },
  { key: "studio", href: ROUTES.studio, tone: "default" },
  { key: "legoFrame", href: ROUTES.collection, tone: "default" },
  { key: "business", href: ROUTES.business, tone: "default" },
  { key: "lookup", href: ROUTES.orderTracking, tone: "accent" },
] as const;

export const FOOTER_LINK_GROUPS = [
  {
    key: "explore",
    links: [
      { key: "products", href: ROUTES.collection },
      { key: "occasions", href: ROUTES.occasions },
      { key: "business", href: ROUTES.business },
    ],
  },
  {
    key: "support",
    links: [
      { key: "howToOrder", href: ROUTES.howToOrder },
      { key: "policies", href: ROUTES.privacy },
      { key: "contact", href: ROUTES.business },
    ],
  },
] as const;

export const UI_MODAL_IDS = {
  CART_DRAWER: "cart-drawer",
} as const;
