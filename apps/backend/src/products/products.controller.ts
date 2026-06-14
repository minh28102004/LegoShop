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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('public/products')
  findPublicProducts() {
    return this.productsService.findPublicProducts();
  }

  @Get('public/products/:slug')
  findPublicProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findPublicProductBySlug(slug);
  }

  @Get('admin/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminProducts(@Query() query: AdminListQueryDto) {
    return this.productsService.findAdminProducts(query);
  }

  @Get('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminProductById(@Param('id') id: string) {
    return this.productsService.findAdminProductById(id);
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }
}
