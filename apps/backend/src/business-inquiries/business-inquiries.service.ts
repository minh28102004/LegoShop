import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessQuoteDto } from './dto/business-quote.dto';
import { CreateBusinessInquiryDto } from './dto/create-business-inquiry.dto';

const CHARACTER_PRICE = 10_000;
const CHARM_PRICE = 5_000;
const PREMIUM_PACKAGING_PRICE = 20_000;

function getBusinessDiscountPercent(quantity: number) {
  if (quantity >= 100) return 12;
  if (quantity >= 50) return 10;
  if (quantity >= 30) return 8;
  return 5;
}

@Injectable()
export class BusinessInquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async quoteBusinessGift(dto: BusinessQuoteDto) {
    const frame = await this.prisma.frameSize.findFirst({
      where: {
        id: dto.frameId,
        status: ProductStatus.active,
      },
      select: {
        id: true,
        label: true,
        price: true,
      },
    });

    if (!frame) {
      throw new NotFoundException('Frame size is not available');
    }

    const retailUnitPrice =
      frame.price +
      dto.characterCount * CHARACTER_PRICE +
      dto.charmCount * CHARM_PRICE +
      (dto.premiumPackaging ? PREMIUM_PACKAGING_PRICE : 0);
    const discountPercent = getBusinessDiscountPercent(dto.quantity);
    const estimatedUnitPrice =
      Math.round((retailUnitPrice * (1 - discountPercent / 100)) / 1_000) *
      1_000;
    const totalPrice = estimatedUnitPrice * dto.quantity;
    const savings = retailUnitPrice * dto.quantity - totalPrice;

    return {
      ...dto,
      frameId: frame.id,
      frameLabel: frame.label,
      framePrice: frame.price,
      discountPercent,
      retailUnitPrice,
      estimatedUnitPrice,
      totalPrice,
      savings,
      quotedAt: new Date().toISOString(),
    };
  }

  async createBusinessInquiry(dto: CreateBusinessInquiryDto) {
    const contactName = dto.contactName ?? dto.contactPerson;

    if (!contactName) {
      throw new BadRequestException('Contact person is required');
    }

    const createdInquiry = await this.prisma.businessInquiry.create({
      data: {
        companyName: dto.companyName,
        contactName,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
      },
    });

    return {
      success: true,
      message: 'Business inquiry submitted successfully',
      data: createdInquiry,
    };
  }
}
