import { Module } from '@nestjs/common';
import { PaymentSettingsModule } from '../payment-settings/payment-settings.module';
import { PaymentsModule } from '../payments/payments.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PaymentSettingsModule, PaymentsModule, VouchersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
