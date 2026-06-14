import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import type { PayosWebhookBody } from './payments.service';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/payos/webhook')
  handlePayosWebhook(@Body() body: PayosWebhookBody) {
    return this.paymentsService.handlePayosWebhook(body);
  }

  @Post('payment/test')
  createTestPaymentLink() {
    return this.paymentsService.createTestPaymentLink();
  }
}
