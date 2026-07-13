import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserDesignsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { name?: string; designData: any; previewUrl?: string }) {
    return this.prisma.userDesign.create({
      data: {
        userId,
        name: data.name ?? 'My Design',
        designData: data.designData as Prisma.InputJsonValue,
        previewUrl: data.previewUrl,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.userDesign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const design = await this.prisma.userDesign.findFirst({
      where: { id, userId },
    });
    if (!design) throw new NotFoundException('Design not found');
    return design;
  }

  async update(userId: string, id: string, data: { name?: string; designData?: any; previewUrl?: string }) {
    await this.findOne(userId, id); // check exist
    return this.prisma.userDesign.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.designData && { designData: data.designData as Prisma.InputJsonValue }),
        ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // check exist
    return this.prisma.userDesign.delete({
      where: { id },
    });
  }
}
