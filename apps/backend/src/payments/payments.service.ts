import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  APIError,
  PayOS,
  PayOSError,
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse,
  type Webhook as PayosSdkWebhook,
  type WebhookData as PayosSdkWebhookData,
} from '@payos/node';
import { PaymentStatus, PaymentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const PAYOS_MAX_DESCRIPTION_LENGTH = 25;
const PAYOS_MAX_SAFE_ORDER_CODE = Number.MAX_SAFE_INTEGER;
const PAYOS_MAX_SAFE_ORDER_CODE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
const PAYOS_PROVIDER = 'PAYOS';
const PAYOS_SIGNATURE_PATTERN = /^[a-f0-9]{64}$/i;

type PayosPaymentLogStatus = 'cancelled' | 'failed' | 'paid' | 'pending';

type PaymentWithOrder = Prisma.PaymentGetPayload<{
  include: {
    order: true;
  };
}>;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private envPresenceLogged = false;

  constructor(private readonly prisma: PrismaService) {}

  async createPayosPaymentLink(
    input: CreatePayosPaymentLinkInput,
  ): Promise<PayosPaymentLinkResult> {
    const config = this.getPayosRuntimeConfig();
    const amount = this.validatePositiveInteger(input.amount, 'Payment amount');
    const orderCode = this.validatePayosOrderCode(input.providerOrderCode);
    const description = this.normalizePayosDescription(input.description);
    const items = this.normalizePayosItems(input.items);

    this.assertItemsTotalMatchesAmount(items, amount);

    const payos = this.createPayosClient();

    const payload: CreatePaymentLinkRequest = {
      orderCode,
      amount,
      description,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      buyerPhone: input.buyerPhone,
      buyerAddress: input.buyerAddress,
      items,
      cancelUrl: config.cancelUrl,
      returnUrl: config.returnUrl,
    };

    let responseBody: CreatePaymentLinkResponse;

    try {
      responseBody = await payos.paymentRequests.create(payload);
    } catch (error) {
      throw this.createPayosGatewayException(
        error,
        'payOS could not create payment link',
      );
    }

    if (!responseBody.checkoutUrl || !responseBody.paymentLinkId) {
      throw new BadGatewayException('payOS did not return a checkout URL');
    }

    return {
      provider: PAYOS_PROVIDER,
      providerOrderCode: responseBody.orderCode ?? orderCode,
      providerPaymentLinkId: responseBody.paymentLinkId,
      checkoutUrl: responseBody.checkoutUrl,
      amount: responseBody.amount ?? amount,
      status: this.mapPayosProviderStatus(responseBody.status),
      rawResponse: this.toInputJsonValue(responseBody),
    };
  }

  async createTestPaymentLink() {
    const paymentLink = await this.createPayosPaymentLink({
      providerOrderCode: this.generateSafeProviderOrderCode(),
      amount: 2000,
      description: 'PayOS test payment',
      buyerName: 'PayOS Test Customer',
      buyerEmail: undefined,
      buyerPhone: '0900000000',
      buyerAddress: 'PayOS test address',
      items: [
        {
          name: 'PayOS test item',
          quantity: 1,
          price: 2000,
        },
      ],
    });

    return {
      checkoutUrl: paymentLink.checkoutUrl,
      orderCode: paymentLink.providerOrderCode,
    };
  }

  async cancelPayosPaymentLink(
    paymentLinkId: string,
    reason: string,
  ): Promise<boolean> {
    const payos = this.createPayosClient();

    try {
      await payos.paymentRequests.cancel(paymentLinkId, reason);
      return true;
    } catch {
      return false;
    }
  }

  async handlePayosWebhook(body: PayosWebhookBody) {
    const webhookData = await this.verifyPayosWebhook(body);
    const providerOrderCode = this.parsePayosOrderCodeToBigInt(
      webhookData.orderCode,
    );
    const paymentLinkId = this.getOptionalString(webhookData.paymentLinkId);

    const payment = await this.findWebhookPayment(
      providerOrderCode,
      paymentLinkId,
    );

    if (!payment) {
      return {
        success: true,
        message: 'payOS webhook received but payment was not found',
      };
    }

    const incomingStatus = this.mapWebhookPaymentStatus(body, webhookData);
    this.assertWebhookAmountMatchesPayment(
      payment,
      incomingStatus,
      this.parseOptionalPayosAmount(webhookData.amount),
    );
    const result = await this.applyWebhookPaymentStatus(
      payment.id,
      incomingStatus,
      this.toInputJsonValue(body),
    );

    return {
      success: true,
      message: result.message,
    };
  }

  private async verifyPayosWebhook(
    body: PayosWebhookBody,
  ): Promise<PayosSdkWebhookData> {
    if (!this.isPayosWebhookBody(body)) {
      throw new BadRequestException('Invalid payOS webhook payload');
    }

    if (!PAYOS_SIGNATURE_PATTERN.test(body.signature)) {
      throw new BadRequestException('Invalid payOS webhook signature format');
    }

    const orderCode = this.validatePayosOrderCode(
      Number(this.parsePayosOrderCodeToBigInt(body.data.orderCode)),
    );
    const normalizedWebhook = {
      code: body.code,
      desc: body.desc,
      success: body.success,
      signature: body.signature,
      data: {
        ...body.data,
        orderCode,
      },
    } as PayosSdkWebhook;

    try {
      return await this.createPayosClient().webhooks.verify(normalizedWebhook);
    } catch (error) {
      if (error instanceof PayOSError) {
        throw new BadRequestException('Invalid payOS webhook signature');
      }

      throw error;
    }
  }

  private createPayosClient(): PayOS {
    const config = this.getPayosRuntimeConfig();

    return new PayOS({
      clientId: config.clientId,
      apiKey: config.apiKey,
      checksumKey: config.checksumKey,
      partnerCode: config.partnerCode,
      baseURL: config.baseUrl,
      logLevel: 'off',
      maxRetries: 2,
      timeout: 30_000,
    });
  }

  private getPayosRuntimeConfig(): PayosRuntimeConfig {
    this.logPayosEnvironmentPresence();

    const clientId = this.getRequiredProcessEnvValue('PAYOS_CLIENT_ID');
    const apiKey = this.getRequiredProcessEnvValue('PAYOS_API_KEY');
    const checksumKey = this.getRequiredProcessEnvValue('PAYOS_CHECKSUM_KEY');
    const returnUrl = this.getRequiredProcessEnvValue('PAYOS_RETURN_URL');
    const cancelUrl = this.getRequiredProcessEnvValue('PAYOS_CANCEL_URL');
    const baseUrl = this.getOptionalProcessEnvValue('PAYOS_BASE_URL');
    const partnerCode = this.getOptionalProcessEnvValue('PAYOS_PARTNER_CODE');

    return {
      clientId,
      apiKey,
      checksumKey,
      returnUrl,
      cancelUrl,
      baseUrl: baseUrl ? this.normalizeBaseUrl(baseUrl) : undefined,
      partnerCode,
    };
  }

  private logPayosEnvironmentPresence() {
    if (this.envPresenceLogged) {
      return;
    }

    for (const key of [
      'PAYOS_CLIENT_ID',
      'PAYOS_API_KEY',
      'PAYOS_CHECKSUM_KEY',
      'PAYOS_RETURN_URL',
      'PAYOS_CANCEL_URL',
      'PAYOS_BASE_URL',
    ]) {
      this.logger.log(`${key} loaded: ${Boolean(process.env[key]?.trim())}`);
    }

    this.envPresenceLogged = true;
  }

  private getRequiredProcessEnvValue(key: string): string {
    const value = process.env[key]?.trim();

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`);
    }

    return value;
  }

  private getOptionalProcessEnvValue(key: string): string | undefined {
    const value = process.env[key]?.trim();

    return value || undefined;
  }

  private normalizeBaseUrl(value: string): string {
    const normalized = value.trim().replace(/\/+$/, '');

    try {
      const url = new URL(normalized);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }

      return normalized;
    } catch {
      throw new ServiceUnavailableException('PAYOS_BASE_URL is invalid');
    }
  }

  private createPayosGatewayException(error: unknown, fallbackMessage: string) {
    if (error instanceof APIError) {
      return new BadGatewayException(
        error.desc ?? error.message ?? fallbackMessage,
      );
    }

    if (error instanceof PayOSError) {
      return new BadGatewayException(error.message || fallbackMessage);
    }

    return new BadGatewayException(fallbackMessage);
  }

  private mapWebhookPaymentStatus(
    body: PayosWebhookBody,
    data: PayosWebhookData | PayosSdkWebhookData,
  ): PayosPaymentLogStatus {
    const explicitStatus = this.getOptionalString(
      (data as Record<string, unknown>).status,
    );

    if (explicitStatus) {
      return this.mapPayosProviderStatus(explicitStatus);
    }

    if (body.success && body.code === '00' && data.code === '00') {
      return 'paid';
    }

    const statusText = this.normalizeStatusText(
      this.getOptionalString(data.desc) ?? body.desc,
    );

    return statusText.includes('cancel') || statusText.includes('huy')
      ? 'cancelled'
      : 'failed';
  }

  private normalizePayosDescription(description: string): string {
    const normalized = description
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return (normalized || 'LegoShop').slice(0, PAYOS_MAX_DESCRIPTION_LENGTH);
  }

  private validatePayosOrderCode(orderCode: number): number {
    if (
      !Number.isSafeInteger(orderCode) ||
      orderCode <= 0 ||
      orderCode > PAYOS_MAX_SAFE_ORDER_CODE
    ) {
      throw new BadRequestException('Invalid payOS order code');
    }

    return orderCode;
  }

  private validatePositiveInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }

    return value;
  }

  private validateNonNegativeInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new BadRequestException(`${label} must be a non-negative integer`);
    }

    return value;
  }

  private normalizePayosItems(items: PayosPaymentItem[]): PayosPaymentItem[] {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Payment items are required');
    }

    return items.map((item, index) => {
      if (!this.isRecord(item)) {
        throw new BadRequestException(`Payment item ${index + 1} is invalid`);
      }

      const name =
        typeof item.name === 'string'
          ? this.normalizePayosItemName(item.name)
          : '';

      if (!name) {
        throw new BadRequestException(
          `Payment item ${index + 1} name is required`,
        );
      }

      return {
        name,
        quantity: this.validatePositiveInteger(
          item.quantity,
          `Payment item ${index + 1} quantity`,
        ),
        price: this.validateNonNegativeInteger(
          item.price,
          `Payment item ${index + 1} price`,
        ),
      };
    });
  }

  private normalizePayosItemName(name: string): string {
    return name.replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  private assertItemsTotalMatchesAmount(
    items: PayosPaymentItem[],
    amount: number,
  ) {
    const itemsTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    if (itemsTotal !== amount) {
      throw new BadRequestException('Payment items total must match amount');
    }
  }

  private parseOptionalPayosAmount(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return this.validateNonNegativeInteger(value, 'payOS webhook amount');
    }

    if (typeof value === 'string') {
      const normalizedAmount = value.trim();

      if (!normalizedAmount) {
        return undefined;
      }

      const parsedAmount = Number(normalizedAmount);

      return this.validateNonNegativeInteger(
        parsedAmount,
        'payOS webhook amount',
      );
    }

    throw new BadRequestException('Invalid payOS webhook amount');
  }

  private assertWebhookAmountMatchesPayment(
    payment: PaymentWithOrder,
    incomingStatus: PayosPaymentLogStatus,
    amount?: number,
  ) {
    if (incomingStatus !== 'paid') {
      return;
    }

    if (amount === undefined) {
      throw new BadRequestException('Missing payOS webhook amount');
    }

    if (amount !== payment.amount) {
      throw new BadRequestException('payOS webhook amount does not match');
    }
  }

  private generateSafeProviderOrderCode(): number {
    const providerOrderCode =
      Date.now() * 1_000 + Math.floor(Math.random() * 1_000);

    return this.validatePayosOrderCode(providerOrderCode);
  }

  private async findWebhookPayment(
    providerOrderCode: bigint,
    paymentLinkId?: string,
  ): Promise<PaymentWithOrder | null> {
    return this.prisma.payment.findFirst({
      where: {
        OR: [
          { providerOrderCode },
          ...(paymentLinkId ? [{ providerPaymentLinkId: paymentLinkId }] : []),
        ],
      },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async applyWebhookPaymentStatus(
    paymentId: string,
    incomingStatus: PayosPaymentLogStatus,
    rawWebhook: Prisma.InputJsonValue,
  ): Promise<{ message: string }> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true,
        },
      });

      if (!payment) {
        return {
          message: 'payOS webhook ignored because payment was not found',
        };
      }

      if (this.shouldIgnoreWebhook(payment, incomingStatus)) {
        return { message: 'payOS webhook already processed' };
      }

      const paidAt =
        incomingStatus === 'paid' ? (payment.paidAt ?? new Date()) : undefined;

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: incomingStatus,
          rawWebhook,
          paidAt,
        },
      });

      const orderUpdate = this.createOrderUpdateForWebhook(
        payment,
        incomingStatus,
        paidAt,
      );

      if (orderUpdate) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: orderUpdate,
        });
      }

      return { message: 'payOS webhook processed successfully' };
    });
  }

  private shouldIgnoreWebhook(
    payment: PaymentWithOrder,
    incomingStatus: PayosPaymentLogStatus,
  ): boolean {
    const paymentAlreadyPaid =
      payment.status === 'paid' || Boolean(payment.paidAt);

    if (paymentAlreadyPaid) {
      return true;
    }

    if (incomingStatus !== 'paid') {
      return false;
    }

    if (payment.type === PaymentType.cod_deposit) {
      return (
        payment.order.paymentStatus === PaymentStatus.deposit_paid ||
        payment.order.paymentStatus === PaymentStatus.paid ||
        payment.order.depositStatus === 'paid'
      );
    }

    return payment.order.paymentStatus === PaymentStatus.paid;
  }

  private createOrderUpdateForWebhook(
    payment: PaymentWithOrder,
    incomingStatus: PayosPaymentLogStatus,
    paidAt?: Date,
  ): Prisma.OrderUpdateInput | undefined {
    if (incomingStatus === 'pending') {
      return undefined;
    }

    if (payment.status === 'replaced' && incomingStatus !== 'paid') {
      return undefined;
    }

    if (incomingStatus === 'paid') {
      return payment.type === PaymentType.cod_deposit
        ? {
            paymentStatus: PaymentStatus.deposit_paid,
            depositStatus: 'paid',
            depositPaidAt: paidAt,
          }
        : {
            paymentStatus: PaymentStatus.paid,
            remainingAmount: 0,
            paidAt,
          };
    }

    if (payment.type === PaymentType.cod_deposit) {
      return {
        paymentStatus: PaymentStatus.deposit_pending,
        depositStatus: incomingStatus,
      };
    }

    return {
      paymentStatus:
        incomingStatus === 'cancelled'
          ? PaymentStatus.cancelled
          : PaymentStatus.failed,
    };
  }

  private isPayosWebhookBody(value: unknown): value is PayosWebhookBody {
    if (!this.isRecord(value) || !this.isRecord(value.data)) {
      return false;
    }

    return (
      typeof value.code === 'string' &&
      typeof value.desc === 'string' &&
      typeof value.success === 'boolean' &&
      typeof value.signature === 'string' &&
      this.isPayosOrderCodeLike(value.data.orderCode)
    );
  }

  private isPayosOrderCodeLike(value: unknown): value is PayosOrderCodeInput {
    try {
      this.parsePayosOrderCodeToBigInt(value);
      return true;
    } catch {
      return false;
    }
  }

  private parsePayosOrderCodeToBigInt(value: unknown): bigint {
    if (typeof value === 'number') {
      if (!Number.isSafeInteger(value) || value <= 0) {
        throw new BadRequestException('Invalid payOS webhook orderCode');
      }

      return BigInt(value);
    }

    if (typeof value === 'string') {
      const normalized = value.trim();

      if (!/^[1-9]\d*$/.test(normalized)) {
        throw new BadRequestException('Invalid payOS webhook orderCode');
      }

      const bigintValue = BigInt(normalized);

      if (bigintValue > PAYOS_MAX_SAFE_ORDER_CODE_BIGINT) {
        throw new BadRequestException('payOS webhook orderCode is not safe');
      }

      return bigintValue;
    }

    throw new BadRequestException('Missing payOS webhook orderCode');
  }

  private mapPayosProviderStatus(status?: string): PayosPaymentLogStatus {
    const normalized = this.normalizeStatusText(status ?? '');

    if (normalized === 'paid') {
      return 'paid';
    }

    if (normalized === 'cancelled' || normalized === 'canceled') {
      return 'cancelled';
    }

    if (normalized === 'failed' || normalized === 'expired') {
      return 'failed';
    }

    return 'pending';
  }

  private normalizeStatusText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private getOptionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private toInputJsonValue(value: unknown): Prisma.InputJsonValue {
    if (value === null) {
      return 'null';
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) =>
        item === null ? null : this.toInputJsonValue(item),
      );
    }

    if (this.isRecord(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          item === null ? null : this.toInputJsonValue(item),
        ]),
      );
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (typeof value === 'symbol') {
      return value.description ?? '';
    }

    return '';
  }
}

export type CreatePayosPaymentLinkInput = {
  providerOrderCode: number;
  amount: number;
  description: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  buyerAddress: string;
  items: PayosPaymentItem[];
};

export type PayosPaymentItem = {
  name: string;
  quantity: number;
  price: number;
};

export type PayosPaymentLinkResult = {
  provider: 'PAYOS';
  providerOrderCode: number;
  providerPaymentLinkId: string;
  checkoutUrl: string;
  amount: number;
  status: string;
  rawResponse: Prisma.InputJsonValue;
};

export type PayosWebhookBody = {
  code: string;
  desc: string;
  success: boolean;
  data: PayosWebhookData;
  signature: string;
};

export type PayosWebhookData = Record<string, unknown> & {
  orderCode: PayosOrderCodeInput;
  amount?: number;
  code?: string;
  desc?: string;
  paymentLinkId?: string;
  status?: string;
};

type PayosOrderCodeInput = number | string;

type PayosRuntimeConfig = {
  clientId: string;
  apiKey: string;
  checksumKey: string;
  returnUrl: string;
  cancelUrl: string;
  baseUrl?: string;
  partnerCode?: string;
};
