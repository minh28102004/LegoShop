import type { ProductStatus } from '../constants/status';
import type { ID, Timestamped, URLString } from './common';

export type Feedback = Timestamped & {
  id: ID;
  customerName: string;
  productType: string;
  quote: string;
  rating: number;
  images: URLString[];
  sortOrder: number;
  status: ProductStatus;
};
