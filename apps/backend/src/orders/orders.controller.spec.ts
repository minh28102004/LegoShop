import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  const trackOrdersByPhone = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60_000,
            limit: 8,
          },
        ]),
      ],
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            trackOrdersByPhone,
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('tracks orders using only the checkout phone number', async () => {
    trackOrdersByPhone.mockResolvedValueOnce({ orders: [] });

    await expect(
      controller.trackOrdersByPhone({ phone: '0909123456' }),
    ).resolves.toEqual({ orders: [] });
    expect(trackOrdersByPhone).toHaveBeenCalledWith('0909123456');
  });
});
