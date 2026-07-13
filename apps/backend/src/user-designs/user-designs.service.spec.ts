import { Test, TestingModule } from '@nestjs/testing';
import { UserDesignsService } from './user-designs.service';

describe('UserDesignsService', () => {
  let service: UserDesignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDesignsService],
    }).compile();

    service = module.get<UserDesignsService>(UserDesignsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
