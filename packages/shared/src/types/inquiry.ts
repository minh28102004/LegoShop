import type { InquiryStatus } from '../constants/status';
import type { ID, Timestamped } from './common';

export type BusinessInquiry = Timestamped & {
  id: ID;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus | string;
};
