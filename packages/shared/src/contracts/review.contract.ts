import type { ID, URLString } from '../types/common';
import type { Review } from '../types/review';

export type ReviewContract = Review;

export type CreateReviewRequestContract = {
  productId: ID;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  images?: URLString[];
};
