import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateBusinessInquiryDto } from './dto/create-business-inquiry.dto';
import { BusinessQuoteDto } from './dto/business-quote.dto';
import { BusinessInquiriesService } from './business-inquiries.service';

@ApiTags('Business Inquiries')
@Controller()
export class BusinessInquiriesController {
  constructor(
    private readonly businessInquiriesService: BusinessInquiriesService,
  ) {}

  @Post('business-inquiries/quote')
  quoteBusinessGift(@Body() businessQuoteDto: BusinessQuoteDto) {
    return this.businessInquiriesService.quoteBusinessGift(businessQuoteDto);
  }

  @Post('business-inquiries')
  createBusinessInquiry(
    @Body() createBusinessInquiryDto: CreateBusinessInquiryDto,
  ) {
    return this.businessInquiriesService.createBusinessInquiry(
      createBusinessInquiryDto,
    );
  }
}
