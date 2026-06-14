import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FrameColorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.frameColor.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async findOne(id: string) {
    const frameColor = await this.prisma.frameColor.findUnique({ where: { id } });
    if (!frameColor) throw new NotFoundException();
    return frameColor;
  }

  async create(data: any) {
    return this.prisma.frameColor.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.frameColor.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.frameColor.delete({ where: { id } });
  }
}
