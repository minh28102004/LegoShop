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
import { AccessoryCategoriesService } from './accessory-categories.service';
import { CreateAccessoryCategoryDto } from './dto/create-accessory-category.dto';
import { UpdateAccessoryCategoryDto } from './dto/update-accessory-category.dto';

@ApiTags('Accessory Categories')
@Controller()
export class AccessoryCategoriesController {
  constructor(
    private readonly accessoryCategoriesService: AccessoryCategoriesService,
  ) {}

  @Get('public/accessory-categories')
  findPublicAccessoryCategories() {
    return this.accessoryCategoriesService.findPublicAccessoryCategories();
  }

  @Get('admin/accessory-categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminAccessoryCategories(@Query() query: AdminListQueryDto) {
    return this.accessoryCategoriesService.findAdminAccessoryCategories(query);
  }

  @Get('admin/accessory-categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminAccessoryCategoryById(@Param('id') id: string) {
    return this.accessoryCategoriesService.findAdminAccessoryCategoryById(id);
  }

  @Post('admin/accessory-categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createAccessoryCategory(
    @Body() createAccessoryCategoryDto: CreateAccessoryCategoryDto,
  ) {
    return this.accessoryCategoriesService.createAccessoryCategory(
      createAccessoryCategoryDto,
    );
  }

  @Patch('admin/accessory-categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateAccessoryCategory(
    @Param('id') id: string,
    @Body() updateAccessoryCategoryDto: UpdateAccessoryCategoryDto,
  ) {
    return this.accessoryCategoriesService.updateAccessoryCategory(
      id,
      updateAccessoryCategoryDto,
    );
  }

  @Delete('admin/accessory-categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteAccessoryCategory(@Param('id') id: string) {
    return this.accessoryCategoriesService.deleteAccessoryCategory(id);
  }
}
