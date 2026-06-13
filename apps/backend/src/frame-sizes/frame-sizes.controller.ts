import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FrameSizesService } from './frame-sizes.service';
import { CreateFrameSizeDto } from './dto/create-frame-size.dto';
import { UpdateFrameSizeDto } from './dto/update-frame-size.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('FrameSizes')
@Controller()
export class FrameSizesController {
  constructor(private readonly frameSizesService: FrameSizesService) {}

  @Get('public/frame-sizes')
  findAllPublic() {
    return this.frameSizesService.findAll();
  }

  @Get('admin/frame-sizes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllAdmin() {
    return this.frameSizesService.findAll();
  }

  @Get('admin/frame-sizes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.frameSizesService.findOne(id);
  }

  @Post('admin/frame-sizes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createDto: CreateFrameSizeDto) {
    return this.frameSizesService.create(createDto);
  }

  @Patch('admin/frame-sizes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFrameSizeDto,
  ) {
    return this.frameSizesService.update(id, updateDto);
  }

  @Delete('admin/frame-sizes/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.frameSizesService.remove(id);
  }
}
