import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminListQueryDto } from '../common/dto/admin-list-query.dto';
import { UpdateBusinessInquiryStatusDto } from './dto/update-business-inquiry-status.dto';
import { AdminBusinessInquiriesService } from './admin-business-inquiries.service';

@ApiTags('Admin Business Inquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminBusinessInquiriesController {
  constructor(
    private readonly adminBusinessInquiriesService: AdminBusinessInquiriesService,
  ) {}

  @Get('admin/business-inquiries')
  findAdminBusinessInquiries(@Query() query: AdminListQueryDto) {
    return this.adminBusinessInquiriesService.findAdminBusinessInquiries(query);
  }

  @Get('admin/business-inquiries/:id')
  findAdminBusinessInquiryById(@Param('id') id: string) {
    return this.adminBusinessInquiriesService.findAdminBusinessInquiryById(id);
  }

  @Patch('admin/business-inquiries/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateBusinessInquiryStatusDto: UpdateBusinessInquiryStatusDto,
  ) {
    return this.adminBusinessInquiriesService.updateStatus(
      id,
      updateBusinessInquiryStatusDto,
    );
  }
}
