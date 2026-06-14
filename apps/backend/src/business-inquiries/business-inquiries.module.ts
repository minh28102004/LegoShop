import { Module } from '@nestjs/common';
import { BusinessInquiriesController } from './business-inquiries.controller';
import { BusinessInquiriesService } from './business-inquiries.service';

@Module({
  controllers: [BusinessInquiriesController],
  providers: [BusinessInquiriesService],
})
export class BusinessInquiriesModule {}
