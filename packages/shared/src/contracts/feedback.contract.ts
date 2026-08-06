import type { ProductStatus } from '../constants/status';
import type { URLString } from '../types/common';
import type { Feedback } from '../types/feedback';

export type FeedbackContract = Feedback;

export type CreateFeedbackRequestContract = {
  customerName: string;
  productType: string;
  quote: string;
  rating: number;
  images: URLString[];
  sortOrder?: number;
  status?: ProductStatus;
};

export type UpdateFeedbackRequestContract =
  Partial<CreateFeedbackRequestContract>;
