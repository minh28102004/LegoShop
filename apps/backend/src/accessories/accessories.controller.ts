import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessoriesService } from './accessories.service';
import { CreateAccessoryDto } from './dto/create-accessory.dto';
import { UpdateAccessoryDto } from './dto/update-accessory.dto';

@ApiTags('Accessories')
@Controller()
export class AccessoriesController {
  constructor(private readonly accessoriesService: AccessoriesService) {}

  @Get('public/accessories')
  findPublicAccessories() {
    return this.accessoriesService.findPublicAccessories();
  }

  @Get('public/accessories/:id')
  findPublicAccessoryById(@Param('id') id: string) {
    return this.accessoriesService.findPublicAccessoryById(id);
  }

  @Get('admin/accessories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminAccessories() {
    return this.accessoriesService.findAdminAccessories();
  }

  @Get('admin/accessories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminAccessoryById(@Param('id') id: string) {
    return this.accessoriesService.findAdminAccessoryById(id);
  }

  @Post('admin/accessories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createAccessory(@Body() createAccessoryDto: CreateAccessoryDto) {
    return this.accessoriesService.createAccessory(createAccessoryDto);
  }

  @Patch('admin/accessories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateAccessory(
    @Param('id') id: string,
    @Body() updateAccessoryDto: UpdateAccessoryDto,
  ) {
    return this.accessoriesService.updateAccessory(id, updateAccessoryDto);
  }

  @Delete('admin/accessories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteAccessory(@Param('id') id: string) {
    return this.accessoriesService.deleteAccessory(id);
  }
}
