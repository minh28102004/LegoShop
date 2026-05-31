import { Test, TestingModule } from '@nestjs/testing';
import { BusinessInquiriesService } from './business-inquiries.service';

describe('BusinessInquiriesService', () => {
  let service: BusinessInquiriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessInquiriesService],
    }).compile();

    service = module.get<BusinessInquiriesService>(BusinessInquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
