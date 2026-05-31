import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentSettingsModule } from '../payment-settings/payment-settings.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [PaymentSettingsModule],
})
export class OrdersModule {}
