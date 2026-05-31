import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  findAdminBusinessInquiries() {
    return this.adminBusinessInquiriesService.findAdminBusinessInquiries();
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
