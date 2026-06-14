import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FrameColorsService } from './frame-colors.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFrameColorDto } from './dto/create-frame-color.dto';
import { UpdateFrameColorDto } from './dto/update-frame-color.dto';

@ApiTags('FrameColors')
@Controller()
export class FrameColorsController {
  constructor(private readonly frameColorsService: FrameColorsService) {}

  @Get('public/frame-colors')
  findAllPublic() {
    return this.frameColorsService.findAll();
  }

  @Get('admin/frame-colors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllAdmin() {
    return this.frameColorsService.findAll();
  }

  @Get('admin/frame-colors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.frameColorsService.findOne(id);
  }

  @Post('admin/frame-colors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createDto: CreateFrameColorDto) {
    return this.frameColorsService.create(createDto);
  }

  @Patch('admin/frame-colors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFrameColorDto,
  ) {
    return this.frameColorsService.update(id, updateDto);
  }

  @Delete('admin/frame-colors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.frameColorsService.remove(id);
  }
}
