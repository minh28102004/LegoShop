import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { CreateTemplateCategoryDto } from './dto/create-template-category.dto';
import { UpdateTemplateCategoryDto } from './dto/update-template-category.dto';
import { TemplateCategoriesService } from './template-categories.service';

@ApiTags('Template Categories')
@Controller()
export class TemplateCategoriesController {
  constructor(
    private readonly templateCategoriesService: TemplateCategoriesService,
  ) {}

  @Get('public/template-categories')
  findPublicTemplateCategories() {
    return this.templateCategoriesService.findPublicTemplateCategories();
  }

  @Get('admin/template-categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminTemplateCategories(@Query() query: AdminListQueryDto) {
    return this.templateCategoriesService.findAdminTemplateCategories(query);
  }

  @Get('admin/template-categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminTemplateCategoryById(@Param('id') id: string) {
    return this.templateCategoriesService.findAdminTemplateCategoryById(id);
  }

  @Post('admin/template-categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createTemplateCategory(
    @Body() createTemplateCategoryDto: CreateTemplateCategoryDto,
  ) {
    return this.templateCategoriesService.createTemplateCategory(
      createTemplateCategoryDto,
    );
  }

  @Patch('admin/template-categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateTemplateCategory(
    @Param('id') id: string,
    @Body() updateTemplateCategoryDto: UpdateTemplateCategoryDto,
  ) {
    return this.templateCategoriesService.updateTemplateCategory(
      id,
      updateTemplateCategoryDto,
    );
  }

  @Delete('admin/template-categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteTemplateCategory(@Param('id') id: string) {
    return this.templateCategoriesService.deleteTemplateCategory(id);
  }
}
