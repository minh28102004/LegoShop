export type HomeCta = {
  label: string;
  href: string;
};

export type HomeMediaSlot =
  | "hero"
  | "story"
  | "friendship"
  | "transformation"
  | "final-cta";

export type HomeMediaAsset = {
  src: string;
  alt: string;
  slot: HomeMediaSlot;
  source: "api" | "development-fallback";
};

export type HomeFeatureItem = {
  title: string;
  description: string;
  icon: "highVoltage" | "artistPalette" | "wrappedGift" | "shield";
};

export type HomeHero = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  trustPoints: string[];
  chips: string[];
  features: HomeFeatureItem[];
  commitmentsLabel: string;
  sliderLabels: HomeHeroSliderLabels;
};

export type HomeHeroSliderLabels = {
  gallery: string;
  previous: string;
  next: string;
  viewSlide: string;
};

export type HomeStory = {
  eyebrow: string;
  title: string;
  highlightedPhrase: string;
  paragraphs: string[];
  quote: string;
  visualBadge: string;
  cta: HomeCta;
};

export type HomeMemoryCard = {
  title: string;
  description: string;
  icon: "graduation" | "sparkles" | "gift";
};

export type HomeFriendshipStory = {
  eyebrow: string;
  title: string;
  subtitle: string;
  details: HomeMemoryCard[];
  cta: HomeCta;
};

export type HomeCustomizationItem = {
  title: string;
  description: string;
  icon: "face" | "shirt" | "accessory" | "message";
};

export type HomeTransformation = {
  eyebrow: string;
  title: string;
  description: string;
  statement: string;
  items: HomeCustomizationItem[];
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  sourceBadge: string;
  sourceTitle: string;
  sourceDescription: string;
  resultBadge: string;
};

export type HomeFeaturedProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  basePrice: number;
  originalPrice: number | null;
  orderCount: number;
  characterCount: number;
  accessoryCount: number;
  includedItemLabels: string[];
  badge: string | null;
  featured: boolean;
  href: string;
  imageUrl: string | null;
};

export type HomeOrderStep = {
  step: string;
  title: string;
  description: string;
};

export type HomeCategory = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type HomeTestimonial = {
  name: string;
  productType: string;
  quote: string;
  rating: number;
  isSample: true;
  seedTag: string;
};

export type HomeFinalCta = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
};

export type HomeMediaLabels = {
  alt: Record<HomeMediaSlot, string>;
  developmentBadge: string;
  unavailableLabel: string;
  unavailableText: string;
};

export type HomeProductCardLabels = {
  featuredBadge: string;
  customDesignBadge: string;
  fallbackDescription: string;
  view: string;
  from: string;
  customize: string;
};

export type HomeProductsContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: HomeCta;
  emptyTitle: string;
  errorDescription: string;
  emptyDescription: string;
  card: HomeProductCardLabels;
};

export type HomeCategoryCardLabels = {
  occasion: string;
  explore: string;
  fallbackDescription: string;
};

export type HomeCategoriesContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  emptyTitle: string;
  errorDescription: string;
  emptyDescription: string;
  card: HomeCategoryCardLabels;
};

export type HomeProcessContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: HomeOrderStep[];
};

export type HomeTestimonialsContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sampleLabel: string;
  ratingSuffix: string;
  items: HomeTestimonial[];
};

export type HomePageTranslation = {
  hero: HomeHero;
  story: HomeStory;
  friendship: HomeFriendshipStory;
  transformation: HomeTransformation;
  products: HomeProductsContent;
  process: HomeProcessContent;
  categories: HomeCategoriesContent;
  testimonials: HomeTestimonialsContent;
  finalCta: HomeFinalCta;
  media: HomeMediaLabels;
};

export type HomeResourceState = "api" | "empty" | "error";

export type HomeMediaMap = Record<HomeMediaSlot, HomeMediaAsset | null>;

export type HomePageData = {
  products: HomeFeaturedProduct[];
  productState: HomeResourceState;
  categories: HomeCategory[];
  categoryState: HomeResourceState;
  media: HomeMediaMap;
  heroSlides: HomeMediaAsset[];
  bannerState: HomeResourceState;
};
