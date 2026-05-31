import { Test, TestingModule } from '@nestjs/testing';
import { AdminBusinessInquiriesController } from './admin-business-inquiries.controller';

describe('AdminBusinessInquiriesController', () => {
  let controller: AdminBusinessInquiriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminBusinessInquiriesController],
    }).compile();

    controller = module.get<AdminBusinessInquiriesController>(AdminBusinessInquiriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
