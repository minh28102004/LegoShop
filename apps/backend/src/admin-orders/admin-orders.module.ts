import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [PaymentsModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService]
})
export class AdminOrdersModule {}
