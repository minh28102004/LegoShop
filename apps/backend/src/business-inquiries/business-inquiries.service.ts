import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessInquiryDto } from './dto/create-business-inquiry.dto';

@Injectable()
export class BusinessInquiriesService {
  constructor(private readonly prisma: PrismaService) {}

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
