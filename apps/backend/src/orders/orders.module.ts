import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentSettingsModule } from '../payment-settings/payment-settings.module';
import { PaymentsModule } from '../payments/payments.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    PaymentSettingsModule,
    PaymentsModule,
    VouchersModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 8,
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
