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
import { CreateFrameBackgroundDto } from './dto/create-frame-background.dto';
import { UpdateFrameBackgroundDto } from './dto/update-frame-background.dto';
import { FrameBackgroundsService } from './frame-backgrounds.service';

@ApiTags('FrameBackgrounds')
@Controller()
export class FrameBackgroundsController {
  constructor(private readonly frameBackgroundsService: FrameBackgroundsService) {}

  @Get('public/frame-backgrounds')
  findPublicBackgrounds(@Query('frameOptionId') frameOptionId?: string) {
    return this.frameBackgroundsService.findPublicBackgrounds(frameOptionId);
  }

  @Get('admin/frame-backgrounds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminBackgrounds(@Query() query: AdminListQueryDto) {
    return this.frameBackgroundsService.findAdminBackgrounds(query);
  }

  @Get('admin/frame-backgrounds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminBackgroundById(@Param('id') id: string) {
    return this.frameBackgroundsService.findAdminBackgroundById(id);
  }

  @Post('admin/frame-backgrounds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createBackground(@Body() createFrameBackgroundDto: CreateFrameBackgroundDto) {
    return this.frameBackgroundsService.createBackground(createFrameBackgroundDto);
  }

  @Patch('admin/frame-backgrounds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateBackground(
    @Param('id') id: string,
    @Body() updateFrameBackgroundDto: UpdateFrameBackgroundDto,
  ) {
    return this.frameBackgroundsService.updateBackground(id, updateFrameBackgroundDto);
  }

  @Delete('admin/frame-backgrounds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteBackground(@Param('id') id: string) {
    return this.frameBackgroundsService.deleteBackground(id);
  }
}
