import { Test, TestingModule } from '@nestjs/testing';
import { AdminBusinessInquiriesService } from './admin-business-inquiries.service';

describe('AdminBusinessInquiriesService', () => {
  let service: AdminBusinessInquiriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminBusinessInquiriesService],
    }).compile();

    service = module.get<AdminBusinessInquiriesService>(AdminBusinessInquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
