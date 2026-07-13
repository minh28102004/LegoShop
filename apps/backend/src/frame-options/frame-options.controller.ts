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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FrameOptionType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFrameOptionDto } from './dto/create-frame-option.dto';
import { FrameOptionsQueryDto } from './dto/frame-options-query.dto';
import { UpdateFrameOptionDto } from './dto/update-frame-option.dto';
import { FrameOptionsService } from './frame-options.service';

@ApiTags('FrameOptions')
@Controller()
export class FrameOptionsController {
  constructor(private readonly frameOptionsService: FrameOptionsService) {}

  @Get('public/frame-options')
  @ApiQuery({ name: 'type', enum: FrameOptionType, required: false })
  findPublicOptions(@Query('type') type?: FrameOptionType) {
    return this.frameOptionsService.findPublicOptions(type);
  }

  @Get('admin/frame-options')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminOptions(@Query() query: FrameOptionsQueryDto) {
    return this.frameOptionsService.findAdminOptions(query);
  }

  @Get('admin/frame-options/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminOptionById(@Param('id') id: string) {
    return this.frameOptionsService.findAdminOptionById(id);
  }

  @Post('admin/frame-options')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createOption(@Body() createFrameOptionDto: CreateFrameOptionDto) {
    return this.frameOptionsService.createOption(createFrameOptionDto);
  }

  @Patch('admin/frame-options/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateOption(
    @Param('id') id: string,
    @Body() updateFrameOptionDto: UpdateFrameOptionDto,
  ) {
    return this.frameOptionsService.updateOption(id, updateFrameOptionDto);
  }

  @Delete('admin/frame-options/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteOption(@Param('id') id: string) {
    return this.frameOptionsService.deleteOption(id);
  }
}
