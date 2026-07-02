import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';

@Injectable()
export class PaymentSettingsService {
  private static readonly DEFAULT_ID = 'default-payment-setting';

  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existingSettings = await this.prisma.paymentSetting.findUnique({
      where: { id: PaymentSettingsService.DEFAULT_ID },
    });

    if (existingSettings) {
      return existingSettings;
    }

    return this.prisma.paymentSetting.create({
      data: {
        id: PaymentSettingsService.DEFAULT_ID,
        codEnabled: true,
        payosEnabled: true,
        codDepositEnabled: true,
        codDepositPercent: 30,
      },
    });
  }

  async updateSettings(dto: UpdatePaymentSettingsDto) {
    const currentSettings = await this.getSettings();

    const data: {
      codEnabled?: boolean;
      payosEnabled?: boolean;
      codDepositEnabled?: boolean;
      codDepositPercent?: number;
    } = {};

    if (dto.codEnabled !== undefined) data.codEnabled = dto.codEnabled;
    if (dto.payosEnabled !== undefined) data.payosEnabled = dto.payosEnabled;
    if (dto.codDepositEnabled !== undefined) {
      data.codDepositEnabled = dto.codDepositEnabled;
    }

    const nextCodDepositEnabled =
      dto.codDepositEnabled ?? currentSettings.codDepositEnabled;

    if (!nextCodDepositEnabled) {
      data.codDepositPercent = 0;
    } else if (dto.codDepositPercent !== undefined) {
      data.codDepositPercent = dto.codDepositPercent;
    }

    if (Object.keys(data).length === 0) {
      return currentSettings;
    }

    return this.prisma.paymentSetting.update({
      where: { id: PaymentSettingsService.DEFAULT_ID },
      data,
    });
  }
}
