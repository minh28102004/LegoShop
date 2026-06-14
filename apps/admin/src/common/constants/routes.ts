export const ADMIN_ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  products: '/products',
  frameSizes: '/frame-sizes',
  frameColors: '/frame-colors',
  templates: '/templates',
  accessories: '/accessories',
  banners: '/banners',
  collections: '/collections',
  orders: '/orders',
  businessInquiries: '/business-inquiries',
  paymentSettings: '/payment-settings',
  templateCategories: '/template-categories',
  accessoryCategories: '/accessory-categories',
} as const;

export type AdminNavIcon =
  | 'dashboard'
  | 'products'
  | 'frameSizes'
  | 'frameColors'
  | 'templates'
  | 'accessories'
  | 'banners'
  | 'collections'
  | 'orders'
  | 'businessInquiries'
  | 'paymentSettings';

export type AdminNavItem = {
  id: string;
  href: string;
  labelKey: string;
  descriptionKey: string;
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
        descriptionKey: 'sidebarDesc.dashboard',
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
        descriptionKey: 'sidebarDesc.products',
        icon: 'products',
      },
      // {
      //   id: 'frameSizes',
      //   href: ADMIN_ROUTES.frameSizes,
      //   labelKey: 'sidebar.frameSizes',
      //   descriptionKey: 'sidebarDesc.frameSizes',
      //   icon: 'frameSizes',
      // },
      // {
      //   id: 'frameColors',
      //   href: ADMIN_ROUTES.frameColors,
      //   labelKey: 'sidebar.frameColors',
      //   descriptionKey: 'sidebarDesc.frameColors',
      //   icon: 'frameColors',
      // },
      {
        id: 'templates',
        href: ADMIN_ROUTES.templates,
        labelKey: 'sidebar.templates',
        descriptionKey: 'sidebarDesc.templates',
        icon: 'templates',
      },
      {
        id: 'accessories',
        href: ADMIN_ROUTES.accessories,
        labelKey: 'sidebar.accessories',
        descriptionKey: 'sidebarDesc.accessories',
        icon: 'accessories',
      },
      {
        id: 'banners',
        href: ADMIN_ROUTES.banners,
        labelKey: 'sidebar.banners',
        descriptionKey: 'sidebarDesc.banners',
        icon: 'banners',
      },
      {
        id: 'collections',
        href: ADMIN_ROUTES.collections,
        labelKey: 'sidebar.collections',
        descriptionKey: 'sidebarDesc.collections',
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
        descriptionKey: 'sidebarDesc.orders',
        icon: 'orders',
      },
      {
        id: 'businessInquiries',
        href: ADMIN_ROUTES.businessInquiries,
        labelKey: 'sidebar.businessInquiries',
        descriptionKey: 'sidebarDesc.businessInquiries',
        icon: 'businessInquiries',
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
        descriptionKey: 'sidebarDesc.paymentSettings',
        icon: 'paymentSettings',
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);
