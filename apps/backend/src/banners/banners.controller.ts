import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('Banners')
@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('public/banners')
  findPublicBanners() {
    return this.bannersService.findPublicBanners();
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminBanners() {
    return this.bannersService.findAdminBanners();
  }

  @Get('admin/banners/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminBannerById(@Param('id') id: string) {
    return this.bannersService.findAdminBannerById(id);
  }

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createBanner(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.createBanner(createBannerDto);
  }

  @Patch('admin/banners/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateBanner(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.updateBanner(id, updateBannerDto);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }
}
