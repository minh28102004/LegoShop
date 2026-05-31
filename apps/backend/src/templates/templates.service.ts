import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublicTemplates() {
    return this.prisma.template.findMany({
      where: {
        status: ProductStatus.active,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPublicTemplateById(id: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        id,
        status: ProductStatus.active,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  findAdminTemplates() {
    return this.prisma.template.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });
  }

  async findAdminTemplateById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  createTemplate(dto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
        configJson:
          dto.configJson !== undefined
            ? (dto.configJson as Prisma.InputJsonValue)
            : undefined,
        status: dto.status,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    const existingTemplate = await this.prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    const data: {
      name?: string;
      imageUrl?: string;
      configJson?: Prisma.InputJsonValue;
      status?: ProductStatus;
      categoryId?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.configJson !== undefined) {
      data.configJson = dto.configJson as Prisma.InputJsonValue;
    }

    return this.prisma.template.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteTemplate(id: string) {
    const existingTemplate = await this.prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Template deleted successfully',
    };
  }
}
