import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessInquiryStatusDto } from './dto/update-business-inquiry-status.dto';

@Injectable()
export class AdminBusinessInquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAdminBusinessInquiries() {
    return this.prisma.businessInquiry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAdminBusinessInquiryById(id: string) {
    const inquiry = await this.prisma.businessInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException('Business inquiry not found');
    }

    return inquiry;
  }

  async updateStatus(id: string, dto: UpdateBusinessInquiryStatusDto) {
    const existingInquiry = await this.prisma.businessInquiry.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingInquiry) {
      throw new NotFoundException('Business inquiry not found');
    }

    return this.prisma.businessInquiry.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }
}
