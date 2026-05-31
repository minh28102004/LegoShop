import { Module } from '@nestjs/common';
import { AdminBusinessInquiriesController } from './admin-business-inquiries.controller';
import { AdminBusinessInquiriesService } from './admin-business-inquiries.service';

@Module({
  controllers: [AdminBusinessInquiriesController],
  providers: [AdminBusinessInquiriesService]
})
export class AdminBusinessInquiriesModule {}
