import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';
import { PaymentSettingsService } from './payment-settings.service';

@ApiTags('Payment Settings')
@Controller()
export class PaymentSettingsController {
  constructor(
    private readonly paymentSettingsService: PaymentSettingsService,
  ) {}

  @Get('public/payment-settings')
  getPublicSettings() {
    return this.paymentSettingsService.getSettings();
  }

  @Get('admin/payment-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAdminSettings() {
    return this.paymentSettingsService.getSettings();
  }

  @Patch('admin/payment-settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateSettings(@Body() updatePaymentSettingsDto: UpdatePaymentSettingsDto) {
    return this.paymentSettingsService.updateSettings(updatePaymentSettingsDto);
  }
}
