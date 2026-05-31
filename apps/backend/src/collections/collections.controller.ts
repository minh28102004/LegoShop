import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@ApiTags('Collections')
@Controller()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get('public/collections')
  findPublicCollections() {
    return this.collectionsService.findPublicCollections();
  }

  @Get('public/collections/:slug')
  findPublicCollectionBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findPublicCollectionBySlug(slug);
  }

  @Get('admin/collections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCollections() {
    return this.collectionsService.findAdminCollections();
  }

  @Get('admin/collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminCollectionById(@Param('id') id: string) {
    return this.collectionsService.findAdminCollectionById(id);
  }

  @Post('admin/collections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createCollection(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.createCollection(createCollectionDto);
  }

  @Patch('admin/collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateCollection(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.updateCollection(id, updateCollectionDto);
  }

  @Delete('admin/collections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteCollection(@Param('id') id: string) {
    return this.collectionsService.deleteCollection(id);
  }
}
