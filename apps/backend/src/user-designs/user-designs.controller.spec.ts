import { Test, TestingModule } from '@nestjs/testing';
import { UserDesignsController } from './user-designs.controller';

describe('UserDesignsController', () => {
  let controller: UserDesignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDesignsController],
    }).compile();

    controller = module.get<UserDesignsController>(UserDesignsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
