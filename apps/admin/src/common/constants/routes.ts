export const ADMIN_ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  products: '/products',
  frameOptions: '/frame-options',
  frameSizes: '/frame-sizes',
  frameColors: '/frame-colors',
  templates: '/templates',
  accessories: '/accessories',
  characters: '/characters',
  banners: '/banners',
  frameBackgrounds: '/frame-backgrounds',
  collections: '/collections',
  orders: '/orders',
  businessInquiries: '/business-inquiries',
  vouchers: '/vouchers',
  paymentSettings: '/payment-settings',
  templateCategories: '/template-categories',
  accessoryCategories: '/accessory-categories',
} as const;

export type AdminNavIcon =
  | 'dashboard'
  | 'products'
  | 'frameOptions'
  | 'frameSizes'
  | 'frameColors'
  | 'templates'
  | 'accessories'
  | 'characters'
  | 'banners'
  | 'frameBackgrounds'
  | 'collections'
  | 'orders'
  | 'businessInquiries'
  | 'vouchers'
  | 'paymentSettings';

export type AdminNavItem = {
  id: string;
  href: string;
  labelKey: string;
  icon: AdminNavIcon;
};

export type AdminNavSection = {
  id: string;
  labelKey: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: 'overview',
    labelKey: 'sidebar.overview',
    items: [
      {
        id: 'dashboard',
        href: ADMIN_ROUTES.dashboard,
        labelKey: 'sidebar.dashboard',
        icon: 'dashboard',
      },
    ],
  },
  {
    id: 'catalog',
    labelKey: 'sidebar.catalog',
    items: [
      {
        id: 'products',
        href: ADMIN_ROUTES.products,
        labelKey: 'sidebar.products',
        icon: 'products',
      },
      {
        id: 'frameOptions',
        href: ADMIN_ROUTES.frameOptions,
        labelKey: 'sidebar.frameOptions',
        icon: 'frameOptions',
      },
      {
        id: 'accessories',
        href: ADMIN_ROUTES.accessories,
        labelKey: 'sidebar.accessories',
        icon: 'accessories',
      },
      {
        id: 'characters',
        href: ADMIN_ROUTES.characters,
        labelKey: 'sidebar.characters',
        icon: 'characters',
      },
      {
        id: 'banners',
        href: ADMIN_ROUTES.banners,
        labelKey: 'sidebar.banners',
        icon: 'banners',
      },
      {
        id: 'frameBackgrounds',
        href: ADMIN_ROUTES.frameBackgrounds,
        labelKey: 'sidebar.frameBackgrounds',
        icon: 'frameBackgrounds',
      },
      {
        id: 'collections',
        href: ADMIN_ROUTES.collections,
        labelKey: 'sidebar.collections',
        icon: 'collections',
      },
    ],
  },
  {
    id: 'operations',
    labelKey: 'sidebar.operations',
    items: [
      {
        id: 'orders',
        href: ADMIN_ROUTES.orders,
        labelKey: 'sidebar.orders',
        icon: 'orders',
      },
      {
        id: 'businessInquiries',
        href: ADMIN_ROUTES.businessInquiries,
        labelKey: 'sidebar.businessInquiries',
        icon: 'businessInquiries',
      },
      {
        id: 'vouchers',
        href: ADMIN_ROUTES.vouchers,
        labelKey: 'sidebar.vouchers',
        icon: 'vouchers',
      },
    ],
  },
  {
    id: 'settings',
    labelKey: 'sidebar.settings',
    items: [
      {
        id: 'paymentSettings',
        href: ADMIN_ROUTES.paymentSettings,
        labelKey: 'sidebar.paymentSettings',
        icon: 'paymentSettings',
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);
