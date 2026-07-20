import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFrameSizeDto } from './dto/create-frame-size.dto';
import { UpdateFrameSizeDto } from './dto/update-frame-size.dto';

@Injectable()
export class FrameSizesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.frameSize.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const frameSize = await this.prisma.frameSize.findUnique({ where: { id } });
    if (!frameSize) throw new NotFoundException();
    return frameSize;
  }

  async create(data: CreateFrameSizeDto) {
    return this.prisma.frameSize.create({ data });
  }

  async update(id: string, data: UpdateFrameSizeDto) {
    return this.prisma.frameSize.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.frameSize.delete({ where: { id } });
  }
}
