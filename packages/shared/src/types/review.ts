import type { ID, Timestamped, URLString } from './common';

export type Review = Timestamped & {
  id: ID;
  productId: ID;
  authorName: string;
  authorAvatar: URLString | null;
  rating: number;
  title: string;
  body: string;
  images: URLString[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
};
