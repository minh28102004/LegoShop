import type { InquiryStatus } from "../constants/status";
import type { BusinessInquiry } from "../types/inquiry";

export type BusinessInquiryContract = BusinessInquiry;

export type CreateBusinessInquiryRequestContract = {
  companyName: string;
  contactName?: string;
  contactPerson?: string;
  email: string;
  phone: string;
  message: string;
};

export type CreateBusinessInquiryResponseContract = {
  success: true;
  message: string;
  data: BusinessInquiryContract;
};

export type BusinessQuoteRequestContract = {
  frameId: string;
  characterCount: number;
  charmCount: number;
  quantity: number;
  brandDesign: boolean;
  logoPlacement: boolean;
  premiumPackaging: boolean;
  documents: boolean;
};

export type BusinessQuoteResponseContract = BusinessQuoteRequestContract & {
  frameLabel: string;
  framePrice: number;
  discountPercent: number;
  retailUnitPrice: number;
  estimatedUnitPrice: number;
  totalPrice: number;
  savings: number;
  quotedAt: string;
};

export type UpdateBusinessInquiryStatusRequestContract = {
  status: InquiryStatus;
};
