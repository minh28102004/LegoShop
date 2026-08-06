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
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('Feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('public/feedback')
  findPublicFeedback() {
    return this.feedbackService.findPublicFeedback();
  }

  @Get('admin/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminFeedback(@Query() query: AdminListQueryDto) {
    return this.feedbackService.findAdminFeedback(query);
  }

  @Get('admin/feedback/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAdminFeedbackById(@Param('id') id: string) {
    return this.feedbackService.findAdminFeedbackById(id);
  }

  @Post('admin/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createFeedback(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(dto);
  }

  @Patch('admin/feedback/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateFeedback(@Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    return this.feedbackService.updateFeedback(id, dto);
  }

  @Delete('admin/feedback/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteFeedback(@Param('id') id: string) {
    return this.feedbackService.deleteFeedback(id);
  }
}
