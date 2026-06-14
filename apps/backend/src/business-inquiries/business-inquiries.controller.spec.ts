import { Test, TestingModule } from '@nestjs/testing';
import { BusinessInquiriesController } from './business-inquiries.controller';
import { BusinessInquiriesService } from './business-inquiries.service';

describe('BusinessInquiriesController', () => {
  let controller: BusinessInquiriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessInquiriesController],
      providers: [
        {
          provide: BusinessInquiriesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BusinessInquiriesController>(
      BusinessInquiriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
